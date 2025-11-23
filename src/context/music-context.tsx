
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { useTrip } from './trip-context';

const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));

export type Track = {
    id: number;
    title: string;
    artist: string;
    image: string;
    duration: string;
};

export type PlaylistItem = Track & { addedByUser: boolean };

const initialPlaylist: PlaylistItem[] = [
    { id: 101, title: 'Accra Night', artist: 'E.L', image: musicArtworks[1]?.imageUrl || '', duration: '3:15', addedByUser: false },
    { id: 102, title: 'Adonai', artist: 'Sarkodie', image: musicArtworks[3]?.imageUrl || '', duration: '4:02', addedByUser: false },
];

// Mock song to simulate another user adding it
const mockCollaboratorSong: PlaylistItem = {
    id: 201,
    title: "Forever",
    artist: "Gyakie",
    image: musicArtworks[4]?.imageUrl || '',
    duration: "3:16",
    addedByUser: false,
};

type MusicContextType = {
  playlist: PlaylistItem[];
  nowPlaying: PlaylistItem | null;
  songProgress: number;
  isPlaylistOpen: boolean;
  isOnBus: boolean;
  setIsOnBus: (isOnBus: boolean) => void;
  setIsPlaylistOpen: (isOpen: boolean) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: number) => void;
  setNowPlaying: (track: PlaylistItem | null) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
  const [nowPlaying, setNowPlaying] = useState<PlaylistItem | null>(null);
  const [songProgress, setSongProgress] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isOnBus, setIsOnBus] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { clearActiveTrip } = useTrip();

   useEffect(() => {
    try {
      const storedPlaylist = localStorage.getItem('eritas-music-playlist');
      if (storedPlaylist) {
        setPlaylist(JSON.parse(storedPlaylist));
      } else {
        setPlaylist(initialPlaylist); // Set initial if nothing is stored
      }

      const storedNowPlaying = localStorage.getItem('eritas-music-nowplaying');
      if (storedNowPlaying) {
        const track = JSON.parse(storedNowPlaying);
        setNowPlaying(track);
        if (track && !playlist.some((p: PlaylistItem) => p.id === track.id)) {
             setPlaylist(prev => [track, ...prev]);
        }
      } else if (playlist.length > 0) {
        setNowPlaying(playlist[0]);
      }

      const storedIsOnBus = localStorage.getItem('eritas-music-isonbus');
      if (storedIsOnBus) {
        setIsOnBus(JSON.parse(storedIsOnBus));
      }
    } catch (error) {
        console.error("Failed to read music state from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if(isHydrated) {
        try {
            localStorage.setItem('eritas-music-playlist', JSON.stringify(playlist));
            localStorage.setItem('eritas-music-isonbus', JSON.stringify(isOnBus));
            if (nowPlaying) {
                localStorage.setItem('eritas-music-nowplaying', JSON.stringify(nowPlaying));
            } else {
                localStorage.removeItem('eritas-music-nowplaying');
            }
        } catch (error) {
            console.error("Failed to write music state to localStorage", error);
        }
    }
  }, [playlist, nowPlaying, isHydrated, isOnBus]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nowPlaying && isOnBus) {
      setSongProgress(0); // Reset progress when song changes
      const durationInSeconds = 180; // Mock duration of 3 minutes
      interval = setInterval(() => {
        setSongProgress(prev => {
          const nextProgress = prev + 100 / durationInSeconds;
          if (nextProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return nextProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [nowPlaying, isOnBus]);
  
  useEffect(() => {
    if (songProgress >= 100 && isOnBus) {
      // Logic to move to the next song
      const currentIndex = playlist.findIndex(p => p.id === nowPlaying?.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      if (playlist[nextIndex]) {
        setNowPlaying(playlist[nextIndex]);
      } else {
        // End of playlist
        toast({ title: t('tripEndedTitle'), description: t('tripEndedDescription') });
        setIsOnBus(false);
        setNowPlaying(null);
        clearActiveTrip(); // This will trigger the UI reset
      }
      setSongProgress(0); // Reset progress after handling
    }
  }, [songProgress, isOnBus, playlist, nowPlaying, toast, t, clearActiveTrip]);

  // Mock collaborator adding a song
  useEffect(() => {
    if (isOnBus) {
        const timer = setTimeout(() => {
            if (!playlist.some(t => t.id === mockCollaboratorSong.id)) {
                setPlaylist(prev => [...prev, mockCollaboratorSong]);
                toast({
                    title: "Someone added a song!",
                    description: `'${mockCollaboratorSong.title}' by ${mockCollaboratorSong.artist} was added to the playlist.`,
                });
            }
        }, 15000); // Simulate after 15 seconds
        return () => clearTimeout(timer);
    }
  }, [isOnBus, playlist, toast]);


  const addToPlaylist = (track: Track) => {
    if (!isOnBus) {
        toast({
            variant: 'destructive',
            title: t('notOnBusToastTitle'),
            description: t('notOnBusToastDescription'),
        });
        return;
    }

    if (playlist.find(t => t.id === track.id)) {
      toast({
        variant: 'destructive',
        title: t('alreadyInPlaylistToastTitle'),
        description: t('alreadyInPlaylistToastDescription', { title: track.title }),
      });
      return;
    }
    const newTrack = { ...track, addedByUser: true };
    setPlaylist(prev => [...prev, newTrack]);

    if (!nowPlaying) {
      setNowPlaying(newTrack);
    }

    toast({
      title: t('addedToPlaylistToastTitle'),
      description: t('addedToPlaylistToastDescription', { title: track.title, artist: track.artist }),
    });
  };

  const removeFromPlaylist = (trackId: number) => {
    const songToRemove = playlist.find(t => t.id === trackId);
    if (!songToRemove || !songToRemove.addedByUser) {
      toast({
        variant: "destructive",
        title: t('cannotRemoveSongToastTitle'),
        description: t('cannotRemoveSongToastDescription'),
      });
      return;
    }

    let newPlaylist = playlist.filter(t => t.id !== trackId);

    if (nowPlaying?.id === trackId) {
      const currentIndex = playlist.findIndex(p => p.id === trackId);
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSong = newPlaylist[nextIndex] || newPlaylist[0] || null;
      setNowPlaying(nextSong);
    }
    
    setPlaylist(newPlaylist);

    toast({
      title: t('songRemovedToastTitle'),
      description: t('songRemovedToastDescription'),
    });
  };
  
  if (!isHydrated) return null;

  return (
    <MusicContext.Provider value={{ playlist, nowPlaying, songProgress, isPlaylistOpen, setIsPlaylistOpen, addToPlaylist, removeFromPlaylist, setNowPlaying, isOnBus, setIsOnBus }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
