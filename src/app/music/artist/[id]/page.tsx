
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Bookmark, Loader2, Music, Plus } from 'lucide-react';
import { getArtistAlbums, type ArtistAlbum, type AlbumTrack as ApiAlbumTrack } from '@/ai/flows/get-artist-albums';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useMusic, type Track } from '@/context/music-context';
import { useSavedSongs } from '@/context/saved-songs-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/bottom-nav';


export default function ArtistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const artistId = params.id as string;

    const { addToPlaylist } = useMusic();
    const { saveSong, unsaveSong, isSongSaved } = useSavedSongs();

    const [artist, setArtist] = useState<ArtistAlbum['artist'] | null>(null);
    const [albums, setAlbums] = useState<ArtistAlbum['albums']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!artistId) return;

        const fetchArtistDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getArtistAlbums({ artistId });
                if (response.artist && response.albums) {
                    setArtist(response.artist);
                    setAlbums(response.albums);
                } else {
                    setError("Could not find details for this artist.");
                }
            } catch (err) {
                console.error("Error fetching artist details:", err);
                setError("Failed to fetch artist details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistDetails();
    }, [artistId]);

    const handleBackClick = () => {
        router.back();
    };

    const convertToTrack = (albumTrack: ApiAlbumTrack, albumImage: string): Track => {
        return {
            id: albumTrack.id,
            title: albumTrack.name,
            artist: albumTrack.artists,
            duration: albumTrack.duration,
            image: albumImage
        };
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading artist details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background text-center p-4">
                <h1 className="text-xl font-bold text-destructive">{error}</h1>
                <Button onClick={handleBackClick} className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    if (!artist) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-20 p-4 bg-background/75 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBackClick}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            <main className="flex-grow pb-24">
                {/* Artist Hero */}
                <div className="relative h-48 md:h-64 w-full">
                    <Image
                        src={artist.image}
                        alt={artist.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full max-w-4xl mx-auto">
                       <div className='flex items-end gap-4'>
                         <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={artist.image} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <h1 className="text-3xl md:text-5xl font-bold">{artist.name}</h1>
                             <div className='flex flex-wrap gap-2 mt-2'>
                                {artist.genres.map(genre => (
                                    <Badge key={genre} variant="secondary" className='capitalize'>{genre}</Badge>
                                ))}
                             </div>
                        </div>
                       </div>
                    </div>
                </div>
                
                <div className="p-4 max-w-4xl mx-auto space-y-6">
                    <h2 className='text-2xl font-bold'>Albums</h2>
                     <Accordion type="single" collapsible className="w-full space-y-4">
                        {albums.map((album) => (
                             <Card key={album.id} className="bg-muted/30">
                                <AccordionItem value={album.id} className='border-b-0'>
                                     <AccordionTrigger className='p-4 hover:no-underline'>
                                        <div className='flex items-center gap-4 text-left'>
                                            <Image src={album.image} alt={album.name} width={64} height={64} className='rounded-md aspect-square object-cover'/>
                                            <div>
                                                <p className='font-semibold'>{album.name}</p>
                                                <p className='text-sm text-muted-foreground'>{album.releaseYear} • {album.totalTracks} songs</p>
                                            </div>
                                        </div>
                                     </AccordionTrigger>
                                     <AccordionContent>
                                        <div className='px-4 pb-4'>
                                            <Separator className='mb-4' />
                                            <div className='space-y-2'>
                                            {album.tracks.map((track, index) => {
                                                const fullTrack = convertToTrack(track, album.image);
                                                const isSaved = isSongSaved(fullTrack.id);
                                                return (
                                                <div key={track.id} className="flex items-center gap-4 group p-2 rounded-md hover:bg-muted">
                                                    <span className="text-sm font-mono text-muted-foreground w-6 text-center">{index + 1}</span>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold">{track.name}</p>
                                                        <p className="text-sm text-muted-foreground">{track.duration}</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="shrink-0 opacity-0 group-hover:opacity-100" onClick={() => isSaved ? unsaveSong(fullTrack.id) : saveSong(fullTrack)}>
                                                        <Bookmark className={cn("h-5 w-5", isSaved ? "text-primary fill-primary" : "text-muted-foreground")}/>
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="shrink-0 opacity-0 group-hover:opacity-100" onClick={() => addToPlaylist(fullTrack)}>
                                                        <Plus className="h-5 w-5 text-muted-foreground"/>
                                                    </Button>
                                                </div>
                                            )})}
                                            </div>
                                        </div>
                                     </AccordionContent>
                                </AccordionItem>
                             </Card>
                        ))}
                     </Accordion>
                </div>
            </main>
            <div className="fixed bottom-0 left-0 right-0 z-10">
                <BottomNav />
            </div>
        </div>
    );
}

