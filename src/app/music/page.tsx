
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, ListVideo, Mic2, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/bottom-nav';
import { Separator } from '@/components/ui/separator';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { Progress } from '@/components/ui/progress';


const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));

const genres = [
  { name: 'Highlife', image: musicArtworks[0]?.imageUrl || '' },
  { name: 'Hiphop', image: musicArtworks[1]?.imageUrl || '' },
  { name: 'Afrobeat', image: musicArtworks[2]?.imageUrl || '' },
  { name: 'Gospel', image: musicArtworks[3]?.imageUrl || '' },
];

const newTracks = [
  { id: 1, title: 'Morning Rise', artist: 'Synth Weaver', image: musicArtworks[4]?.imageUrl || '', duration: '3:45' },
  { id: 2, title: 'Coastal Drive', artist: 'Groove Rider', image: musicArtworks[0]?.imageUrl || '', duration: '2:55' },
  { id: 3, title: 'City Lights', artist: 'Digital Nomad', image: musicArtworks[1]?.imageUrl || '', duration: '4:10' },
  { id: 4, title: 'Starlight Echo', artist: 'Astro Beats', image: musicArtworks[2]?.imageUrl || '', duration: '3:20' },
];

type Track = {
    id: number;
    title: string;
    artist: string;
    image: string;
    duration: string;
};

type PlaylistItem = Track & { addedByUser: boolean };

const initialPlaylist: PlaylistItem[] = [
    { id: 101, title: 'Accra Night', artist: 'E.L', image: musicArtworks[1]?.imageUrl || '', duration: '3:15', addedByUser: false },
    { id: 102, title: 'Adonai', artist: 'Sarkodie', image: musicArtworks[3]?.imageUrl || '', duration: '4:02', addedByUser: false },
];


export default function MusicPage() {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
    const [nowPlaying, setNowPlaying] = useState<PlaylistItem | null>(initialPlaylist[0] || null);
    const [songProgress, setSongProgress] = useState(0);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const { toast } = useToast();

     useEffect(() => {
        if (nowPlaying) {
            setSongProgress(0); // Reset progress when song changes
            const durationInSeconds = 180; // Mock duration of 3 minutes
            const interval = setInterval(() => {
                setSongProgress(prev => {
                    const nextProgress = prev + 100 / durationInSeconds;
                    if (nextProgress >= 100) {
                        // Move to next song
                        const currentIndex = playlist.findIndex(p => p.id === nowPlaying.id);
                        const nextIndex = (currentIndex + 1) % playlist.length;
                        setNowPlaying(playlist[nextIndex] || null);
                        return 0;
                    }
                    return nextProgress;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [nowPlaying, playlist]);

    const addToPlaylist = (track: Track) => {
        if (playlist.find(t => t.id === track.id)) {
             toast({
                variant: 'destructive',
                title: 'Already in Playlist',
                description: `${track.title} is already in the bus playlist.`,
            });
            return;
        }
        const newTrack = { ...track, addedByUser: true };
        setPlaylist(prev => [...prev, newTrack]);

        // If nothing is playing, make this the new song
        if (!nowPlaying) {
            setNowPlaying(newTrack);
        }

        toast({
            title: 'Added to Playlist',
            description: `${track.title} by ${track.artist} has been added to the bus playlist.`,
        });
    };
    
    const removeFromPlaylist = (trackId: number) => {
        const songToRemove = playlist.find(t => t.id === trackId);
        if (!songToRemove || !songToRemove.addedByUser) {
            toast({
                variant: "destructive",
                title: "Cannot Remove",
                description: "You can only remove songs you have added.",
            });
            return;
        }
        
        let newPlaylist = playlist.filter(t => t.id !== trackId);

        // If the removed song was the one playing, play the next one
        if (nowPlaying?.id === trackId) {
            const currentIndex = playlist.findIndex(p => p.id === trackId);
            const nextSong = playlist[currentIndex + 1] || playlist[0] || null;
            if (nextSong && nextSong.id === trackId) { // if it's the only song
                setNowPlaying(null);
            } else {
                setNowPlaying(nextSong);
            }
        }
        
        setPlaylist(newPlaylist);

        toast({
            title: 'Song Removed',
            description: 'The song has been removed from the playlist.',
        });
    };

    const NowPlayingBar = () => {
        if (!nowPlaying) return null;

        return (
            <div className="sticky bottom-0 z-20" onClick={() => setIsPlaylistOpen(true)}>
                <div className="bg-background/80 backdrop-blur-sm p-2 max-w-md mx-auto">
                     <div className="p-2 bg-secondary rounded-lg flex items-center gap-4">
                        <Image src={nowPlaying.image} alt={nowPlaying.title} width={40} height={40} className="rounded-md" />
                        <div className="flex-grow">
                            <p className="font-semibold text-sm">{nowPlaying.title}</p>
                            <p className="text-xs text-muted-foreground">{nowPlaying.artist}</p>
                        </div>
                        <NowPlayingIcon />
                    </div>
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
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
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
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

            <div>
                <h2 className="text-lg font-semibold mb-2">New Tracks</h2>
                <div className="space-y-2">
                    {newTracks.map(track => (
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
                    ))}
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
}
