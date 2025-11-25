
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, Plus, X, Search, Bus, LogIn, Loader2, Info, MusicIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BottomNav } from '@/components/bottom-nav';
import { Separator } from '@/components/ui/separator';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useMusic, type Track, PlaylistItem } from '@/context/music-context';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { searchMusic } from '@/ai/flows/search-music';
import { getSongInsights, type SongInsightsOutput } from '@/ai/flows/get-song-insights';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));
const fallbackImage = PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '';

const genres = [
  { name: 'Highlife', image: musicArtworks[0]?.imageUrl || '' },
  { name: 'Hiphop', image: musicArtworks[1]?.imageUrl || '' },
  { name: 'Afrobeat', image: musicArtworks[2]?.imageUrl || '' },
  { name: 'Gospel', image: musicArtworks[3]?.imageUrl || '' },
];

const AnimatedLyrics = ({ lyrics, songProgress }: { lyrics: SongInsightsOutput['lyrics'], songProgress: number }) => {
    const songDuration = 180; // Mock duration of 3 minutes (180s)
    const currentTime = (songProgress / 100) * songDuration;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLParagraphElement>(null);

    const activeLineIndex = lyrics.findIndex((line, i) => {
        const nextLine = lyrics[i + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    useEffect(() => {
        if (activeLineRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const activeLine = activeLineRef.current;
            const containerHeight = container.clientHeight;
            const lineTop = activeLine.offsetTop;
            const lineHeight = activeLine.clientHeight;

            // Scroll to center the active line
            const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
            
            container.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    }, [activeLineIndex]);


    return (
        <ScrollArea ref={scrollContainerRef} className="h-[250px] w-full text-center">
             <div className='py-8'>
                {lyrics.map((line, index) => (
                    <p
                        key={index}
                        ref={index === activeLineIndex ? activeLineRef : null}
                        className={cn(
                            "text-xl font-medium transition-all duration-300 ease-in-out py-1 font-mono",
                            index === activeLineIndex
                                ? 'text-foreground scale-105'
                                : 'text-muted-foreground/50 scale-100'
                        )}
                    >
                        {line.line}
                    </p>
                ))}
             </div>
        </ScrollArea>
    );
};


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
        upvoteSong,
        downvoteSong,
    } = useMusic();

    const { t } = useLanguage();
    const { user } = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [songInsights, setSongInsights] = useState<SongInsightsOutput | null>(null);
    const [isFetchingInsights, setIsFetchingInsights] = useState(false);
    const [isInsightsSheetOpen, setIsInsightsSheetOpen] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
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
        handleSearch(debouncedSearchQuery);
    }, [debouncedSearchQuery, handleSearch]);

    const handleFetchInsights = useCallback(async () => {
        if (!nowPlaying) return;

        setIsFetchingInsights(true);
        setIsInsightsSheetOpen(true);
        setSongInsights(null); // Clear previous insights
        try {
            const insights = await getSongInsights({ title: nowPlaying.title, artist: nowPlaying.artist });
            setSongInsights(insights);
        } catch (error) {
            console.error("Error fetching song insights:", error);
            setSongInsights({ trivia: "Could not load insights at this time.", lyrics: [] });
        } finally {
            setIsFetchingInsights(false);
        }
    }, [nowPlaying]);

    const NowPlayingBar = () => {
        if (!nowPlaying) return null;

        return (
            <div className="bg-background/75 backdrop-blur-sm p-2 max-w-md mx-auto" onClick={() => setIsPlaylistOpen(true)}>
                 <div className="p-2 bg-secondary rounded-lg flex items-center gap-4 cursor-pointer">
                    <Image src={nowPlaying.image} alt={nowPlaying.title} width={40} height={40} className="rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{nowPlaying.title}</p>
                        <p className="text-xs text-muted-foreground">{nowPlaying.artist}</p>
                    </div>
                    <NowPlayingIcon />
                </div>
            </div>
        )
    }

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
        .filter(p => p.id !== nowPlaying?.id)
        .sort((a, b) => b.votes - a.votes);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 space-y-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('browse')}</h1>
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
                                            <Progress value={songProgress} className="h-1 bg-white/20 mt-2" indicatorClassName="bg-white" />
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={handleFetchInsights}>
                                        <Info className="mr-2 h-4 w-4" />
                                        View Lyrics & Insights
                                    </Button>
                                    <Separator />
                                </div>
                           ) : null}

                           <div className="flex-grow overflow-y-auto">
                            {upNextPlaylist.length > 0 ? (
                                 <>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">{t('upNext')}</p>
                                    <div className="space-y-3">
                                    {upNextPlaylist.map((track: PlaylistItem) => (
                                        <div key={track.id} className="flex items-center gap-2 group">
                                            <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md object-cover" />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{track.title}</p>
                                                <div className="flex text-sm text-muted-foreground">
                                                    <span>{track.artist}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{track.duration}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Button size="icon" variant="ghost" className={cn("h-6 w-6", track.userVote === 'up' && 'text-primary')} onClick={() => upvoteSong(track.id)}>
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm font-bold w-6 text-center">{track.votes}</span>
                                                <Button size="icon" variant="ghost" className={cn("h-6 w-6", track.userVote === 'down' && 'text-destructive')} onClick={() => downvoteSong(track.id)}>
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
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
                            <Bus className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold">{t('boardBusToSeePlaylist')}</h3>
                            <p className="text-sm mt-1">{t('playlistOnlyOnTrip')}</p>
                        </div>
                       )}
                    </div>
                </SheetContent>
            </Sheet>
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
                <Tabs defaultValue="genres">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="moods">{t('moods')}</TabsTrigger>
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
                    <TabsContent value="moods">
                         <div className="text-center text-muted-foreground py-12">
                            <p>{t('moodsComingSoon')}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="artists">
                         <div className="text-center text-muted-foreground py-12">
                            <p>{t('artistsComingSoon')}</p>
                        </div>
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
                                searchResults.map(track => (
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
                                            <Button size="icon" variant="ghost" onClick={() => addToPlaylist(track)}>
                                                <Plus className="h-5 w-5"/>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
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
        {isOnBus && nowPlaying && <NowPlayingBar />}
        <BottomNav />
      </div>
    </div>

    <Sheet open={isInsightsSheetOpen} onOpenChange={setIsInsightsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-2xl flex flex-col">
            <SheetHeader>
                <SheetTitle>
                    {nowPlaying?.title}
                </SheetTitle>
                <p className='text-sm text-muted-foreground'>{nowPlaying?.artist}</p>
            </SheetHeader>
            {isFetchingInsights || !songInsights ? (
                 <div className="flex flex-col items-center justify-center flex-grow py-8 text-muted-foreground">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin mb-4" />
                    <p>Fetching insights...</p>
                </div>
            ) : (
                <div className='flex flex-col flex-grow overflow-hidden'>
                    <div className='space-y-4 my-4 shrink-0'>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 px-6"><Info className="h-5 w-5 text-primary"/>Trivia</h3>
                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg mx-6 mt-2">{songInsights.trivia}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 px-6"><MusicIcon className="h-5 w-5 text-primary"/>Lyrics</h3>
                        </div>
                    </div>
                    {songInsights.lyrics.length > 0 ? (
                        <AnimatedLyrics lyrics={songInsights.lyrics} songProgress={songProgress} />
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">Lyrics are not available for this song.</p>
                    )}
                </div>
            )}
        </SheetContent>
    </Sheet>
    </>
  );
}
