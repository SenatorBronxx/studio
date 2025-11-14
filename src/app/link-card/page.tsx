
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { VisaIcon } from '@/components/icons/visa';
import { CardPattern } from '@/components/icons/card-pattern';
import { useWallet } from '@/context/wallet-context';
import { useLanguage } from '@/context/language-context';

export default function LinkCardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { addBalance, addTransaction } = useWallet();
    const { t } = useLanguage();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isCardLinked, setIsCardLinked] = useState(false);

    const [topUpAmount, setTopUpAmount] = useState('');
    const [isToppingUp, setIsToppingUp] = useState(false);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        setCardNumber(value);
    };

    const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Remove non-letters/spaces
        setCardHolder(value);
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiryDate(value);
    };
    
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCvv(value);
    };

    const handleLinkCard = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate API call to link card
        setTimeout(() => {
            setIsProcessing(false);
            setIsCardLinked(true);
            toast({
                title: t('cardLinkedToastTitle'),
                description: t('cardLinkedToastDescription'),
            });
        }, 1500);
    };

    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (!amount || amount <= 0) {
            toast({
                variant: 'destructive',
                title: t('invalidAmountToastTitle'),
                description: t('invalidAmountToastDescription'),
            });
            return;
        }
        setIsToppingUp(true);
        setTimeout(() => {
            addBalance(amount);
            addTransaction({
                type: 'top-up',
                plate: t('visaCardTopUp'),
                amount: amount,
            });
            toast({
                title: t('topUpSuccessfulToastTitle'),
                description: t('topUpSuccessfulToastDescription', { amount: amount.toFixed(2) }),
            });
            setIsToppingUp(false);
            router.push('/eritas-pay');
        }, 1500);
    };

    const formatCardNumber = (num: string) => {
        if (num.length < 4) {
            return num.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
        }
        const firstTwo = num.slice(0, 2);
        const lastTwo = num.slice(-2);
        return `${firstTwo}${'*'.repeat(12)}${lastTwo}`.replace(/(.{4})/g, '$1 ').trim();
    };


    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
                <div className="max-w-md mx-auto flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold mx-auto">{isCardLinked ? t('topUpFromCardTitle') : t('linkVisaCardTitle')}</h1>
                </div>
            </header>

            <main className="flex-grow p-4">
                <div className="max-w-md mx-auto">
                    <Card className="mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <CardPattern />
                        </div>
                        <CardContent className="p-6 relative flex flex-col justify-between min-h-[200px]">
                           <div className="flex justify-end items-start">
                                <VisaIcon className="w-24" />
                            </div>
                            <div className='space-y-2 mt-auto'>
                                <p className="text-xl font-mono tracking-widest text-foreground/80">
                                  {formatCardNumber(cardNumber)}
                                </p>
                                <div className="flex justify-between items-end">
                                  <p className="text-sm text-foreground/70 uppercase">{cardHolder || t('cardholderNamePlaceholder')}</p>
                                  <div className="text-right">
                                    <p className="text-xs text-foreground/70">Expires</p>
                                    <p className="text-sm font-mono text-foreground/80">{expiryDate || 'MM/YY'}</p>
                                  </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isCardLinked ? (
                        <form onSubmit={handleLinkCard}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('enterCardDetailsTitle')}</CardTitle>
                                    <CardDescription>{t('enterCardDetailsDescription')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card-number">{t('cardNumberLabel')}</Label>
                                        <Input
                                            id="card-number"
                                            placeholder="4500 1234 5678 9012"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength={16}
                                            required
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="card-holder">{t('cardHolderNameLabel')}</Label>
                                        <Input
                                            id="card-holder"
                                            placeholder={t('cardHolderNameExample')}
                                            value={cardHolder}
                                            onChange={handleCardHolderChange}
                                            required
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry-date">{t('expiryDateLabel')}</Label>
                                            <Input
                                                id="expiry-date"
                                                placeholder="MM/YY"
                                                value={expiryDate}
                                                onChange={handleExpiryDateChange}
                                                maxLength={5}
                                                required
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                type="password"
                                                value={cvv}
                                                onChange={handleCvvChange}
                                                maxLength={3}
                                                required
                                                disabled={isProcessing}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <CreditCard className="mr-2 h-5 w-5" />
                                )}
                                {t('linkCardButton')}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleTopUp}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('topUpEritasPayWalletTitle')}</CardTitle>
                                    <CardDescription>{t('topUpEritasPayWalletDescription')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="top-up-amount">{t('amountLabel')}</Label>
                                        <Input
                                            id="top-up-amount"
                                            type="number"
                                            placeholder={t('amountExample')}
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            required
                                            step="0.01"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                             <Button type="submit" size="lg" className="w-full mt-6" disabled={isToppingUp}>
                                {isToppingUp ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Wallet className="mr-2 h-5 w-5" />
                                )}
                                {t('topUpFromCardButton')}
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
