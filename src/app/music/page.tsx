
'use client';

import { Music } from 'lucide-react';

export default function MusicPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Music className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-foreground">MUSIC</h1>
      <p className="text-muted-foreground mt-2">
        This is where the Music feature will live.
      </p>
    </div>
  );
}
