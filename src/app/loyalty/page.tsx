
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Bus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/context/wallet-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';
import { BottomNav } from '@/components/bottom-nav';

export default function LoyaltyPage() {
  const router = useRouter();
  const { transactions, loyaltyPoints } = useWallet();
  const { t } = useLanguage();

  const tripHistory = transactions.filter((tx) => tx.type === 'payment');

  const pointsHistory = tripHistory.map(trip => ({
    ...trip,
    pointsEarned: Math.floor(Math.abs(trip.amount)),
  }));

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
          <h1 className="text-lg font-semibold mx-auto">{t('loyaltyPoints')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            <Card className="bg-primary text-primary-foreground text-center shadow-lg">
                <CardContent className="p-6">
                    <p className="text-sm opacity-80">{t('totalPoints')}</p>
                    <div className="flex items-center justify-center gap-2">
                        <Award className="h-10 w-10" />
                        <p className="text-5xl font-bold">{loyaltyPoints}</p>
                    </div>
                    <p className="text-xs opacity-80 mt-2">{t('redeemForDiscounts')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('pointsHistory')}</CardTitle>
                    <CardDescription>{t('pointsHistoryDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {pointsHistory.length > 0 ? (
                        <ScrollArea className="h-[40vh]">
                            <div className="space-y-4">
                            {pointsHistory.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                        <AvatarFallback>
                                            <Bus className='w-5 h-5'/>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{t('tripOnBus', { plate: item.plate })}</p>
                                        <p className="text-sm text-muted-foreground">{t('fare')}: GH₵{Math.abs(item.amount).toFixed(2)}</p>
                                    </div>
                                    <div className="font-semibold text-right text-primary">
                                        <p>+{item.pointsEarned}</p>
                                        <p className="text-xs font-normal">{t('points')}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                            <History className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold">{t('noPointsHistory')}</h3>
                            <p className="text-sm mt-1">{t('noPointsHistoryDescription')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}
