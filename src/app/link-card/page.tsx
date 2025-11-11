
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { VisaIcon } from '@/components/icons/visa';
import { CardPattern } from '@/components/icons/card-pattern';

export default function LinkCardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleLinkCard = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate API call to link card
        setTimeout(() => {
            setIsProcessing(false);
            toast({
                title: 'Card Linked Successfully',
                description: 'Your VISA card has been synchronized with your ERITAS Pay account.',
            });
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
                    <h1 className="text-lg font-semibold mx-auto">Link VISA Card</h1>
                </div>
            </header>

            <main className="flex-grow p-4">
                <div className="max-w-md mx-auto">
                    <form onSubmit={handleLinkCard}>
                        <Card className="mb-6 relative overflow-hidden">
                             <div className="absolute inset-0 opacity-10">
                                <CardPattern />
                            </div>
                            <CardContent className="p-6 relative">
                               <div className="flex justify-between items-start mb-8">
                                    <div className='space-y-1'>
                                        <p className="text-xs text-foreground/70">Card Balance</p>
                                        <p className="text-2xl font-bold text-foreground">GH₵ 5,840.12</p>
                                    </div>
                                    <VisaIcon className="w-20" />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-sm font-mono tracking-widest text-foreground/80">{cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim()}</p>
                                    <p className="text-xs text-foreground/70 uppercase">{cardHolder || 'CARDHOLDER NAME'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    
                        <Card>
                            <CardHeader>
                                <CardTitle>Enter Card Details</CardTitle>
                                <CardDescription>Enter your VISA card credentials to link it.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input 
                                        id="card-number" 
                                        placeholder="4500 1234 5678 9012" 
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        maxLength={16}
                                        required
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="card-holder">Card Holder Name</Label>
                                    <Input 
                                        id="card-holder" 
                                        placeholder="e.g., Jane Doe" 
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="expiry-date">Expiry Date</Label>
                                        <Input 
                                            id="expiry-date" 
                                            placeholder="MM/YY" 
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input 
                                            id="cvv" 
                                            placeholder="123" 
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            maxLength={3}
                                            required
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
                            Link Card
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
