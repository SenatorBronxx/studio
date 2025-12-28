
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VisaIcon } from '@/components/icons/visa';
import { MastercardIcon } from '@/components/icons/mastercard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { useWallet } from '@/context/wallet-context';

const linkedCards = [
    { id: 1, type: 'visa', last4: '4589', expiry: '08/26' },
    { id: 2, type: 'mastercard', last4: '8923', expiry: '11/25' },
];

const mobileMoneyAccounts = [
    { id: 1, provider: 'mtn', number: '+233 24 *** 4567' },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { balance, isHydrated } = useWallet();

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return <div className="w-12"><Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa Logo" width={48} height={16} /></div>;
      case 'mastercard':
        return <div className="w-12"><MastercardIcon /></div>;
      default:
        return <CreditCard className="h-8 w-8 text-muted-foreground" />;
    }
  };

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
          <h1 className="text-lg font-semibold mx-auto">{t('paymentMethods')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* ERITAS Pay Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                ERITAS Pay
              </CardTitle>
              <CardDescription>{t('eritasPayDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{t('currentBalance')}</p>
                  {isHydrated ? (
                    <p className="text-2xl font-bold">GH₵ {balance.toFixed(2)}</p>
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  )}
                </div>
                <Link href="/top-up" passHref>
                    <Button>{t('topUp')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Linked Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('linkedCards')}
              </CardTitle>
              <CardDescription>{t('linkedCardsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedCards.map((card) => (
                <div key={card.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  {getCardIcon(card.type)}
                  <div className="flex-grow">
                    <p className="font-semibold capitalize">{t('cardEndingIn', { type: card.type, last4: card.last4 })}</p>
                    <p className="text-sm text-muted-foreground">{t('expires')} {card.expiry}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('removeCardTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('removeCardDescription', { last4: card.last4 })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {t('remove')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
               <Link href="/link-card" passHref>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addNewCard')}
                </Button>
               </Link>
            </CardContent>
          </Card>

           {/* Mobile Money */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('mobileMoney')}
              </CardTitle>
              <CardDescription>{t('mobileMoneyDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {mobileMoneyAccounts.map((account) => (
                    <div key={account.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Image src="https://momodeveloper.mtn.com/content/momo_mtnb.png" alt="MTN Mobile Money" width={80} height={40} className="object-contain" />
                        <div className="flex-grow">
                            <p className="font-semibold capitalize">{account.provider}</p>
                            <p className="text-sm text-muted-foreground font-mono">{account.number}</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('removeAccountTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('removeMomoAccountDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                        {t('remove')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
               ))}
               <Link href="/top-up" passHref>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addMobileMoney')}
                </Button>
               </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
