
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Track } from './music-context';
import { useToast } from '@/hooks/use-toast';

type SavedSongsContextType = {
  savedSongs: Track[];
  saveSong: (song: Track) => void;
  unsaveSong: (songId: string) => void;
  isSongSaved: (songId: string) => boolean;
  isHydrated: boolean;
};

const SavedSongsContext = createContext<SavedSongsContextType | undefined>(undefined);

export function SavedSongsProvider({ children }: { children: ReactNode }) {
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedSongs = localStorage.getItem('savedSongs');
        if (storedSongs) {
            setSavedSongs(JSON.parse(storedSongs));
        }
    } catch (error) {
        console.error("Failed to load saved songs from localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  const updateLocalStorage = (songs: Track[]) => {
      try {
          localStorage.setItem('savedSongs', JSON.stringify(songs));
      } catch (error) {
          console.error("Failed to save songs to localStorage", error);
      }
  };

  const saveSong = useCallback((song: Track) => {
    setSavedSongs(prev => {
        if (prev.some(s => s.id === song.id)) {
            return prev; // Already saved
        }
        const newSongs = [song, ...prev];
        updateLocalStorage(newSongs);
        toast({ title: "Song Saved", description: `${song.title} has been added to your saved songs.` });
        return newSongs;
    });
  }, [toast]);

  const unsaveSong = useCallback((songId: string) => {
    setSavedSongs(prev => {
        const songToRemove = prev.find(s => s.id === songId);
        const newSongs = prev.filter(s => s.id !== songId);
        updateLocalStorage(newSongs);
        if (songToRemove) {
            toast({ title: "Song Unsaved", description: `${songToRemove.title} has been removed.` });
        }
        return newSongs;
    });
  }, [toast]);

  const isSongSaved = useCallback((songId: string) => {
    return savedSongs.some(s => s.id === songId);
  }, [savedSongs]);

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
