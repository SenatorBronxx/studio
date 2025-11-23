
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWallet } from '@/context/wallet-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisaIcon } from '@/components/icons/visa';
import { MastercardIcon } from '@/components/icons/mastercard';

const mobileMoneyNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: "https://momodeveloper.mtn.com/content/momo_mtnb.png" },
    { id: 'telecel', name: 'Telecel Cash', logo: 'https://play.telecel.com.gh/static/Rede-5f0f780acc6c05a6539d7e3229ac508c.webp' },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: 'https://www.bayfrontgardens.com/assets/img/payment/at.png' },
];

const linkedCards = [
    { id: 'card-1', type: 'visa', last4: '4589', expiry: '08/26' },
    { id: 'card-2', type: 'mastercard', last4: '8923', expiry: '11/25' },
];

export default function WithdrawPage() {
    const [withdrawMethod, setWithdrawMethod] = useState('momo');
    const [momoNetwork, setMomoNetwork] = useState('mtn');
    const [phone, setPhone] = useState('');
    const [selectedCard, setSelectedCard] = useState('card-1');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { balance, deductBalance, addTransaction } = useWallet();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

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

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            toast({
                variant: 'destructive',
                title: t('invalidAmountToastTitle'),
                description: t('invalidAmountToastDescription'),
            });
            return;
        }

        if (withdrawAmount > balance) {
            toast({
                variant: 'destructive',
                title: t('insufficientBalanceToastTitle'),
                description: "You cannot withdraw more than your available balance.",
            });
            return;
        }
        
        let destination = '';
        let withdrawalType = '';

        if (withdrawMethod === 'momo') {
            if (!phone) {
                toast({
                    variant: 'destructive',
                    title: "Phone Number Required",
                    description: "Please enter a destination phone number.",
                });
                return;
            }
            const selectedNetwork = mobileMoneyNetworks.find(n => n.id === momoNetwork);
            withdrawalType = `Withdraw to ${selectedNetwork?.name || 'Mobile Money'}`;
            destination = phone;
        } else { // 'card'
            const card = linkedCards.find(c => c.id === selectedCard);
            if (!card) return;
            withdrawalType = `Withdraw to VISA **** ${card.last4}`;
            destination = `Card ending in ${card.last4}`;
        }


        setIsProcessing(true);

        setTimeout(() => {
            deductBalance(withdrawAmount);
            
            addTransaction({
                type: 'payment',
                plate: withdrawalType,
                amount: -withdrawAmount,
            });

            toast({
                title: "Withdrawal Successful",
                description: `GH₵${withdrawAmount.toFixed(2)} has been sent to ${destination}.`,
            });
            
            setIsProcessing(false);
            router.push('/eritas-pay');

        }, 1500);
    };


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
            <div className="max-w-md mx-auto flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold mx-auto">Withdraw Funds</h1>
            </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
            <form onSubmit={handleWithdraw}>
                 <Card className="mb-6">
                    <CardContent className='p-4'>
                        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                            <div>
                            <p className="text-sm text-muted-foreground">{t('currentBalance')}</p>
                            <p className="text-2xl font-bold">GH₵ {balance.toFixed(2)}</p>
                            </div>
                            <Wallet className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal Details</CardTitle>
                        <CardDescription>Enter the amount you wish to withdraw from your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('amountLabel')}</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder={t('amountExample')}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Destination Account</CardTitle>
                        <CardDescription>Select where you want to send the funds.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={withdrawMethod} onValueChange={setWithdrawMethod} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="momo">
                                    <Smartphone className="mr-2 h-4 w-4" />
                                    Mobile Money
                                </TabsTrigger>
                                <TabsTrigger value="card">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Credit Card
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="momo" className="mt-4 space-y-6">
                                <RadioGroup value={momoNetwork} onValueChange={setMomoNetwork} className="space-y-4">
                                   {mobileMoneyNetworks.map((net) => (
                                        <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                            <div className="flex items-center gap-4">
                                                <Image src={net.logo} alt={`${net.name} logo`} width={80} height={40} className='object-contain h-auto' />
                                                <span className="font-medium">{net.name}</span>
                                            </div>
                                            <RadioGroupItem value={net.id} id={net.id} />
                                        </Label>
                                    ))}
                                </RadioGroup>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                                    <Input 
                                        id="phone" 
                                        type="tel" 
                                        placeholder="+233 24 123 4567" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="card" className="mt-4">
                                 <RadioGroup value={selectedCard} onValueChange={setSelectedCard} className="space-y-4">
                                    {linkedCards.map((card) => (
                                        <Label key={card.id} htmlFor={card.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                            <div className="flex items-center gap-4">
                                                {getCardIcon(card.type)}
                                                <div className="flex-grow">
                                                    <p className="font-semibold capitalize">{t('cardEndingIn', { type: card.type, last4: card.last4 })}</p>
                                                    <p className="text-sm text-muted-foreground">{t('expires')} {card.expiry}</p>
                                                </div>
                                            </div>
                                            <RadioGroupItem value={card.id} id={card.id} />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                    )}
                    Confirm Withdrawal
                </Button>
            </form>
        </div>
      </main>
    </div>
  );
}
