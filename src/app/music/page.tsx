
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, Plus, X, Search, Bus, LogIn, Loader2, Bookmark } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BottomNav } from '@/components/bottom-nav';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useMusic, type Track, PlaylistItem } from '@/context/music-context';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { searchMusic } from '@/ai/flows/search-music';
import { searchArtists, type Artist as ApiArtist } from '@/ai/flows/search-artists';
import { cn } from '@/lib/utils';
import { useSavedSongs } from '@/context/saved-songs-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fallbackImage = PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '';

const genres = [
  { name: 'Highlife', image: PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '' },
  { name: 'Hiphop', image: PlaceHolderImages.find(p => p.id === 'music-art-2')?.imageUrl || '' },
  { name: 'Afrobeat', image: PlaceHolderImages.find(p => p.id === 'music-art-3')?.imageUrl || '' },
  { name: 'Gospel', image: PlaceHolderImages.find(p => p.id === 'music-art-4')?.imageUrl || '' },
];


export default function MusicPage() {
    const { 
        playlist,
        nowPlaying,
        songProgress,
        isPlaylistOpen,
        setIsPlaylistOpen,
        addToPlaylist,
        removeFromPlaylist,
        isOnBus,
    } = useMusic();
    const { savedSongs, saveSong, unsaveSong, isSongSaved } = useSavedSongs();

    const { t } = useLanguage();
    const { user } = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSavedSongsSheetOpen, setIsSavedSongsSheetOpen] = useState(false);
    
    const [artists, setArtists] = useState<ApiArtist[]>([]);
    const [isLoadingArtists, setIsLoadingArtists] = useState(true);

    const defaultArtists = useMemo(() => ['Sarkodie', 'Stonebwoy', 'Shatta Wale', 'E.L.', 'KiDi', 'Kuami Eugene', 'Efya', 'R2Bees'], []);

    useEffect(() => {
        const fetchArtists = async () => {
            setIsLoadingArtists(true);
            try {
                const response = await searchArtists({ queries: defaultArtists });
                setArtists(response.artists);
            } catch (error) {
                console.error("Error fetching artists:", error);
                setArtists([]);
            } finally {
                setIsLoadingArtists(false);
            }
        };
        fetchArtists();
    }, [defaultArtists]);

    const handleTrackSearch = useCallback(async (query: string) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await searchMusic({ query });
            const tracks: Track[] = response.songs.map((song: any) => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                image: song.image || fallbackImage,
                duration: song.duration,
            }));
            setSearchResults(tracks);
        } catch (error) {
            console.error("Error searching music:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        handleTrackSearch(debouncedSearchQuery);
    }, [debouncedSearchQuery, handleTrackSearch]);
    
    const handleArtistClick = (artistId: string) => {
        router.push(`/music/artist/${artistId}`);
    };

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
                <h1 className="text-xl font-bold">{t('signInToContinue')}</h1>
                <p className='text-muted-foreground'>{t('signInToAccessFeatures')}</p>
                <Button onClick={() => router.push('/')} className="mt-4">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('goToSignIn')}
                </Button>
            </div>
        );
    }

    const upNextPlaylist = playlist
        .filter(p => p.id !== nowPlaying?.id);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 space-y-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('browse')}</h1>
            <div className="flex items-center gap-2">
                <Sheet open={isSavedSongsSheetOpen} onOpenChange={setIsSavedSongsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Bookmark className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Saved Songs</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 h-full flex flex-col">
                            {savedSongs.length > 0 ? (
                                <div className="space-y-3 overflow-y-auto">
                                    {savedSongs.map((track) => (
                                         <div key={track.id} className="flex items-center gap-4 group">
                                            <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md object-cover" />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{track.title}</p>
                                                <div className="flex text-sm text-muted-foreground">
                                                    <span>{track.artist}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{track.duration}</span>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="shrink-0" onClick={() => unsaveSong(track.id)}>
                                                <X className="h-5 w-5 text-destructive" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="shrink-0" onClick={() => addToPlaylist(track)}>
                                                <Plus className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                                    <Bookmark className="h-12 w-12 mb-4" />
                                    <p>You have no saved songs.</p>
                                    <p className='text-xs'>Use the bookmark icon on a song to save it.</p>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
                <Sheet open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ListMusic className="h-6 w-6" />
                            {isOnBus && playlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-primary-foreground text-xs items-center justify-center">
                                        {playlist.length}
                                    </span>
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className='flex flex-col'>
                        <SheetHeader>
                            <SheetTitle>{t('busPlaylist')}</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 flex flex-col h-full overflow-hidden">
                        {isOnBus ? (
                            <>
                                {nowPlaying ? (
                                    <div className='mb-4 space-y-3 shrink-0'>
                                        <div className="relative flex flex-col justify-end text-white rounded-lg overflow-hidden p-4 h-48 bg-secondary">
                                            <Image src={nowPlaying.image} alt={nowPlaying.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            <div className='relative z-10'>
                                                <p className='text-xs font-semibold uppercase tracking-wider'>{t('nowPlaying')}</p>
                                                <h3 className="font-bold text-2xl truncate">{nowPlaying.title}</h3>
                                                <p className="text-sm opacity-80">{nowPlaying.artist}</p>
                                                <Progress value={songProgress} className="h-1 bg-white/20 mt-2" />
                                            </div>
                                        </div>
                                        <Separator />
                                    </div>
                            ) : null}

                            <div className="flex-grow overflow-y-auto">
                                {upNextPlaylist.length > 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">{t('upNext')}</p>
                                        <div className="space-y-3">
                                        {upNextPlaylist.map((track: PlaylistItem, index: number) => (
                                            <div key={`${track.id}-${index}`} className="flex items-center gap-4 group">
                                                <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md object-cover" />
                                                <div className="flex-grow">
                                                    <p className="font-semibold">{track.title}</p>
                                                    <div className="flex text-sm text-muted-foreground">
                                                        <span>{track.artist}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{track.duration}</span>
                                                    </div>
                                                </div>
                                                {track.addedByUser && (
                                                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={() => removeFromPlaylist(track.id)}>
                                                        <X className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        </div>
                                    </>
                                ) : !nowPlaying ? (
                                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center h-full">
                                        <ListMusic className="h-12 w-12 mx-auto mb-4" />
                                        <p>{t('noSongsAdded')}</p>
                                        <p className="text-xs">{t('browseAndAddSongs')}</p>
                                    </div>
                                ) : null}
                            </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                                <div className="flex-grow flex flex-col items-center justify-center">
                                    <Bus className="h-12 w-12 mb-4" />
                                    <h3 className="font-semibold">{t('boardBusToSeePlaylist')}</h3>
                                    <p className="text-sm mt-1">{t('playlistOnlyOnTrip')}</p>
                                </div>
                                <div className="text-xs text-muted-foreground/50 mt-4 flex items-center justify-center gap-2">
                                    <Image src="https://i.postimg.cc/yxGLTbF8/841e99e1b760a190028030076e4c907f-removebg-preview.png" alt="Spotify" width={24} height={24} />
                                    <span>Powered by Spotify Web API</span>
                                </div>
                            </div>
                        )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder={t('searchSongsPlaceholder')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            {searchQuery.trim() === '' ? (
                <Tabs defaultValue="genres" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="genres">{t('genres')}</TabsTrigger>
                        <TabsTrigger value="artists">{t('artists')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="genres" className="mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            {genres.map(genre => (
                                <Card key={genre.name} className="overflow-hidden relative aspect-square group">
                                    <Image src={genre.image} alt={genre.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                                    <div className="absolute inset-0 bg-black/40"></div>
                                    <CardContent className="relative flex h-full items-end justify-center p-4">
                                        <h3 className="text-lg font-bold text-white text-center">{genre.name}</h3>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="artists" className="mt-6">
                        {isLoadingArtists ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {artists.map(artist => (
                                    <Card key={artist.id} className='cursor-pointer hover:bg-muted/50' onClick={() => handleArtistClick(artist.id)}>
                                        <CardContent className="p-3 flex items-center gap-4">
                                            <Avatar className='h-12 w-12'>
                                                <AvatarImage src={artist.image} alt={artist.name} />
                                                <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <h3 className="text-md font-semibold">{artist.name}</h3>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            ) : (
                <div>
                    <h2 className="text-lg font-semibold mb-2">{t('searchResultsFor', { query: debouncedSearchQuery })}</h2>
                    {isSearching ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {searchResults.length > 0 ? (
                                searchResults.map(track => {
                                    const isSaved = isSongSaved(track.id);
                                    return (
                                        <Card key={track.id}>
                                            <CardContent className="p-2 flex items-center gap-4">
                                                <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md object-cover" />
                                                <div className="flex-grow">
                                                    <p className="font-semibold">{track.title}</p>
                                                    <div className="flex text-sm text-muted-foreground">
                                                        <span>{track.artist}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{track.duration}</span>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={() => isSaved ? unsaveSong(track.id) : saveSong(track)}>
                                                    <Bookmark className={cn("h-5 w-5", isSaved ? "text-primary fill-primary" : "text-muted-foreground")}/>
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => addToPlaylist(track)}>
                                                    <Plus className="h-5 w-5"/>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>{t('noTracksFound')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Now Playing Bar and Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNav />
      </div>
    </div>
    </>
  );
}
