
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, Loader2, MoreVertical, Wallet, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet, Transaction } from '@/context/wallet-context';
import { useLanguage } from '@/context/language-context';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';
import { cn } from '@/lib/utils';
import { BusTicketIcon } from '@/components/icons/bus-ticket-icon';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { CardIconBackground } from '@/components/card--background';

type Notification = {
    id: number;
    title: string;
    description: string;
    tripId?: string;
    action?: React.ReactNode;
};

export default function EritasPayPage() {
  const router = useRouter();
  const { balance, transactions, isHydrated } = useWallet();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);


  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
        case 'top-up':
            return <div className="p-2 bg-green-500/10 rounded-full"><Wallet className="h-5 w-5 text-green-600"/></div>;
        case 'payment':
            return <div className="p-2 bg-blue-500/10 rounded-full"><BusTicketIcon className="h-5 w-5 text-blue-600"/></div>;
        default:
            return <div className="p-2 bg-muted rounded-full"><Wallet className="h-5 w-5 text-muted-foreground"/></div>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="w-10"></div>
            <h1 className="text-lg font-semibold text-center flex-grow">{t('eritasPay')}</h1>
            <div className="flex items-center gap-2">
                <ProfileSidebar />
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="default"
                            size="icon"
                            className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", "bg-primary")}></span>
                                    <span className={cn("relative inline-flex rounded-full h-4 w-4 text-primary-foreground text-xs items-center justify-center", "bg-primary")}>
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
                                    <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar">
                                        {notifications.map(notification => (
                                            <Card key={notification.id} className={cn(notification.id === -1 && "bg-destructive/10 border-destructive")}>
                                                <CardContent className='p-4 space-y-2'>
                                                    <h3 className="font-semibold">{notification.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                    {notification.action && <div className='pt-2'>{notification.action}</div>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="mt-4">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t('clearAll')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>{t('clearNotificationsTitle')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('clearNotificationsDescription')}
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => setNotifications([])}
                                            >
                                                {t('confirmClear')}
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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

      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            <Card className="shadow-lg relative overflow-hidden">
                 <CardIconBackground />
                <CardContent className="p-6 relative">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('eritasPayBalance')}</p>
                        <div className="flex justify-between items-center">
                            {isHydrated ? 
                                <p className="text-4xl font-bold">GH₵ {balance.toFixed(2)}</p>
                                : <Loader2 className="h-8 w-8 animate-spin" />
                            }
                            <Link href="/top-up">
                                <Button size="lg">{t('topUp')}</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('recentActivity')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isHydrated ? (
                        transactions.length > 0 ? (
                             <div className="space-y-4">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center gap-4">
                                        {getTransactionIcon(transaction)}
                                        <div className="flex-grow">
                                            <p className="font-semibold">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(transaction.timestamp), 'MMM d, yyyy')}</p>
                                        </div>
                                        <p className={cn("font-semibold text-lg", transaction.amount > 0 ? "text-green-600" : "text-destructive")}>
                                            {transaction.amount > 0 ? '+' : ''}GH₵{transaction.amount.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">{t('noRecentActivity')}</p>
                        )
                    ) : (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
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
