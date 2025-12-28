
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CashIcon } from '@/components/icons/cash-icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mobileMoneyAccounts = [
    { id: 1, provider: 'mtn', number: '+233 24 *** 4567' },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { balance, isHydrated } = useWallet();


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

          {/* Cash Payment */}
          <Card className={cn("relative overflow-hidden")}>
             <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 flex items-center justify-center">
                <Badge variant="destructive">Unavailable</Badge>
             </div>
             <div className="opacity-50 pointer-events-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CashIcon className="h-6 w-6" />
                        {t('cashPayment')}
                    </CardTitle>
                    <CardDescription>{t('cashPaymentDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="cash" className="space-y-4">
                        <Label htmlFor="cash-payment" className="flex items-center justify-between p-4 border rounded-lg cursor-not-allowed has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <div className="flex items-center gap-4">
                                <CashIcon className="h-6 w-6 text-primary" />
                                <span className="font-medium">{t('payWithCash')}</span>
                            </div>
                            <RadioGroupItem value="cash" id="cash-payment" disabled />
                        </Label>
                    </RadioGroup>
                </CardContent>
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
