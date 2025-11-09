
'use client';

import { Music } from 'lucide-react';

export default function MusicPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <Music className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">MUSIC</h1>
      <p className="text-gray-500 mt-2">
        This is where the Music feature will live.
      </p>
    </div>
  );
}
