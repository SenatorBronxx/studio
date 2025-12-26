
'use client';

import { useLanguage } from '@/context/language-context';
import { Music } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function MusicPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <Music className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground">{t('music')}</h1>
        <p className="text-muted-foreground mt-2">
          The music feature is currently unavailable.
        </p>
      </main>
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}
