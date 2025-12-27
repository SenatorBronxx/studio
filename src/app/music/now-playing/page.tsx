
'use client';

import { useRouter } from 'next/navigation';
import { useMusic } from '@/context/music-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Music, Pause, Play, Heart, Share2, ListMusic } from 'lucide-react';
import { useSavedSongs } from '@/context/saved-songs-context';
import { useLanguage } from '@/context/language-context';

export default function NowPlayingPage() {
    const router = useRouter();
    const { nowPlaying, isPlaying, progress, togglePlay, playlist } = useMusic();
    const { isSongSaved, saveSong, unsaveSong } = useSavedSongs();
    const { t } = useLanguage();

    if (!nowPlaying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <Music className="h-16 w-16 text-primary mb-4" />
                <h1 className="text-2xl font-bold text-foreground">No song playing</h1>
                <p className="text-muted-foreground mt-2">
                    Add a song to the bus playlist to start listening.
                </p>
                <Button onClick={() => router.push('/music')} className="mt-4">
                    Go to Music
                </Button>
            </div>
        );
    }
    
    const handleSaveToggle = () => {
        if (isSongSaved(nowPlaying.id)) {
            unsaveSong(nowPlaying.id);
        } else {
            saveSong(nowPlaying);
        }
    };
    
    const formatDuration = (ms: number, p: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const currentSeconds = Math.floor(totalSeconds * (p / 100));
        
        const formatTime = (seconds: number) => {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        return {
            currentTime: formatTime(currentSeconds),
            totalTime: formatTime(totalSeconds)
        };
    };

    const { currentTime, totalTime } = formatDuration(nowPlaying.duration, progress);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-primary/10 to-background">
             <header className="p-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                 <h1 className="text-lg font-semibold">{t('nowPlaying')}</h1>
                 <Button variant="ghost" size="icon" disabled>
                    <Share2 className="h-5 w-5" />
                </Button>
            </header>

            <main className="flex-grow flex flex-col justify-center items-center p-4 space-y-8">
                 <Avatar className="h-64 w-64 rounded-lg shadow-2xl">
                    <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />
                    <AvatarFallback className="rounded-lg"><Music/></AvatarFallback>
                </Avatar>

                <div className="text-center">
                    <h2 className="text-3xl font-bold">{nowPlaying.title}</h2>
                    <p className="text-lg text-muted-foreground">{nowPlaying.artist}</p>
                </div>

                <div className="w-full max-w-sm space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{currentTime}</span>
                        <span>{totalTime}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6">
                     <Button variant="ghost" size="icon" className="h-16 w-16" onClick={handleSaveToggle}>
                        <Heart className={isSongSaved(nowPlaying.id) ? 'h-7 w-7 text-primary fill-primary' : 'h-7 w-7'} />
                    </Button>
                    <Button
                        size="icon"
                        className="h-20 w-20 rounded-full shadow-lg"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 pl-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-16 w-16" disabled>
                         <ListMusic className="h-7 w-7" />
                    </Button>
                </div>
            </main>
        </div>
    )
}
