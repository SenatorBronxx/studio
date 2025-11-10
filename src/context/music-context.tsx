
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

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

type MusicContextType = {
  playlist: PlaylistItem[];
  nowPlaying: PlaylistItem | null;
  songProgress: number;
  isPlaylistOpen: boolean;
  setIsPlaylistOpen: (isOpen: boolean) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: number) => void;
  setNowPlaying: (track: PlaylistItem | null) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
  const [nowPlaying, setNowPlaying] = useState<PlaylistItem | null>(initialPlaylist[0] || null);
  const [songProgress, setSongProgress] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
    try {
      const storedPlaylist = localStorage.getItem('eritas-music-playlist');
      if (storedPlaylist) {
        setPlaylist(JSON.parse(storedPlaylist));
      }
      const storedNowPlaying = localStorage.getItem('eritas-music-nowplaying');
      if (storedNowPlaying) {
        const track = JSON.parse(storedNowPlaying);
        setNowPlaying(track);
        // Ensure the now playing track is in the playlist
        if (track && !JSON.parse(storedPlaylist || '[]').some((p: PlaylistItem) => p.id === track.id)) {
            setPlaylist(prev => [track, ...prev]);
        }
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
            if (nowPlaying) {
                localStorage.setItem('eritas-music-nowplaying', JSON.stringify(nowPlaying));
            } else {
                localStorage.removeItem('eritas-music-nowplaying');
            }
        } catch (error) {
            console.error("Failed to write music state to localStorage", error);
        }
    }
  }, [playlist, nowPlaying, isHydrated]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nowPlaying) {
      setSongProgress(0); // Reset progress when song changes
      const durationInSeconds = 180; // Mock duration of 3 minutes
      interval = setInterval(() => {
        setSongProgress(prev => {
          const nextProgress = prev + 100 / durationInSeconds;
          if (nextProgress >= 100) {
            // Move to next song
            const currentIndex = playlist.findIndex(p => p.id === nowPlaying.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            setNowPlaying(playlist[nextIndex] || null);
            return 0;
          }
          return nextProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [nowPlaying, playlist]);

  const addToPlaylist = (track: Track) => {
    if (playlist.find(t => t.id === track.id)) {
      toast({
        variant: 'destructive',
        title: 'Already in Playlist',
        description: `${track.title} is already in the bus playlist.`,
      });
      return;
    }
    const newTrack = { ...track, addedByUser: true };
    setPlaylist(prev => [...prev, newTrack]);

    if (!nowPlaying) {
      setNowPlaying(newTrack);
    }

    toast({
      title: 'Added to Playlist',
      description: `${track.title} by ${track.artist} has been added to the bus playlist.`,
    });
  };

  const removeFromPlaylist = (trackId: number) => {
    const songToRemove = playlist.find(t => t.id === trackId);
    if (!songToRemove || !songToRemove.addedByUser) {
      toast({
        variant: "destructive",
        title: "Cannot Remove",
        description: "You can only remove songs you have added.",
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
      title: 'Song Removed',
      description: 'The song has been removed from the playlist.',
    });
  };
  
  if (!isHydrated) return null;

  return (
    <MusicContext.Provider value={{ playlist, nowPlaying, songProgress, isPlaylistOpen, setIsPlaylistOpen, addToPlaylist, removeFromPlaylist, setNowPlaying }}>
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
