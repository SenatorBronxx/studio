
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export default function TripQrsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tripHistory: any[] = [];

  const generateQrCodeUrl = (tripData: any) => {
    const encodedData = encodeURIComponent(JSON.stringify(tripData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
  }

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
          <h1 className="text-lg font-semibold mx-auto">{t('tripQrCodes')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
                <CardTitle>{t('tripQrCodesTitle')}</CardTitle>
                <CardDescription>{t('tripQrCodesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {tripHistory.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                        {tripHistory.map((trip) => {
                            const qrData = {
                                tripId: trip.id,
                                plate: trip.plate,
                                amount: trip.amount,
                                type: trip.type,
                                timestamp: new Date().toISOString() // In a real app, you'd store the trip timestamp
                            };
                            const qrUrl = generateQrCodeUrl(qrData);

                            return (
                                <div key={trip.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <div className="p-2 border rounded-md">
                                        <Image src={qrUrl} alt={`QR Code for trip ${trip.plate}`} width={64} height={64} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{t('tripOnBus', { plate: trip.plate })}</p>
                                        <p className="text-sm text-muted-foreground">{t('journeyDetailsPlaceholder')}</p>
                                        <p className="font-semibold text-sm">GH₵{Math.abs(trip.amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                        <QrCode className="h-12 w-12 mb-4" />
                        <h3 className="font-semibold">{t('noTripQrs')}</h3>
                        <p className="text-sm mt-1">{t('noTripQrsDescription')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
