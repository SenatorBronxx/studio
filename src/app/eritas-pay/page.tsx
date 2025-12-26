
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, Loader2, MoreVertical, Wallet } from 'lucide-react';
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

export default function EritasPayPage() {
  const router = useRouter();
  const { balance, transactions, isHydrated } = useWallet();
  const { t } = useLanguage();

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
        <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 text-center">
            <h1 className="text-lg font-semibold">{t('eritasPay')}</h1>
        </header>

      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            <Card className="bg-primary text-primary-foreground shadow-lg overflow-hidden">
                <CardContent className="p-6 relative">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-foreground/10 rounded-full"></div>
                    <div className="absolute -left-12 bottom-0 w-24 h-24 bg-primary-foreground/10 rounded-full"></div>
                    <p className="text-sm opacity-80 mb-1">{t('eritasPayBalance')}</p>
                    <div className="flex justify-between items-center">
                        {isHydrated ? 
                            <p className="text-4xl font-bold">GH₵ {balance.toFixed(2)}</p>
                            : <Loader2 className="h-8 w-8 animate-spin" />
                        }
                        <Link href="/top-up">
                            <Button variant="secondary" size="lg">{t('topUp')}</Button>
                        </Link>
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
