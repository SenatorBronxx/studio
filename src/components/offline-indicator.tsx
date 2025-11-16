
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background/95 p-8 text-center backdrop-blur-sm',
        'animate-in fade-in duration-500'
      )}
    >
      <div className="relative h-48 w-48 flex items-center justify-center">
         <Image src="https://cdn-icons-png.flaticon.com/512/10479/10479796.png" alt="No internet connection" width={160} height={160} className="opacity-70" />
      </div>

      <div className="max-w-xs space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('noConnection')}
        </h1>
        <p className="text-muted-foreground">
          {t('noConnectionDescription')}
        </p>
      </div>
    </div>
  );
}
