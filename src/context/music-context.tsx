
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { useTrip } from './trip-context';

const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));

export type Track = {
    id: string; // Changed to string for Spotify IDs
    title: string;
    artist: string;
    image: string;
    duration: string;
};

export type PlaylistItem = Track & { 
    addedByUser: boolean;
};

const initialPlaylist: PlaylistItem[] = [
    { id: '55mJdeMOo22iO3p2sQW3n3', title: 'Adonai', artist: 'Sarkodie', image: musicArtworks[3]?.imageUrl || '', duration: '4:02', addedByUser: false },
    { id: '3ODKjzmHanT7p12zG3zzxP', title: 'Accra Night', artist: 'E.L', image: musicArtworks[1]?.imageUrl || '', duration: '3:15', addedByUser: false },
];


type MusicContextType = {
  playlist: PlaylistItem[];
  nowPlaying: PlaylistItem | null;
  songProgress: number;
  isPlaylistOpen: boolean;
  isOnBus: boolean;
  setIsOnBus: (isOnBus: boolean) => void;
  setIsPlaylistOpen: (isOpen: boolean) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
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
    // Force reset to initial playlist for testing
    setPlaylist(initialPlaylist);
    if (initialPlaylist.length > 0) {
      setNowPlaying(initialPlaylist[0]);
    } else {
      setNowPlaying(null);
    }
    
    // We keep this to read the `isOnBus` status
    try {
      const storedIsOnBus = localStorage.getItem('eritas-music-isonbus');
      if (storedIsOnBus) {
        setIsOnBus(JSON.parse(storedIsOnBus));
      }
    } catch (error) {
        console.error("Failed to read isOnBus state from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if(isHydrated) {
        try {
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
  }, [nowPlaying, isHydrated, isOnBus]);


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
      const finishedSongId = nowPlaying?.id;
      
      let newPlaylist = playlist;
      if (finishedSongId) {
        newPlaylist = playlist.filter(p => p.id !== finishedSongId);
        setPlaylist(newPlaylist);
      }
      
      const nextSong = newPlaylist.find(song => song.id !== finishedSongId) || null;
      
      if (nextSong) {
        setNowPlaying(nextSong);
      } else {
        // End of playlist
        toast({ title: t('tripEndedTitle'), description: t('tripEndedDescription') });
        setIsOnBus(false);
        setNowPlaying(null);
        clearActiveTrip();
      }
      setSongProgress(0);
    }
  }, [songProgress, isOnBus, playlist, nowPlaying, toast, t, clearActiveTrip]);


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
    const newTrack: PlaylistItem = { ...track, addedByUser: true };
    setPlaylist(prev => [...prev, newTrack]);


    if (!nowPlaying) {
      setNowPlaying(newTrack);
    }

    toast({
      title: t('addedToPlaylistToastTitle'),
      description: t('addedToPlaylistToastDescription', { title: track.title, artist: track.artist }),
    });
  };

  const removeFromPlaylist = (trackId: string) => {
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
      // Logic for when the currently playing song is removed
      const remainingPlaylist = newPlaylist.filter(p => p.id !== trackId);
      const nextSong = remainingPlaylist[0] || null;
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
    <MusicContext.Provider value={{ 
        playlist, 
        nowPlaying, 
        songProgress, 
        isPlaylistOpen, 
        setIsPlaylistOpen, 
        addToPlaylist, 
        removeFromPlaylist, 
        setNowPlaying, 
        isOnBus, 
        setIsOnBus,
    }}>
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
