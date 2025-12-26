
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';

export default function RecentTripsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tripHistory: any[] = [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('recentTrips')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
                <CardTitle>{t('yourTripHistory')}</CardTitle>
                <CardDescription>{t('yourTripHistoryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {tripHistory.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                        {tripHistory.map((trip) => (
                            <div key={trip.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                    <AvatarFallback>
                                        <Bus className='w-5 h-5'/>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{t('tripOnBus', { plate: trip.plate })}</p>
                                    <p className="text-sm text-muted-foreground">{t('journeyDetailsPlaceholder')}</p>
                                </div>
                                <div className="font-semibold text-right">
                                    <p>GH₵{Math.abs(trip.amount).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground font-normal">{t('fare')}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                        <History className="h-12 w-12 mb-4" />
                        <h3 className="font-semibold">{t('noTripHistory')}</h3>
                        <p className="text-sm mt-1">{t('noTripHistoryDescription')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
