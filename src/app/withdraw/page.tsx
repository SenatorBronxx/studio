
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { useWallet } from '@/context/wallet-context';

const mobileMoneyNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: "https://momodeveloper.mtn.com/content/momo_mtnb.png" },
    { id: 'telecel', name: 'Telecel Cash', logo: 'https://play.telecel.com.gh/static/Rede-5f0f780acc6c05a6539d7e3229ac508c.webp' },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: 'https://www.bayfrontgardens.com/assets/img/payment/at.png' },
];

export default function WithdrawPage() {
    const [network, setNetwork] = useState('mtn');
    const [phone, setPhone] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const { balance, addTransaction, isHydrated } = useWallet();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only digits and the '+' symbol at the start
        const sanitizedValue = value.replace(/[^0-9+]/g, '');
        setPhone(sanitizedValue);
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);

        if (!isHydrated) return;

        const ghanaPhoneRegex = /^(?:\+233|0)\d{9}$/;
        if (!ghanaPhoneRegex.test(phone)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Phone Number',
                description: 'Please enter a valid Ghanaian mobile number (e.g., 0241234567 or +233241234567).',
            });
            return;
        }

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

        setIsProcessing(true);

        // Simulate API call for withdrawal
        setTimeout(() => {
            addTransaction({
                type: 'payment', // Using 'payment' for withdrawals
                amount: -withdrawAmount,
                description: `Withdrawal to ${phone}`,
            });

            toast({
                title: 'Withdrawal Successful',
                description: `GH₵${withdrawAmount.toFixed(2)} has been sent to ${recipientName}.`,
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
                <Card>
                    <CardHeader>
                        <CardTitle>Select Recipient Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={network} onValueChange={setNetwork} className="space-y-4">
                            {mobileMoneyNetworks.map((net) => {
                                return (
                                <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        {net.logo ? (
                                            <Image src={net.logo} alt={`${net.name} logo`} width={80} height={40} className='object-contain h-auto' />
                                        ) : (
                                            <div className='w-10 h-10 flex items-center justify-center'>
                                                <ArrowUpRight className='h-6 w-6 text-muted-foreground' />
                                            </div>
                                        )}
                                        <span className="font-medium">{net.name}</span>
                                    </div>
                                    <RadioGroupItem value={net.id} id={net.id} />
                                </Label>
                                )
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Enter Recipient Details</CardTitle>
                        <CardDescription>Enter the recipient's phone number and the amount to withdraw.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+233 24 123 4567" 
                                value={phone} 
                                onChange={handlePhoneChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipient-name">Recipient's Name</Label>
                            <Input 
                                id="recipient-name" 
                                type="text" 
                                placeholder="e.g. John Doe" 
                                value={recipientName} 
                                onChange={(e) => setRecipientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('amountLabel')}</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder={`Available: GH₵${isHydrated ? balance.toFixed(2) : '...'}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing || !isHydrated}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <ArrowUpRight className="mr-2 h-5 w-5" />
                    )}
                    Confirm Withdraw
                </Button>
            </form>
        </div>
      </main>
    </div>
  );
}
