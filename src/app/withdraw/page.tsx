
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWallet } from '@/context/wallet-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { VisaIcon } from '@/components/icons/visa';
import { MastercardIcon } from '@/components/icons/mastercard';
import { useUser } from '@/context/user-context';


const linkedCards = [
    { id: 'card-1', type: 'visa', last4: '4589', name: 'Personal Visa' },
    { id: 'card-2', type: 'mastercard', last4: '8923', name: 'Work Mastercard' },
];

export default function WithdrawPage() {
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { balance, deductBalance, addTransaction } = useWallet();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const { user } = useUser();

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 10) return phone; // Return as is if not a full number
        // Assuming a format like +233 XX XXX XXXX
        return `${cleaned.slice(0, 5)} *** ${cleaned.slice(-4)}`;
    }

    const mobileMoneyAccounts = user ? [
        { id: 'momo-1', provider: 'mtn', name: 'MTN Mobile Money', number: formatPhoneNumber(user.phone), logo: "https://momodeveloper.mtn.com/content/momo_mtnb.png" },
    ] : [];

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
        
        if (!destination) {
            toast({
                variant: 'destructive',
                title: "No Destination Selected",
                description: "Please select an account to withdraw to.",
            });
            return;
        }

        setIsProcessing(true);

        // Simulate API call for withdrawal
        setTimeout(() => {
            deductBalance(withdrawAmount);
            
            const allAccounts = [...linkedCards, ...mobileMoneyAccounts];
            const destAccount = allAccounts.find(acc => acc.id === destination);

            addTransaction({
                type: 'payment', // Using 'payment' type to represent a debit
                plate: `Withdraw to ${destAccount?.name || 'Account'}`,
                amount: -withdrawAmount,
            });

            toast({
                title: "Withdrawal Successful",
                description: `GH₵${withdrawAmount.toFixed(2)} has been sent to your selected account.`,
            });
            
            setIsProcessing(false);
            router.push('/eritas-pay');

        }, 1500);
    };

    const getCardIcon = (type: string) => {
        switch (type) {
            case 'visa':
                return <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa Logo" width={40} height={13} />;
            case 'mastercard':
                return <MastercardIcon className="w-10" />;
            default:
                return <CreditCard className="h-6 w-6 text-muted-foreground" />;
        }
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
                        <CardDescription>Enter the amount and select where to send the funds.</CardDescription>
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
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={destination} onValueChange={setDestination} className="space-y-4">
                           {mobileMoneyAccounts.map((net) => (
                                <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        <Image src={net.logo} alt={`${net.name} logo`} width={60} height={30} className='object-contain h-auto' />
                                        <div>
                                            <span className="font-medium">{net.name}</span>
                                            <p className='text-sm text-muted-foreground font-mono'>{net.number}</p>
                                        </div>
                                    </div>
                                    <RadioGroupItem value={net.id} id={net.id} />
                                </Label>
                            ))}
                             {linkedCards.map((card) => (
                                <Label key={card.id} htmlFor={card.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        {getCardIcon(card.type)}
                                        <div>
                                            <span className="font-medium">{card.name}</span>
                                            <p className='text-sm text-muted-foreground font-mono'>**** {card.last4}</p>
                                        </div>
                                    </div>
                                    <RadioGroupItem value={card.id} id={card.id} />
                                </Label>
                            ))}
                        </RadioGroup>
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
