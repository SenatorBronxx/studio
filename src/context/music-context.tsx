
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
    votes: number;
    userVote: 'up' | 'down' | null;
};

const initialPlaylist: PlaylistItem[] = [
    { id: "55mJdeMOo22iO3p2sQW3n3", title: 'Adonai', artist: 'Sarkodie', image: musicArtworks[3]?.imageUrl || '', duration: '4:02', addedByUser: false, votes: 5, userVote: 'up' },
    { id: "3ODKjzmHanT7p12zG3zzxP", title: 'Accra Night', artist: 'E.L', image: musicArtworks[1]?.imageUrl || '', duration: '3:15', addedByUser: false, votes: 3, userVote: null },
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
  upvoteSong: (trackId: string) => void;
  downvoteSong: (trackId: string) => void;
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
  const [nextSongId, setNextSongId] = useState<string | null>(null);


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
            // Persist the playlist state for real-time updates during a session
            // localStorage.setItem('eritas-music-playlist', JSON.stringify(playlist));
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
      const remainingPlaylist = playlist.filter(p => p.id !== nowPlaying?.id);
      
      let nextSong: PlaylistItem | undefined;

      if (nextSongId) {
        nextSong = remainingPlaylist.find(song => song.id === nextSongId);
        setNextSongId(null); // Reset after playing
      }

      if (!nextSong) {
        const sortedPlaylist = [...remainingPlaylist].sort((a, b) => b.votes - a.votes);
        nextSong = sortedPlaylist[0];
      }
      
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
  }, [songProgress, isOnBus, playlist, nowPlaying, toast, t, clearActiveTrip, nextSongId]);

  // Mock collaborator adding a song
  /*
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
  */


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
    const newTrack: PlaylistItem = { ...track, addedByUser: true, votes: 1, userVote: 'up' };
    setPlaylist(prev => [...prev, newTrack]);
    setNextSongId(newTrack.id);


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
      const sortedPlaylist = [...remainingPlaylist].sort((a, b) => b.votes - a.votes);
      const nextSong = sortedPlaylist[0] || null;
      setNowPlaying(nextSong);
    }
    
    setPlaylist(newPlaylist);

    toast({
      title: t('songRemovedToastTitle'),
      description: t('songRemovedToastDescription'),
    });
  };

  const upvoteSong = (trackId: string) => {
    setPlaylist(prev => 
        prev.map(song => {
            if (song.id === trackId) {
                if (song.userVote === 'up') {
                    // User is retracting their upvote
                    return { ...song, votes: song.votes - 1, userVote: null };
                } else if (song.userVote === 'down') {
                    // User is changing their downvote to an upvote
                    return { ...song, votes: song.votes + 2, userVote: 'up' };
                } else {
                    // User is casting a new upvote
                    return { ...song, votes: song.votes + 1, userVote: 'up' };
                }
            }
            return song;
        })
    );
  };
  
  const downvoteSong = (trackId: string) => {
    setPlaylist(prev => 
        prev.map(song => {
            if (song.id === trackId) {
                if (song.userVote === 'down') {
                    // User is retracting their downvote
                    return { ...song, votes: song.votes + 1, userVote: null };
                } else if (song.userVote === 'up') {
                    // User is changing their upvote to a downvote
                    return { ...song, votes: song.votes - 2, userVote: 'down' };
                } else {
                    // User is casting a new downvote
                    return { ...song, votes: song.votes - 1, userVote: 'down' };
                }
            }
            return song;
        })
    );
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
        upvoteSong,
        downvoteSong
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
