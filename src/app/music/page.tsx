
'use client';

import { useState, useEffect }from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Music, Search, Heart, Mic, ListMusic, Plus, Play, Pause, X } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useLanguage } from '@/context/language-context';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTracks as searchSpotifyTracks } from '@/lib/spotify';
import { useTrip } from '@/context/trip-context';
import { useMusic, Track } from '@/context/music-context';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

import { getRecommendations } from '@/ai/flows/get-recommendations-flow';
import { useUserPreferences } from '@/context/user-preferences-context';


const genres = [
    { name: "Highlife", color: "bg-red-500", imageId: "music-art-1" },
    { name: "Hiplife", color: "bg-blue-500", imageId: "music-art-2" },
    { name: "Afrobeats", color: "bg-purple-500", imageId: "music-art-3" },
    { name: "Gospel", color: "bg-green-500", imageId: "music-art-4" },
    { name: "Synthwave", color: "bg-pink-500", imageId: "music-art-5" },
];

export default function MusicPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Track[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { activeTrip } = useTrip();
    const { playlist, nowPlaying, addSong, removeSong, isPlaying, togglePlay } = useMusic();
    const { toast } = useToast();
    const { preferences } = useUserPreferences();


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
                const results = await searchSpotifyTracks(debouncedSearchTerm, 20);
                const formattedResults = results.map(item => ({
                    id: item.id,
                    title: item.name,
                    artist: item.artists[0].name,
                    albumArt: item.album.images[0]?.url,
                    duration: item.duration_ms
                }));
                setSearchResults(formattedResults);
                setIsLoading(false);
            } else {
                setSearchResults([]);
            }
        };
        search();
    }, [debouncedSearchTerm]);

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
        // In a real app, you'd check if the current user added the song.
        // For this demo, we allow removing any song.
        const song = playlist.find(s => s.id === songId);
        if(song) {
            removeSong(songId, "user-id");
            toast({
                title: t('songRemovedToastTitle'),
                description: t('songRemovedToastDescription'),
            });
        }
    };
    
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    const renderTrackItem = (track: Track) => (
        <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
            <Avatar className='h-12 w-12 rounded-md'>
                {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
            </Avatar>
            <div className='flex-grow'>
                <p className='font-semibold truncate'>{track.title}</p>
                <p className='text-sm text-muted-foreground'>{track.artist}</p>
            </div>
            <p className='text-sm text-muted-foreground font-mono'>{formatDuration(track.duration)}</p>
            <Button size="icon" variant="ghost" onClick={() => handleAddSong(track)}>
                <Plus className='h-5 w-5' />
            </Button>
        </div>
    );
    
    return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow p-4 pb-40">
        <div className="max-w-md mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('music')}</h1>
                <div className='flex items-center gap-2'>
                    <Link href="/music/saved">
                        <Button variant="outline" size="icon">
                            <Heart className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder={t('searchSongsPlaceholder')}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Search results or Browsing UI */}
            {searchTerm ? (
                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{t('searchResultsFor', { query: searchTerm })}</h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map(renderTrackItem)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">{t('noTracksFound')}</p>
                    )}
                 </div>
            ) : (
                <div className="space-y-6">
                    {activeTrip && (
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-lg font-bold mb-4">{t('busPlaylist')}</h2>
                            {nowPlaying ? (
                                <div className='space-y-4'>
                                    <div className="flex items-center gap-4 p-2 rounded-lg bg-muted">
                                        <div className='flex-grow flex items-center gap-4'>
                                            <Avatar className='h-12 w-12 rounded-md'>
                                                {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                                                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                                                <p className='text-sm text-muted-foreground'>{nowPlaying.artist}</p>
                                            </div>
                                        </div>
                                        <NowPlayingIcon />
                                    </div>

                                    {playlist.length > 0 && (
                                        <div className='space-y-2'>
                                             <h3 className="text-md font-semibold">{t('upNext')}</h3>
                                             <ScrollArea className='h-[150px]'>
                                                <div className='space-y-2 pr-4'>
                                                    {playlist.map((track, index) => (
                                                        <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                                            <span className='font-mono text-muted-foreground text-sm w-4 text-center'>{index + 1}</span>
                                                            <div className='flex-grow'>
                                                                <p className='font-medium text-sm truncate'>{track.title}</p>
                                                                <p className='text-xs text-muted-foreground'>{track.artist}</p>
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
                                <div className="text-center py-4 text-muted-foreground">
                                    <p>{t('noSongsAdded')}</p>
                                    <p className='text-sm'>{t('browseAndAddSongs')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )}
                    
                    {recommendations.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Recommended For You</h2>
                            <p className="text-sm text-muted-foreground mb-4">Based on your love for {preferences?.music}</p>
                            <div className="space-y-2">
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
                                <Card key={genre.name} className={`relative overflow-hidden text-white cursor-pointer hover:scale-105 transition-transform`}>
                                    {image && <img src={image.imageUrl} alt={genre.name} className='absolute inset-0 w-full h-full object-cover'/>}
                                    <div className='absolute inset-0 bg-black/40'></div>
                                    <CardContent className="p-4 relative">
                                        <h3 className="font-bold">{genre.name}</h3>
                                    </CardContent>
                                </Card>
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
                    className="max-w-md mx-auto bg-background/80 backdrop-blur-sm shadow-lg pointer-events-auto cursor-pointer"
                    onClick={() => router.push('/music/now-playing')}
                >
                    <CardContent className="p-2 flex items-center gap-4">
                        <Avatar className='h-10 w-10 rounded-md'>
                            {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                            <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                        </Avatar>
                        <div className='flex-grow'>
                            <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                            <p className='text-sm text-muted-foreground'>{nowPlaying.artist}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                            {isPlaying ? <Pause className='h-6 w-6' /> : <Play className='h-6 w-6' />}
                        </Button>
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

