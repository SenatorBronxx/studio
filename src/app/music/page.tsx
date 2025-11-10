
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, ListVideo, Mic2, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/bottom-nav';

const musicArtworks = PlaceHolderImages.filter(p => p.id.startsWith('music-art-'));

const genres = [
  { name: 'Highlife', image: musicArtworks[0]?.imageUrl || '' },
  { name: 'Hiphop', image: musicArtworks[1]?.imageUrl || '' },
  { name: 'Afrobeat', image: musicArtworks[2]?.imageUrl || '' },
  { name: 'Gospel', image: musicArtworks[3]?.imageUrl || '' },
];

const newTracks = [
  { id: 1, title: 'Morning Rise', artist: 'Synth Weaver', image: musicArtworks[4]?.imageUrl || '' },
  { id: 2, title: 'Coastal Drive', artist: 'Groove Rider', image: musicArtworks[0]?.imageUrl || '' },
  { id: 3, title: 'City Lights', artist: 'Digital Nomad', image: musicArtworks[1]?.imageUrl || '' },
  { id: 4, title: 'Starlight Echo', artist: 'Astro Beats', image: musicArtworks[2]?.imageUrl || '' },
];

type Track = {
    id: number;
    title: string;
    artist: string;
    image: string;
};

type PlaylistItem = Track & { addedByUser: boolean };

const initialPlaylist: PlaylistItem[] = [
    { id: 101, title: 'Accra Night', artist: 'E.L', image: musicArtworks[1]?.imageUrl || '', addedByUser: false },
    { id: 102, title: 'Adonai', artist: 'Sarkodie', image: musicArtworks[3]?.imageUrl || '', addedByUser: false },
];


export default function MusicPage() {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
    const { toast } = useToast();

    const addToPlaylist = (track: Track) => {
        if (playlist.find(t => t.id === track.id)) {
             toast({
                variant: 'destructive',
                title: 'Already in Playlist',
                description: `${track.title} is already in the bus playlist.`,
            });
            return;
        }
        setPlaylist(prev => [...prev, { ...track, addedByUser: true }]);
        toast({
            title: 'Added to Playlist',
            description: `${track.title} by ${track.artist} has been added to the bus playlist.`,
        });
    };
    
    const removeFromPlaylist = (trackId: number) => {
        setPlaylist(prev => prev.filter(t => t.id !== trackId));
        toast({
            title: 'Song Removed',
            description: 'The song has been removed from the playlist.',
        });
    };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Browse</h1>
            <Sheet>
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
                    <div className="py-4 space-y-4">
                        {playlist.length > 0 ? (
                            playlist.map(track => (
                                <div key={track.id} className="flex items-center gap-4 group">
                                    <Image src={track.image} alt={track.title} width={48} height={48} className="rounded-md" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{track.title}</p>
                                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                                    </div>
                                    {track.addedByUser && (
                                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={() => removeFromPlaylist(track.id)}>
                                            <X className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <ListMusic className="h-12 w-12 mx-auto mb-4" />
                                <p>No songs added yet.</p>
                                <p className="text-xs">Browse and add songs to the playlist.</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4">
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
                                    <p className="text-sm text-muted-foreground">{track.artist}</p>
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

      {/* Bottom Nav */}
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}
