
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getArtist, getArtistAlbums, getAlbumTracks } from '@/lib/spotify';
import { Loader2, Music, ArrowLeft, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMusic, Track } from '@/context/music-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useTrip } from '@/context/trip-context';


function ArtistDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const artistId = searchParams.get('artistId');

    const [artist, setArtist] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);

    const { playlist, nowPlaying, addSong } = useMusic();
    const { activeTrip } = useTrip();
    const { toast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        if (artistId) {
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
                }
                setIsLoading(false);
            };
            fetchData();
        }
    }, [artistId]);

    const handleAlbumClick = async (album: any) => {
        setSelectedAlbum(album);
        setIsLoadingTracks(true);
        const tracks = await getAlbumTracks(album.id);
        setSelectedAlbumTracks(tracks);
        setIsLoadingTracks(false);
    }
    
    const handleAddSong = (track: any) => {
        if (!activeTrip) {
            toast({
                variant: "destructive",
                title: t('notOnBusToastTitle'),
                description: t('notOnBusToastDescription'),
            });
            return;
        }

        const newTrack: Track = {
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            albumArt: selectedAlbum?.images[0]?.url || artist.images[0]?.url,
            duration: track.duration_ms,
        };

        if (playlist.find(s => s.id === newTrack.id) || nowPlaying?.id === newTrack.id) {
            toast({
                variant: "destructive",
                title: t('alreadyInPlaylistToastTitle'),
                description: t('alreadyInPlaylistToastDescription', { title: newTrack.title }),
            });
            return;
        }
        addSong(newTrack, "user-id"); // Mock user ID
        toast({
            title: t('addedToPlaylistToastTitle'),
            description: t('addedToPlaylistToastDescription', { title: newTrack.title, artist: newTrack.artist }),
        });
    };

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
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
                        <p className="text-muted-foreground">{artist.followers.toLocaleString()} followers</p>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <h3 className="text-xl font-bold">Albums</h3>
                    <ScrollArea className="w-full">
                        <div className="flex space-x-4 pb-4">
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
                    </ScrollArea>

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
                                            <Button size="icon" variant="ghost" onClick={() => handleAddSong(track)} disabled={!activeTrip}>
                                                <Plus className='h-5 w-5' />
                                            </Button>
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


export default function ArtistDetailsPageWrapper() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ArtistDetailsPage />
        </Suspense>
    )
}
