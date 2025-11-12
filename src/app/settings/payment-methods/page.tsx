
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, Wallet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/context/wallet-context';
import { VisaIcon } from '@/components/icons/visa';
import { MastercardIcon } from '@/components/icons/mastercard';
import { MtnMomoIcon } from '@/components/icons/mtn-momo';
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

const linkedCards = [
    { id: 1, type: 'visa', last4: '4589', expiry: '08/26' },
    { id: 2, type: 'mastercard', last4: '8923', expiry: '11/25' },
];

const mobileMoneyAccounts = [
    { id: 1, provider: 'mtn', number: '+233 24 *** 4567' },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { balance } = useWallet();

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return <VisaIcon className="w-12" />;
      case 'mastercard':
        return <MastercardIcon className="w-12" />;
      default:
        return <CreditCard className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">Payment Methods</h1>
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
              <CardDescription>Your primary wallet for all in-app payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">GH₵ {balance.toFixed(2)}</p>
                </div>
                <Link href="/top-up" passHref>
                    <Button>Top-up</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Linked Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Linked Cards
              </CardTitle>
              <CardDescription>Manage your connected credit and debit cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedCards.map((card) => (
                <div key={card.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  {getCardIcon(card.type)}
                  <div className="flex-grow">
                    <p className="font-semibold capitalize">{card.type} ending in {card.last4}</p>
                    <p className="text-sm text-muted-foreground">Expires {card.expiry}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove this card?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove the card ending in {card.last4}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
               <Link href="/link-card" passHref>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Card
                </Button>
               </Link>
            </CardContent>
          </Card>

           {/* Mobile Money */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Money
              </CardTitle>
              <CardDescription>Manage your connected Mobile Money accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {mobileMoneyAccounts.map((account) => (
                    <div key={account.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <MtnMomoIcon className="w-20" />
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
                                    <AlertDialogTitle>Remove this account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to remove this Mobile Money account?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
               ))}
               <Link href="/top-up" passHref>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mobile Money
                </Button>
               </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
