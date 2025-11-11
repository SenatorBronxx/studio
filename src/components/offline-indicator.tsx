
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { SatelliteIcon } from '@/components/icons/satellite';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

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
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 animate-satellite-orbit-outer">
          <div className="h-full w-full animate-satellite-orbit-inner">
            <SatelliteIcon className="h-full w-full text-primary" />
          </div>
        </div>
      </div>

      <div className="max-w-xs space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          No Connection
        </h1>
        <p className="text-muted-foreground">
          Please check your internet connection and try again. The app will
          automatically reconnect when it's back online.
        </p>
      </div>
    </div>
  );
}
