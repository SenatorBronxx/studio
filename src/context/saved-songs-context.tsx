
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import type { Track } from './music-context';
import { useUserPreferences } from './user-preferences-context';

type SavedSongsContextType = {
  savedSongs: Track[];
  saveSong: (track: Track) => void;
  unsaveSong: (trackId: string) => void;
  isSongSaved: (trackId: string) => boolean;
  isHydrated: boolean;
};

const SavedSongsContext = createContext<SavedSongsContextType | undefined>(undefined);

export function SavedSongsProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();
  const { toast } = useToast();
  const { t } = useLanguage();

  const savedSongs = preferences?.savedSongs ?? [];

  const isSongSaved = useCallback((trackId: string) => {
    return savedSongs.some(song => song.id === trackId);
  }, [savedSongs]);

  const saveSong = useCallback((track: Track) => {
    const currentSavedSongs = preferences?.savedSongs ?? [];
    if (currentSavedSongs.some(song => song.id === track.id)) return;
    
    const newSavedSongs = [track, ...currentSavedSongs];
    setPreference('savedSongs', newSavedSongs);

    toast({
      title: "Song Saved",
      description: `'${track.title}' has been added to your library.`,
    });
  }, [preferences?.savedSongs, setPreference, toast]);

  const unsaveSong = useCallback((trackId: string) => {
    const currentSavedSongs = preferences?.savedSongs ?? [];
    const songToRemove = currentSavedSongs.find(song => song.id === trackId);
    if (!songToRemove) return;

    const newSavedSongs = currentSavedSongs.filter(song => song.id !== trackId);
    setPreference('savedSongs', newSavedSongs);
    
    toast({
      title: "Song Unsaved",
      description: `'${songToRemove.title}' has been removed from your library.`,
    });
  }, [preferences?.savedSongs, setPreference, toast]);

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
