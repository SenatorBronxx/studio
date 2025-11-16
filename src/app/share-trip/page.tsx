
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, User, MapPin, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrip } from '@/context/trip-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { MessageSquare } from 'lucide-react';

export default function ShareTripPage() {
    const router = useRouter();
    const { activeTrip } = useTrip();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState('');

    if (!activeTrip) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
                <h1 className="text-xl font-bold">{t('noActiveTripTitle')}</h1>
                <p className='text-muted-foreground'>{t('noActiveTripDescription')}</p>
                <Button onClick={() => router.push('/home')} className="mt-4">{t('goToHome')}</Button>
            </div>
        );
    }
    
    const { bus, destination, eta, seats } = activeTrip;
    
    const primarySeat = seats[0];
    const reservedSeats = seats.slice(1);
    const busStops = bus.stops.map(s => s.name).join(', ');

    const baseText = t('shareTripText', {
        driver: bus.driver,
        plate: bus.plate,
        destination: destination,
        eta: eta,
    });

    let reservedSeatsText = '';
    if (reservedSeats.length > 0) {
        reservedSeatsText = `\n\n${t('shareTripReservedSeatsText', {
            count: reservedSeats.length,
            seats: reservedSeats.join(', '),
        })}`;
    }

    const pickupText = `\n\n${t('shareTripPickupText', { stops: busStops })}`;
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    const fullMessage = `${baseText}${reservedSeatsText}${pickupText}\n\n${t('trackMyTrip')}:\n${shareUrl}`;

    const handleShare = (platform: 'whatsapp' | 'sms') => {
        const encodedMessage = encodeURIComponent(fullMessage);
        let url = '';

        if (platform === 'whatsapp') {
            const num = phoneNumber.replace(/\D/g, ''); // Remove non-digits
            url = `https://wa.me/${num}?text=${encodedMessage}`;
        } else { // sms
            url = `sms:${phoneNumber}?body=${encodedMessage}`;
        }
        window.open(url, '_blank');
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(fullMessage);
        toast({
            title: t('linkCopied'),
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
                <div className="max-w-md mx-auto flex items-center relative">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute left-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold mx-auto">{t('shareTripPageTitle')}</h1>
                </div>
            </header>

            <main className="flex-grow p-4">
                <div className="max-w-md mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('tripDetails')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4" /> {t('bus')}</span>
                                <span className="font-mono font-semibold">{bus.plate}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4" /> {t('yourSeat')}</span>
                                <span className="font-mono font-semibold">{primarySeat}</span>
                            </div>
                            {reservedSeats.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4" /> {t('reservedSeats')}</span>
                                    <span className="font-mono font-semibold">{reservedSeats.join(', ')}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> {t('driver')}</span>
                                <span className="font-semibold">{bus.driver}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> {t('destination')}</span>
                                <span className="font-semibold">{destination}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> {t('eta')}</span>
                                <span className="font-semibold">{t('minutesAbbr', { minutes: eta })}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('shareVia')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('phoneNumberForSharing')}</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+233 24 123 4567"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => handleShare('whatsapp')} disabled={!phoneNumber} className="bg-green-500 hover:bg-green-600 text-white">
                                    <WhatsappIcon className="mr-2 h-5 w-5" />
                                    WhatsApp
                                </Button>
                                <Button onClick={() => handleShare('sms')} disabled={!phoneNumber} variant="secondary">
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    {t('shareViaSms')}
                                </Button>
                            </div>
                             <div className="relative flex justify-center text-xs uppercase my-4">
                                <span className="bg-background px-2 text-muted-foreground">{t('orContinueWith')}</span>
                             </div>
                              <Button onClick={handleCopy} variant="outline" className="w-full">
                                <Copy className="mr-2 h-4 w-4" />
                                {t('copyLink')}
                              </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
