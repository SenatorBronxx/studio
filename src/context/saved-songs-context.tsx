
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import type { Track } from './music-context';

type SavedSongsContextType = {
  savedSongs: Track[];
  saveSong: (track: Track) => void;
  unsaveSong: (trackId: string) => void;
  isSongSaved: (trackId: string) => boolean;
  isHydrated: boolean;
};

const SavedSongsContext = createContext<SavedSongsContextType | undefined>(undefined);

export function SavedSongsProvider({ children }: { children: ReactNode }) {
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedSongs = localStorage.getItem('eritas-saved-songs');
      if (storedSongs) {
        setSavedSongs(JSON.parse(storedSongs));
      }
    } catch (error) {
      console.error("Failed to read saved songs from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-saved-songs', JSON.stringify(savedSongs));
      } catch (error) {
        console.error("Failed to write saved songs to localStorage", error);
      }
    }
  }, [savedSongs, isHydrated]);

  const isSongSaved = useCallback((trackId: string) => {
    return savedSongs.some(song => song.id === trackId);
  }, [savedSongs]);

  const saveSong = useCallback((track: Track) => {
    if (isSongSaved(track.id)) return;
    
    setSavedSongs(prevSongs => [track, ...prevSongs]);
    toast({
      title: "Song Saved",
      description: `'${track.title}' has been added to your library.`,
    });
  }, [isSongSaved, t, toast]);

  const unsaveSong = useCallback((trackId: string) => {
    const songToRemove = savedSongs.find(song => song.id === trackId);
    setSavedSongs(prevSongs => prevSongs.filter(song => song.id !== trackId));
    if (songToRemove) {
      toast({
        title: "Song Unsaved",
        description: `'${songToRemove.title}' has been removed from your library.`,
      });
    }
  }, [savedSongs, t, toast]);

  const value = { savedSongs, saveSong, unsaveSong, isSongSaved, isHydrated };

  return (
    <SavedSongsContext.Provider value={value}>
      {children}
    </SavedSongsContext.Provider>
  );
}

export function useSavedSongs() {
  const context = useContext(SavedSongsContext);
  if (context === undefined) {
    throw new Error('useSavedSongs must be used within a SavedSongsProvider');
  }
  return context;
}
