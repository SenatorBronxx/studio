
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWallet } from '@/context/wallet-context';
import { useToast } from '@/hooks/use-toast';
import { MtnMomoIcon } from '@/components/icons/mtn-momo';
import { TelecelCashIcon } from '@/components/icons/telecel-cash';
import { AtMoneyIcon } from '@/components/icons/at-money';

const mobileMoneyNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: MtnMomoIcon },
    { id: 'telecel', name: 'Telecel Cash', logo: TelecelCashIcon },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: AtMoneyIcon },
];

export default function TopUpPage() {
    const [network, setNetwork] = useState('mtn');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { addBalance, addTransaction } = useWallet();
    const router = useRouter();
    const { toast } = useToast();

    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault();
        const topUpAmount = parseFloat(amount);
        if (!topUpAmount || topUpAmount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid amount to top up.',
            });
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            addBalance(topUpAmount);
            addTransaction({
                type: 'top-up',
                plate: `${mobileMoneyNetworks.find(n => n.id === network)?.name || 'Top-up'}`,
                amount: topUpAmount,
            });

            toast({
                title: 'Top-up Successful',
                description: `GH₵${topUpAmount.toFixed(2)} has been added to your ERITAS Pay balance.`,
            });
            
            setIsProcessing(false);
            router.push('/eritas-pay');

        }, 1500);
    };


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
            <div className="max-w-md mx-auto flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold mx-auto">Top-up Wallet</h1>
            </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
            <form onSubmit={handleTopUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>Select Mobile Money Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={network} onValueChange={setNetwork} className="space-y-4">
                            {mobileMoneyNetworks.map((net) => {
                                const LogoComponent = net.logo;
                                return (
                                <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        <LogoComponent className={net.id === 'mtn' ? 'w-20 h-auto' : 'w-10 h-10 object-contain'} />
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
                        <CardTitle>Enter Details</CardTitle>
                        <CardDescription>Enter the phone number and amount for the top-up.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+233 24 123 4567" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (GH₵)</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder="e.g., 50.00" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                    )}
                    Confirm Top-up
                </Button>
            </form>
        </div>
      </main>
    </div>
  );
}
