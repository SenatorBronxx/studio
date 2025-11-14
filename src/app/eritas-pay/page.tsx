
'use client';

import {
  ArrowUpRight,
  Bus,
  Search,
  Bell,
  Trash2,
  QrCode,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { Progress } from '@/components/ui/progress';
import { VisaIcon } from '@/components/icons/visa';
import { useWallet } from '@/context/wallet-context';
import { DeletableItem } from '@/components/deletable-item';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';

type Notification = {
    id: number;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export default function EritasPayPage() {
  const { balance, transactions, removeTransaction } = useWallet();
  const { t } = useLanguage();
  const { user } = useUser();
  const router = useRouter();
  const maxBalance = 400.00;
  const progressPercentage = (balance / maxBalance) * 100;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<{ plate: string } | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  if (!user) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">{t('signInToContinue')}</h1>
            <p className='text-muted-foreground'>{t('signInToAccessFeatures')}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              <LogIn className="mr-2 h-4 w-4" />
              {t('goToSignIn')}
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <ProfileSidebar />
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="default"
                        size="icon"
                        className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground relative"
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-primary-foreground text-xs items-center justify-center">
                                    {notifications.length}
                                </span>
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{t('notifications')}</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 h-full flex flex-col">
                        {notifications.length > 0 ? (
                            <>
                                <div className="flex-grow space-y-4 overflow-y-auto">
                                    {notifications.map(notification => (
                                        <Card key={notification.id}>
                                            <CardContent className='p-4 space-y-2'>
                                                <h3 className="font-semibold">{notification.title}</h3>
                                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                {notification.action && <div className='pt-2'>{notification.action}</div>}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <Button variant="outline" className="mt-4" onClick={() => setNotifications([])}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('clearAll')}
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                                <Bell className="h-12 w-12 mb-4" />
                                <p>{t('noNewNotifications')}</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Balance Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('eritasPayBalance')}
              </CardTitle>
                <div className='p-2 bg-primary/10 rounded-lg'>
                    <Bus className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">GH₵ {balance.toFixed(2)}</div>
              <Badge variant="secondary" className="mt-2">{t('cashBackOnBusTickets')}</Badge>
            </CardContent>
          </Card>
          
          {/* Wallet Threshold */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-foreground">{t('walletThreshold')}</h3>
                        <p className="text-sm font-mono text-muted-foreground">GH₵ {balance.toFixed(2)} / GH₵ {maxBalance.toFixed(2)}</p>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{t('increaseLimitByVerifying')}</p>
                </CardContent>
            </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/top-up" passHref>
                <Button size="lg" className="flex-col h-20 w-full">
                <ArrowUpRight className="h-6 w-6 mb-1" />
                {t('topUp')}
                </Button>
            </Link>
            <Link href="/link-card" passHref>
                <Button size="lg" variant="secondary" className="flex-col h-20 w-full">
                    <VisaIcon className="w-12 mb-2" />
                    {t('synchronizeWithVisa')}
                </Button>
            </Link>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{t('recentActivity')}</h2>
              <Button 
                variant="link" 
                className="text-primary"
                onClick={() => setShowAllTransactions(!showAllTransactions)}
              >
                {showAllTransactions ? t('hide') : t('seeAll')}
              </Button>
            </div>
            {showAllTransactions && (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <DeletableItem key={tx.id} onDelete={() => removeTransaction(tx.id)}>
                          <div className="flex items-center gap-4 p-4 bg-background">
                              <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                  <AvatarFallback>
                                      <Bus className='w-5 h-5'/>
                                  </AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                  <p className="font-semibold">{tx.type === 'payment' ? t('busTicketPayment') : t('mobileMoneyTopUp')}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{tx.plate}</p>
                              </div>
                              <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                                 {tx.amount > 0 ? '+' : ''}GH₵{tx.amount.toFixed(2)}
                              </div>
                          </div>
                      </DeletableItem>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="sticky bottom-0">
        <BottomNav />
      </div>

       <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>{t('yourBoardingPass')}</SheetTitle>
                </SheetHeader>
                <div className="p-4 flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt={t('boardingQrCode')} width={200} height={200} />
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">{t('showQrToDriver')}</p>
                        <div className="flex items-center gap-4 justify-center">
                            <Badge variant="outline">{selectedBus?.plate}</Badge>
                            <Badge>{t('seat')} {selectedSeat}</Badge>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}
