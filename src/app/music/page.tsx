
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, ListVideo, Plus, X, Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BottomNav } from '@/components/bottom-nav';
import { Separator } from '@/components/ui/separator';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useMusic, type Track } from '@/context/music-context';


const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));

const genres = [
  { name: 'Highlife', image: musicArtworks[0]?.imageUrl || '' },
  { name: 'Hiphop', image: musicArtworks[1]?.imageUrl || '' },
  { name: 'Afrobeat', image: musicArtworks[2]?.imageUrl || '' },
  { name: 'Gospel', image: musicArtworks[3]?.imageUrl || '' },
];

const newTracks: Track[] = [
  { id: 1, title: 'Morning Rise', artist: 'Synth Weaver', image: musicArtworks[4]?.imageUrl || '', duration: '3:45' },
  { id: 2, title: 'Coastal Drive', artist: 'Groove Rider', image: musicArtworks[0]?.imageUrl || '', duration: '2:55' },
  { id: 3, title: 'City Lights', artist: 'Digital Nomad', image: musicArtworks[1]?.imageUrl || '', duration: '4:10' },
  { id: 4, title: 'Starlight Echo', artist: 'Astro Beats', image: musicArtworks[2]?.imageUrl || '', duration: '3:20' },
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
    } = useMusic();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTracks, setFilteredTracks] = useState(newTracks);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTracks(newTracks);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const results = newTracks.filter(track =>
                track.title.toLowerCase().includes(lowercasedQuery) ||
                track.artist.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredTracks(results);
        }
    }, [searchQuery]);


    const NowPlayingBar = () => {
        if (!nowPlaying) return null;

        return (
            <div className="bg-background/80 backdrop-blur-sm p-2 max-w-md mx-auto" onClick={() => setIsPlaylistOpen(true)}>
                 <div className="p-2 bg-secondary rounded-lg flex items-center gap-4 cursor-pointer">
                    <Image src={nowPlaying.image} alt={nowPlaying.title} width={40} height={40} className="rounded-md" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{nowPlaying.title}</p>
                        <p className="text-xs text-muted-foreground">{nowPlaying.artist}</p>
                    </div>
                    <NowPlayingIcon />
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 space-y-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Browse</h1>
            <Sheet open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ListVideo className="h-6 w-6" />
                         {playlist.length > 0 && (
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
                        <SheetTitle>Bus Playlist</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 flex flex-col h-full">
                       {nowPlaying ? (
                            <>
                                <div className='mb-4 space-y-3'>
                                    <p className="text-sm font-medium text-muted-foreground">Now Playing</p>
                                    <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
                                        <Image src={nowPlaying.image} alt={nowPlaying.title} width={48} height={48} className="rounded-md" />
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
                                <p className="text-sm font-medium text-muted-foreground mb-2">Up next</p>
                                <div className="space-y-3">
                                {playlist.filter(p => p.id !== nowPlaying?.id).map(track => (
                                    <div key={track.id} className="flex items-center gap-4 group">
                                        <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md" />
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
                                <p>No songs added yet.</p>
                                <p className="text-xs">Browse and add songs to the playlist.</p>
                            </div>
                        ) : null}
                       </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for songs or artists" 
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
                        <TabsTrigger value="moods">Moods</TabsTrigger>
                        <TabsTrigger value="genres">Genres</TabsTrigger>
                        <TabsTrigger value="artists">Artists</TabsTrigger>
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
                            <p>Moods feature coming soon!</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="artists">
                         <div className="text-center text-muted-foreground py-12">
                            <p>Artists feature coming soon!</p>
                        </div>
                    </TabsContent>
                </Tabs>
            ) : null }

            <div>
                <h2 className="text-lg font-semibold mb-2">{searchQuery.trim() === '' ? 'New Tracks' : `Results for "${searchQuery}"`}</h2>
                <div className="space-y-2">
                    {filteredTracks.length > 0 ? (
                        filteredTracks.map(track => (
                            <Card key={track.id}>
                                <CardContent className="p-2 flex items-center gap-4">
                                    <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md" />
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
                            <p>No tracks found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      {/* Now Playing Bar and Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        {nowPlaying && <NowPlayingBar />}
        <BottomNav />
      </div>
    </div>
  );

    
