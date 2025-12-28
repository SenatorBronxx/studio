
'use client';

import { useState, useEffect }from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Music, Mic, ListMusic, Plus, X, Heart, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useLanguage } from '@/context/language-context';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTracks as searchSpotifyTracks, searchArtists, getArtist, getArtistAlbums, getAlbumTracks } from '@/lib/spotify';
import { useTrip } from '@/context/trip-context';
import { useMusic, Track } from '@/context/music-context';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { getRecommendations } from '@/ai/flows/get-recommendations-flow';
import { useUserPreferences } from '@/context/user-preferences-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSavedSongs } from '@/context/saved-songs-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';


const genres = [
    { name: "Highlife", color: "bg-red-500", imageId: "music-art-1" },
    { name: "Hiplife", color: "bg-blue-500", imageId: "music-art-2" },
    { name: "Afrobeats", color: "bg-purple-500", imageId: "music-art-3" },
    { name: "Gospel", color: "bg-green-500", imageId: "music-art-4" },
];

const popularArtists = [
    { name: "Sarkodie", imageId: "artist-sarkodie" },
    { name: "Stonebwoy", imageId: "artist-stonebwoy" },
    { name: "Shatta Wale", imageId: "artist-shatta-wale" },
    { name: "E.L.", imageId: "artist-el" },
];

function ArtistDetailView({ artistId, onBack, onAddSong, activeTrip, isSongSaved, handleSaveToggle }: { artistId: string, onBack: () => void, onAddSong: (track: Track) => void, activeTrip: boolean, isSongSaved: (id: string) => boolean, handleSaveToggle: (track: Track) => void }) {
    const [artist, setArtist] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [artistData, albumsData] = await Promise.all([
                    getArtist(artistId),
                    getArtistAlbums(artistId, 20)
                ]);
                setArtist(artistData);
                setAlbums(albumsData);
            } catch (error) {
                console.error("Failed to fetch artist details", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not load artist details." });
            }
            setIsLoading(false);
        };
        fetchData();
    }, [artistId, toast]);

    const handleAlbumClick = async (album: any) => {
        setSelectedAlbum(album);
        setIsLoadingTracks(true);
        const tracks = await getAlbumTracks(album.id);
        setSelectedAlbumTracks(tracks);
        setIsLoadingTracks(false);
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!artist) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Artist not found.</p></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold truncate">{artist.name}</h1>
            </header>

            <main className="flex-grow">
                 <div className="relative h-48 w-full">
                    <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={artist.images[0]?.url} alt={artist.name} className="object-cover" />
                        <AvatarFallback className="rounded-none"><Music /></AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <h2 className="text-4xl font-bold text-foreground truncate">{artist.name}</h2>
                        <p className="text-muted-foreground">{artist.followers.total.toLocaleString()} followers</p>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <h3 className="text-xl font-bold">Albums</h3>
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="flex space-x-4">
                            {albums.map(album => (
                                <div key={album.id} className="w-36 flex-shrink-0 cursor-pointer" onClick={() => handleAlbumClick(album)}>
                                    <Avatar className="h-36 w-36 rounded-md border">
                                        <AvatarImage src={album.images[0]?.url} alt={album.name} />
                                        <AvatarFallback className="rounded-md"><Music /></AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2 text-sm font-semibold truncate">{album.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(album.release_date).getFullYear()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedAlbum && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">{selectedAlbum.name}</h3>
                            <Card>
                                <CardContent className="p-2">
                                     {isLoadingTracks ? (
                                        <div className="flex justify-center items-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                     ) : selectedAlbumTracks.map((track) => (
                                        <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                            <div className='flex-grow overflow-hidden'>
                                                <p className='font-semibold truncate'>{track.name}</p>
                                                <p className='text-sm text-muted-foreground truncate'>{track.artists.map((a: any) => a.name).join(', ')}</p>
                                            </div>
                                            <p className='text-sm text-muted-foreground font-mono'>{formatDuration(track.duration_ms)}</p>
                                             <div className="flex items-center flex-shrink-0">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    const trackToAdd: Track = {
                                                        id: track.id, title: track.name, artist: track.artists[0].name,
                                                        albumArt: selectedAlbum?.images[0]?.url || artist.images[0]?.url,
                                                        duration: track.duration_ms, artistId: track.artists[0].id
                                                    };
                                                    handleSaveToggle(trackToAdd);
                                                }}>
                                                    <Heart className={cn('h-5 w-5', isSongSaved(track.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    const trackToAdd: Track = {
                                                        id: track.id, title: track.name, artist: track.artists[0].name,
                                                        albumArt: selectedAlbum?.images[0]?.url || artist.images[0]?.url,
                                                        duration: track.duration_ms, artistId: track.artists[0].id
                                                    };
                                                    onAddSong(trackToAdd);
                                                }} disabled={!activeTrip}>
                                                    <Plus className='h-5 w-5' />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}


export default function MusicPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Track[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [searchType, setSearchType] = useState<'track' | 'artist'>('track');
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { activeTrip } = useTrip();
    const { playlist, nowPlaying, addSong, removeSong } = useMusic();
    const { savedSongs, saveSong, unsaveSong, isSongSaved, isHydrated: isSavedSongsHydrated } = useSavedSongs();
    const { toast } = useToast();
    const { preferences } = useUserPreferences();


    useEffect(() => {
        if (!isSavedSongsHydrated) return;

        const saveSongWithToast = (song: Track) => {
            if (isSongSaved(song.id)) return;
            saveSong(song);
            toast({ title: "Song Saved", description: `${song.title} has been added to your saved songs.` });
        };

        const unsaveSongWithToast = (songId: string) => {
            const song = savedSongs.find(s => s.id === songId);
            if (!song) return;
            unsaveSong(songId);
            toast({ title: "Song Unsaved", description: `${song.title} has been removed.` });
        };

    }, [isSavedSongsHydrated, isSongSaved, saveSong, unsaveSong, savedSongs, toast]);


    useEffect(() => {
        const fetchRecommendations = async () => {
            if (preferences?.music && recommendations.length === 0) {
                setIsLoadingRecommendations(true);
                try {
                    const result = await getRecommendations({ favoriteMusic: preferences.music });
                    
                    const recommendedTracks: Track[] = result.recommendations.map((item: any) => ({
                        id: item.id,
                        title: item.name,
                        artist: item.artists[0].name,
                        albumArt: item.album.images[0]?.url,
                        duration: item.duration_ms,
                        artistId: item.artists[0].id,
                    }));

                    setRecommendations(recommendedTracks);
                } catch (error) {
                    console.error("Failed to fetch recommendations:", error);
                    toast({
                        variant: 'destructive',
                        title: "Couldn't get recommendations",
                        description: "There was an issue getting AI recommendations."
                    });
                }
                setIsLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [preferences, recommendations.length, toast]);

    useEffect(() => {
        const search = async () => {
            if (debouncedSearchTerm) {
                setIsLoading(true);
                const results = searchType === 'track' 
                    ? await searchSpotifyTracks(debouncedSearchTerm, 20)
                    : await searchArtists(debouncedSearchTerm, 20);

                const formattedResults = results.map(item => ({
                    id: item.id,
                    title: item.name,
                    artist: item.artists?.[0]?.name,
                    albumArt: item.album?.images[0]?.url || item.images?.[0]?.url,
                    duration: item.duration_ms,
                    type: item.type,
                    followers: item.followers?.total,
                    artistId: item.type === 'artist' ? item.id : item.artists?.[0].id,
                }));
                setSearchResults(formattedResults);
                setIsLoading(false);
            } else {
                setSearchResults([]);
            }
        };
        search();
    }, [debouncedSearchTerm, searchType]);

    const handleAddSong = (song: Track) => {
        if (!activeTrip) {
            toast({
                variant: "destructive",
                title: t('notOnBusToastTitle'),
                description: t('notOnBusToastDescription'),
            });
            return;
        }
        if (playlist.find(s => s.id === song.id) || nowPlaying?.id === song.id) {
             toast({
                variant: "destructive",
                title: t('alreadyInPlaylistToastTitle'),
                description: t('alreadyInPlaylistToastDescription', { title: song.title }),
            });
            return;
        }
        addSong(song, "user-id"); // Mock user ID
        toast({
            title: t('addedToPlaylistToastTitle'),
            description: t('addedToPlaylistToastDescription', { title: song.title, artist: song.artist }),
        });
        setSearchTerm('');
    };

    const handleRemoveSong = (songId: string) => {
        const song = playlist.find(s => s.id === songId);
        if(song) {
            removeSong(songId, "user-id");
            toast({
                title: t('songRemovedToastTitle'),
                description: t('songRemovedToastDescription'),
            });
        }
    };

    const handleSaveToggle = (track: Track) => {
        if (isSongSaved(track.id)) {
            unsaveSong(track.id);
        } else {
            saveSong(track);
        }
    };
    
    const handleArtistSelect = async (artist: any) => {
        if (artist.type === 'artist') {
            setSelectedArtistId(artist.id);
        } else if (artist.artistId) {
             const artists = await searchArtists(artist.artist, 1);
             if (artists.length > 0) {
                setSelectedArtistId(artists[0].id);
             }
        }
    };
    
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    const renderTrackItem = (track: any) => (
        <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
            <Avatar className='h-12 w-12 rounded-md flex-shrink-0'>
                {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
            </Avatar>
            <div className='flex-grow overflow-hidden'>
                <p className='font-semibold truncate'>{track.title}</p>
                {track.artist && 
                    <div onClick={(e) => { e.stopPropagation(); handleArtistSelect(track); }} className='text-sm text-muted-foreground truncate hover:underline cursor-pointer'>
                        {track.artist}
                    </div>
                }
            </div>
            {track.duration && <p className='text-sm text-muted-foreground font-mono hidden sm:block mx-2'>{formatDuration(track.duration)}</p>}
            <div className='flex items-center flex-shrink-0'>
                 <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSaveToggle(track); }}>
                    <Heart className={cn('h-5 w-5', isSongSaved(track.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                </Button>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAddSong(track); }} disabled={!activeTrip}>
                    <Plus className='h-5 w-5' />
                </Button>
            </div>
        </div>
    );
    
    const renderArtistItem = (artist: any) => (
         <div key={artist.id} onClick={() => handleArtistSelect(artist)} className="block cursor-pointer">
            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className='h-12 w-12 rounded-full'>
                    {artist.albumArt && <AvatarImage src={artist.albumArt} alt={artist.title} />}
                    <AvatarFallback className='rounded-full'><Mic /></AvatarFallback>
                </Avatar>
                <div className='flex-grow overflow-hidden'>
                    <p className='font-semibold truncate'>{artist.title}</p>
                    {artist.followers && <p className='text-sm text-muted-foreground'>{artist.followers.toLocaleString()} followers</p>}
                </div>
            </div>
        </div>
    );

    if (selectedArtistId) {
        return <ArtistDetailView 
            artistId={selectedArtistId} 
            onBack={() => setSelectedArtistId(null)}
            onAddSong={handleAddSong}
            activeTrip={!!activeTrip}
            isSongSaved={isSongSaved}
            handleSaveToggle={handleSaveToggle}
        />
    }

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow p-4 pb-48">
        <div className="max-w-md mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('music')}</h1>
                <div className='flex items-center gap-2'>
                    {activeTrip && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ListMusic className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>{t('busPlaylist')}</SheetTitle>
                                </SheetHeader>
                                <div className="py-4 h-full">
                                {nowPlaying ? (
                                    <div className='space-y-4'>
                                        <div className="flex items-center gap-4 p-2 rounded-lg bg-muted">
                                            <div className='flex-grow flex items-center gap-4 cursor-pointer overflow-hidden' onClick={() => router.push('/music/now-playing')}>
                                                <Avatar className='h-12 w-12 rounded-md'>
                                                    {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                                                    <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-hidden">
                                                    <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                                                    <p className='text-sm text-muted-foreground truncate'>{nowPlaying.artist}</p>
                                                </div>
                                            </div>
                                            <NowPlayingIcon />
                                        </div>

                                        {playlist.length > 0 && (
                                            <div className='space-y-2'>
                                                 <h3 className="text-md font-semibold">{t('upNext')}</h3>
                                                 <ScrollArea className='h-[60vh]'>
                                                    <div className='space-y-2 pr-4'>
                                                        {playlist.map((track, index) => (
                                                            <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                                                <span className='font-mono text-muted-foreground text-sm w-4 text-center'>{index + 1}</span>
                                                                <div className='flex-grow overflow-hidden'>
                                                                    <p className='font-medium text-sm truncate'>{track.title}</p>
                                                                    <p className='text-xs text-muted-foreground truncate'>{track.artist}</p>
                                                                </div>
                                                                <Button size="icon" variant="ghost" className='h-8 w-8' onClick={() => handleRemoveSong(track.id)}>
                                                                    <X className='h-4 w-4' />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                 </ScrollArea>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[70vh] text-muted-foreground">
                                        <Music className="h-16 w-16 mb-4" />
                                        <h2 className="text-xl font-semibold">{t('noSongsAdded')}</h2>
                                        <p className="mt-2">{t('browseAndAddSongs')}</p>
                                    </div>
                                )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Saved Songs</SheetTitle>
                            </SheetHeader>
                            <div className="py-4 h-full">
                                {isSavedSongsHydrated && savedSongs.length > 0 ? (
                                    <ScrollArea className="h-[85vh]">
                                        <div className="space-y-2">
                                            {savedSongs.map(track => (
                                                 <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                                                    <Avatar className='h-12 w-12 rounded-md flex-shrink-0'>
                                                        {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                                                        <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                                    </Avatar>
                                                    <div className='flex-1 w-0 overflow-hidden'>
                                                        <p className='font-semibold truncate'>{track.title}</p>
                                                        <p className='text-sm text-muted-foreground truncate'>{track.artist}</p>
                                                    </div>
                                                    <div className="flex items-center flex-shrink-0">
                                                        <Button size="icon" variant="ghost" onClick={() => handleAddSong(track)} disabled={!activeTrip}>
                                                            <Plus className='h-5 w-5' />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="icon" variant="ghost">
                                                                    <Trash2 className='h-5 w-5 text-destructive' />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Unsave Song?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove "{track.title}" from your saved songs?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => unsaveSong(track.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Unsave
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[70vh] text-muted-foreground">
                                        <Heart className="h-16 w-16 mb-4" />
                                        <h2 className="text-xl font-semibold">No Saved Songs</h2>
                                        <p className="mt-2">Tap the heart icon on a song to save it here.</p>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
                    {searchType === 'track' ? <Music /> : <Mic />}
                </div>
                <Input
                    placeholder={searchType === 'track' ? t('searchSongsPlaceholder') : "Search for artists"}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <div className='absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-background'>
                    <Button 
                        size="sm" 
                        variant={searchType === 'track' ? 'secondary' : 'ghost'} 
                        className="h-8"
                        onClick={() => setSearchType('track')}
                    >
                        Tracks
                    </Button>
                    <Button 
                        size="sm" 
                        variant={searchType === 'artist' ? 'secondary' : 'ghost'}
                        className="h-8"
                        onClick={() => setSearchType('artist')}
                    >
                        Artists
                    </Button>
                </div>
            </div>
            
            {searchTerm ? (
                 <div className="space-y-4 mt-6">
                    <h2 className="text-xl font-semibold">{t('searchResultsFor', { query: searchTerm })}</h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                            {searchResults.map(item => item.type === 'artist' ? renderArtistItem(item) : renderTrackItem(item))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">{t('noTracksFound')}</p>
                    )}
                 </div>
            ) : (
                <div className="space-y-8 mt-4">
                    
                    {recommendations.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold">Recommended For You</h2>
                            <p className="text-sm text-muted-foreground mb-3">Based on your love for {preferences?.music}</p>
                            <div className="space-y-1">
                                {recommendations.slice(0, 5).map(renderTrackItem)}
                            </div>
                        </div>
                    )}
                     {isLoadingRecommendations && (
                        <div className="flex justify-center items-center py-8">
                            <p className='text-muted-foreground'>Getting AI recommendations...</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('genres')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {genres.map(genre => {
                                const image = PlaceHolderImages.find(p => p.id === genre.imageId);
                                return (
                                <Card key={genre.name} className="relative overflow-hidden text-white cursor-pointer h-28 hover:scale-105 transition-transform">
                                    {image && <img src={image.imageUrl} alt={genre.name} className='absolute inset-0 w-full h-full object-cover'/>}
                                    <div className='absolute inset-0 bg-black/40'></div>
                                    <CardContent className="p-4 relative">
                                        <h3 className="font-bold">{genre.name}</h3>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-semibold mb-4">Popular Artists</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {popularArtists.map(artist => {
                                const image = PlaceHolderImages.find(p => p.id === artist.imageId);
                                return (
                                <div key={artist.name} onClick={async () => {
                                    const artists = await searchArtists(artist.name, 1);
                                    if (artists.length > 0) {
                                        handleArtistSelect(artists[0]);
                                    }
                                }}>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer">
                                        <Avatar className="h-16 w-16">
                                            {image && <AvatarImage src={image.imageUrl} alt={artist.name} />}
                                            <AvatarFallback><Mic /></AvatarFallback>
                                        </Avatar>
                                        <p className="text-xs font-semibold text-center truncate w-full">{artist.name}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

       {nowPlaying && activeTrip && (
            <div className="fixed bottom-[80px] left-0 right-0 z-20 p-2 pointer-events-none">
                <Card 
                    className="max-w-md mx-auto bg-background/80 backdrop-blur-sm shadow-lg pointer-events-auto"
                >
                    <CardContent className="p-2 flex items-center gap-4">
                        <div className='flex-grow flex items-center gap-4 cursor-pointer overflow-hidden' onClick={() => router.push('/music/now-playing')}>
                            <Avatar className='h-10 w-10 rounded-md flex-shrink-0'>
                                {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                            </Avatar>
                            <div className='flex-grow overflow-hidden'>
                                <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                                <p className='text-sm text-muted-foreground truncate'>{nowPlaying.artist}</p>
                            </div>
                        </div>
                        <div className='flex items-center'>
                           <NowPlayingIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

      <div className="sticky bottom-0 z-10">
        <BottomNav />
      </div>
    </div>
  );
}

