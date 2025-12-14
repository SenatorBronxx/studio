
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { useTrip } from './trip-context';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export type Track = {
    id: string;
    title: string;
    artist: string;
    image: string;
    duration: string;
};

export type PlaylistItem = Track & { 
    addedBy: string; // Firebase UID of the user who added it
};

type MusicContextType = {
  playlist: PlaylistItem[];
  nowPlaying: PlaylistItem | null;
  songProgress: number;
  isPlaylistOpen: boolean;
  isOnBus: boolean;
  setIsPlaylistOpen: (isOpen: boolean) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  setNowPlaying: (track: PlaylistItem | null) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { activeTrip, clearActiveTrip } = useTrip();
  const firestore = useFirestore();
  const { user } = useUser();

  // The playlist is now fetched from the active bus document
  const busRef = useMemoFirebase(() => {
    if (!firestore || !activeTrip) return null;
    return doc(firestore, 'buses', activeTrip.bus.id);
  }, [firestore, activeTrip]);

  const { data: busData } = useDoc<{ playlist: PlaylistItem[] }>(busRef);

  const playlist = busData?.playlist || [];
  
  const [nowPlaying, setNowPlaying] = useState<PlaylistItem | null>(null);
  const [songProgress, setSongProgress] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const isOnBus = !!activeTrip;

  // Simulate song progress and advancing to the next song
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nowPlaying && isOnBus) {
      setSongProgress(0); 
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
  
  // Auto-play logic
  useEffect(() => {
    if (isOnBus && playlist.length > 0 && !nowPlaying) {
      setNowPlaying(playlist[0]);
    }
    if (!isOnBus) {
        setNowPlaying(null);
    }
  }, [isOnBus, playlist, nowPlaying]);


  // Logic to advance the playlist
  useEffect(() => {
    if (songProgress >= 100 && isOnBus && nowPlaying && busRef) {
      // The song just finished, remove it from the remote playlist
      updateDoc(busRef, {
        playlist: arrayRemove(nowPlaying)
      });
      // The useDoc hook will handle updating the local state.
      // The next song will automatically start playing via the auto-play effect.
    }
  }, [songProgress, isOnBus, nowPlaying, busRef]);


  const addToPlaylist = (track: Track) => {
    if (!isOnBus) {
        toast({ variant: 'destructive', title: t('notOnBusToastTitle'), description: t('notOnBusToastDescription') });
        return;
    }
    if (!busRef || !user) return;

    if (playlist.find(t => t.id === track.id)) {
      toast({ variant: 'destructive', title: t('alreadyInPlaylistToastTitle'), description: t('alreadyInPlaylistToastDescription', { title: track.title }) });
      return;
    }
    
    const newItem: PlaylistItem = { ...track, addedBy: user.uid };
    
    // Atomically add the new song to the 'playlist' array in Firestore.
    updateDoc(busRef, {
        playlist: arrayUnion(newItem)
    });

    toast({ title: t('addedToPlaylistToastTitle'), description: t('addedToPlaylistToastDescription', { title: track.title, artist: track.artist }) });
  };

  const removeFromPlaylist = (trackId: string) => {
    const songToRemove = playlist.find(t => t.id === trackId);
    if (!busRef || !songToRemove) return;

    // For simplicity in this example, we allow any user to remove any song.
    // In a real app, you might check: if (songToRemove.addedBy === user?.uid) { ... }
    
    // Atomically remove the song from the 'playlist' array in Firestore.
    updateDoc(busRef, {
        playlist: arrayRemove(songToRemove)
    });

    toast({ title: t('songRemovedToastTitle'), description: t('songRemovedToastDescription') });
  };
  
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
