
'use client';

import { useRouter } from 'next/navigation';
import { useSavedSongs } from '@/context/saved-songs-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, Heart, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMusic, Track } from '@/context/music-context';
import { useTrip } from '@/context/trip-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

export default function SavedSongsPage() {
    const router = useRouter();
    const { savedSongs, unsaveSong } = useSavedSongs();
    const { playlist, nowPlaying, addSong } = useMusic();
    const { activeTrip } = useTrip();
    const { toast } = useToast();
    const { t } = useLanguage();

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
        addSong(song, "user-id");
        toast({
            title: t('addedToPlaylistToastTitle'),
            description: t('addedToPlaylistToastDescription', { title: song.title, artist: song.artist }),
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
             <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold">Saved Songs</h1>
            </header>

            <main className="flex-grow p-4">
                <div className="max-w-md mx-auto">
                    {savedSongs.length > 0 ? (
                        <Card>
                            <CardContent className="p-2">
                                <ScrollArea className="h-[75vh]">
                                    <div className="space-y-2 p-2">
                                        {savedSongs.map(track => (
                                             <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                                <Avatar className='h-12 w-12 rounded-md'>
                                                    {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                                                    <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                                </Avatar>
                                                <div className='flex-grow'>
                                                    <p className='font-semibold truncate'>{track.title}</p>
                                                    <p className='text-sm text-muted-foreground'>{track.artist}</p>
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={() => handleAddSong(track)}>
                                                    <Plus className='h-5 w-5' />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => unsaveSong(track.id)}>
                                                    <Heart className='h-5 w-5 text-primary fill-primary' />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-[70vh] text-muted-foreground">
                            <Heart className="h-16 w-16 mb-4" />
                            <h2 className="text-xl font-semibold">No Saved Songs</h2>
                            <p className="mt-2">Tap the heart icon on a song to save it here.</p>
                             <Button onClick={() => router.push('/music')} className="mt-4">Browse Music</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

