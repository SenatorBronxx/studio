
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useTrip } from './trip-context';

export type Track = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // in ms
  artistId?: string;
};

type PlaylistEntry = {
    track: Track;
    addedBy: string; // e.g., user ID
};

type MusicContextType = {
  playlist: Track[];
  playedSongs: Track[]; // Keep track of songs that have finished
  nowPlaying: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  addSong: (song: Track, userId: string) => void;
  removeSong: (songId: string, userId: string) => boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const { activeTrip } = useTrip();
    const [playlist, setPlaylist] = useState<PlaylistEntry[]>([]);
    const [playedSongs, setPlayedSongs] = useState<PlaylistEntry[]>([]);
    const [nowPlaying, setNowPlaying] = useState<PlaylistEntry | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const playNextSong = useCallback(() => {
        if (nowPlaying) {
            setPlayedSongs(prev => [nowPlaying, ...prev]);
        }

        if (playlist.length > 0) {
            const nextSong = playlist[0];
            setNowPlaying(nextSong);
            setPlaylist(prev => prev.slice(1));
            setProgress(0);
            setIsPlaying(true);
        } else {
            setNowPlaying(null);
            setIsPlaying(false);
            setProgress(0);
        }
    }, [playlist, nowPlaying]);


    useEffect(() => {
        if (!activeTrip) {
            setPlaylist([]);
            setPlayedSongs([]);
            setNowPlaying(null);
            setIsPlaying(false);
            setProgress(0);
        }
    }, [activeTrip]);

    useEffect(() => {
        if (!activeTrip) return;

        if (!nowPlaying && playlist.length > 0) {
           playNextSong();
        }

        if (nowPlaying && isPlaying) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + (100 / (nowPlaying.track.duration / 1000));
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        playNextSong();
                        return 0;
                    }
                    return newProgress;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

    }, [nowPlaying, isPlaying, activeTrip, playNextSong, playlist.length]);
    

    const addSong = useCallback((track: Track, userId: string) => {
        if (!activeTrip) return;
        const newEntry: PlaylistEntry = { track, addedBy: userId };
        setPlaylist(prev => [...prev, newEntry]);
    }, [activeTrip]);

    const removeSong = useCallback((trackId: string, userId: string): boolean => {
        let canRemove = true; // For demo, anyone can remove
        if(canRemove) {
            setPlaylist(prev => prev.filter(entry => entry.track.id !== trackId));
        }
        return canRemove;
    }, []);

    const togglePlay = useCallback(() => {
        if (nowPlaying) {
            setIsPlaying(prev => !prev);
        }
    }, [nowPlaying]);

    const playNext = useCallback(() => {
        playNextSong();
    }, [playNextSong]);
    
    const playPrevious = useCallback(() => {
        if (playedSongs.length > 0) {
            const lastPlayedSong = playedSongs[0];
            setPlayedSongs(prev => prev.slice(1));
            if (nowPlaying) {
                setPlaylist(prev => [nowPlaying, ...prev]);
            }
            setNowPlaying(lastPlayedSong);
            setProgress(0);
            setIsPlaying(true);
        }
    }, [playedSongs, nowPlaying]);

    const value = {
        playlist: playlist.map(p => p.track),
        playedSongs: playedSongs.map(p => p.track),
        nowPlaying: nowPlaying?.track || null,
        isPlaying,
        progress,
        addSong,
        removeSong,
        togglePlay,
        playNext,
        playPrevious,
    };

    return (
        <MusicContext.Provider value={value}>
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
