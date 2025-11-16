
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, ListVideo, Plus, X, Search, Bus, LogIn, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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

const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));
const fallbackImage = PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '';

const genres = [
  { name: 'Highlife', image: musicArtworks[0]?.imageUrl || '' },
  { name: 'Hiphop', image: musicArtworks[1]?.imageUrl || '' },
  { name: 'Afrobeat', image: musicArtworks[2]?.imageUrl || '' },
  { name: 'Gospel', image: musicArtworks[3]?.imageUrl || '' },
];

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


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

    const { t } = useLanguage();
    const { user } = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`https://www.theaudiodb.com/api/v1/json/123/search.php?s=${query}`);
            const data = await response.json();
            
            if (data && data.track) {
                 const tracks: Track[] = data.track.map((song: any) => ({
                    id: parseInt(song.idTrack, 10),
                    title: song.strTrack,
                    artist: song.strArtist,
                    image: song.strTrackThumb || fallbackImage,
                    duration: song.intDuration ? formatDuration(song.intDuration) : '0:00',
                }));
                setSearchResults(tracks);
            } else {
                setSearchResults([]);
            }

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 space-y-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('browse')}</h1>
            <Sheet open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ListVideo className="h-6 w-6" />
                         {isOnBus && playlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-primary-foreground text-xs items-center justify-center">
                                    {playlist.length}
                                </span>
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{t('busPlaylist')}</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 flex flex-col h-full">
                       {isOnBus ? (
                        <>
                            {nowPlaying ? (
                                <>
                                    <div className='mb-4 space-y-3'>
                                        <p className="text-sm font-medium text-muted-foreground">{t('nowPlaying')}</p>
                                        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
                                            <Image src={nowPlaying.image} alt={nowPlaying.title} width={48} height={48} className="rounded-md object-cover" />
                                            <div className="flex-grow space-y-2">
                                                <div>
                                                    <p className="font-semibold">{nowPlaying.title}</p>
                                                    <div className="flex text-sm text-muted-foreground">
                                                        <span>{nowPlaying.artist}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{nowPlaying.duration}</span>
                                                    </div>
                                                </div>
                                                 <Progress value={songProgress} className="h-1" />
                                            </div>
                                            <NowPlayingIcon />
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                           ) : null}

                           <div className="flex-grow overflow-y-auto mt-4">
                            {playlist.filter(p => p.id !== nowPlaying?.id).length > 0 ? (
                                 <>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">{t('upNext')}</p>
                                    <div className="space-y-3">
                                    {playlist.filter(p => p.id !== nowPlaying?.id).map((track: PlaylistItem) => (
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
  );
}
