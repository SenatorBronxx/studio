
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, BusFront, X, Flag, Users, Loader2, Clock, Armchair, QrCode, Bell, Trash2, MapPin, Bus, Send, Footprints } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BusSeatingChart } from '@/components/bus-seating-chart';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
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
import { useBusArrivalNotification } from '@/hooks/use-bus-arrival-notification';
import { TripRating } from '@/components/trip-rating';
import { useWallet } from '@/context/wallet-context';
import { useNotification, Notification } from '@/context/notification-context';

const initialBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 1,
      capacity: { current: 35, max: 52 },
      stops: [
        { name: 'Adenta', fare: 5.00, eta: 5 },
        { name: 'Madina', fare: 7.50, eta: 15 },
      ],
      finalDestination: { name: 'Atomic Junction', fare: 10.00, eta: 25 },
      position: { top: '45%', left: '25%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: [
        { id: '1A', isOccupied: false }, { id: '2A', isOccupied: true }, { id: '3A', isOccupied: false }, { id: '4A', isOccupied: false },
        { id: '1B', isOccupied: false }, { id: '1C', isOccupied: true }, { id: '2B', isOccupied: false }, { id: '2C', isOccupied: true },
        { id: '3B', isOccupied: true }, { id: '3C', isOccupied: false }, { id: '4B', isOccupied: false }, { id: '4C', isOccupied: false },
      ].concat(Array.from({ length: 13 }, (_, i) => ({ id: `5${String.fromCharCode(65 + i)}`, isOccupied: Math.random() > 0.5 })))
    },
    {
      id: 'bus-2',
      driver: 'Ama Serwaa',
      plate: 'AS 1234-24',
      eta: 25,
      capacity: { current: 48, max: 48 },
      stops: [
        { name: 'Circle', fare: 6.00, eta: 10 },
        { name: 'Kaneshie', fare: 8.50, eta: 20 },
      ],
      finalDestination: { name: 'Mallam', fare: 12.00, eta: 30 },
      position: { top: '55%', left: '65%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: Array.from({ length: 25 }, (_, i) => ({ id: `${Math.floor(i/5)+1}${String.fromCharCode(65 + (i % 5 > 1 ? i%5-1 : i%5))}`, isOccupied: true }))
    },
];

type BusData = typeof initialBusData[0];
type StopInfo = { name: string; fare: number; eta: number };
type PassedBusInfo = {
    nextStop: StopInfo;
    walkingTime: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fromQuery = searchParams.get('from') || '';
  const toQuery = searchParams.get('to') || '';

  const [fromLocation, setFromLocation] = useState(fromQuery);
  const [toLocation, setToLocation] = useState(toQuery);
  const [isHydrated, setIsHydrated] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { balance, addTransaction, isHydrated: isWalletHydrated } = useWallet();
  const { addNotification } = useNotification();
  
  const [buses, setBuses] = useState(initialBusData);
  const [filteredBuses, setFilteredBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [busHasArrived, setBusHasArrived] = useState(false);
  const [passedBusInfo, setPassedBusInfo] = useState<PassedBusInfo | null>(null);

  useBusArrivalNotification(busHasArrived);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
        if (fromQuery || toQuery) {
            const results = buses.filter(bus => {
                const allStops = [...bus.stops.map(s => s.name.toLowerCase()), bus.finalDestination.name.toLowerCase()];
                const isFromCurrentLocation = fromQuery === 'Your Current Location';
                
                const fromMatch = isFromCurrentLocation ? true : allStops.some(stop => stop.includes(fromQuery.toLowerCase()));
                
                const toMatch = toQuery ? allStops.some(stop => stop.includes(toQuery.toLowerCase())) : true;
                
                return fromMatch && toMatch;
            });
            setFilteredBuses(results);
        } else {
            setFilteredBuses([]);
        }
    }
}, [fromQuery, toQuery, buses, isHydrated]);


  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setPassedBusInfo(null);

    if (bus.eta <= 0 && bus.stops.length > 0) {
        const nextStop = bus.stops[0];
        const walkingTime = 5 + Math.floor(Math.random() * 10);
        setPassedBusInfo({ nextStop, walkingTime });
    }
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassedBusInfo(null);
  }

  const handleBoard = (stop: {name: string, fare: number, eta: number}) => {
    if(!selectedBus || selectedSeats.length === 0 || !isWalletHydrated) return;
    
    const totalFare = stop.fare * selectedSeats.length;

    if (balance < totalFare) {
        toast({
            variant: "destructive",
            title: t('insufficientBalanceToastTitle'),
            description: t('insufficientBalanceToastDescription'),
        });
        return;
    }

    setIsBoarding(true);
    setTimeout(() => {
        addTransaction({
            type: 'payment',
            amount: -totalFare,
            description: `Bus ticket to ${selectedBus.finalDestination.name}`,
            plate: selectedBus.plate,
        });

        const tripId = uuidv4();
        setIsBoarding(false);
        
        const primarySeat = selectedSeats[0];
        const qrData = { tripId: tripId, bus: selectedBus.plate, seat: primarySeat, from: stop.name, to: selectedBus.finalDestination.name, fare: totalFare / selectedSeats.length, timestamp: new Date().toISOString() };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        const newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`;
        setQrCodeUrl(newQrCodeUrl);
        
        let toastDescription = t('fareDeductedToastDescription', { fare: totalFare.toFixed(2) });

        toast({
            title: t('seatBookedToastTitle'),
            description: toastDescription,
            action: (
                <Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    {t('viewQrCode')}
                </Button>
            )
        });

        addNotification({
            title: t('yourBoardingPass'),
            description: `${t('showQrToDriver')} (${selectedBus.plate} - ${t('seat')}: ${primarySeat})`,
            tripId: tripId,
            action: (
                <div className="mt-2 flex justify-center">
                    <Image src={newQrCodeUrl} alt={t('boardingQrCode')} width={150} height={150} />
                </div>
            )
        });

        if (selectedSeats.length > 1) {
            addNotification({
                title: t('seatsReservedForOthers'),
                description: t('seatsReservedForOthersDescription'),
                action: (
                    <Button variant="default" size="sm" onClick={() => router.push('/share-trip')}>
                        <Send className="mr-2 h-4 w-4" />
                        {t('sendToRecipient')}
                    </Button>
                )
            });
        }
        clearSelectedBus();
    }, 1500);
  }

  const handleSeatSelect = (seatId: string) => {
    if (selectedBus) {
        const seat = selectedBus.seating.find(s => s?.id === seatId);
        if (seat && !seat.isOccupied) {
            setSelectedSeats(prevSeats => {
                if (prevSeats.includes(seatId)) {
                    return prevSeats.filter(s => s !== seatId);
                } else {
                    return [...prevSeats, seatId];
                }
            });
        }
    }
  }
  
  const handleConfirmSeat = () => {
    setIsSeatSheetOpen(false);
  }
  
  if (!isHydrated) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const displayedBus = selectedBus;
  const primarySeat = (Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats[0] : null);

  const allStops = displayedBus ? [...displayedBus.stops, displayedBus.finalDestination] : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-20 bg-background/75 backdrop-blur-sm p-4 shadow-sm">
            <div className="max-w-md mx-auto space-y-4">
                 <div className="flex justify-center">
                    <Image
                        src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
                        alt="Eritas Transport Company Logo"
                        width={120}
                        height={60}
                        priority
                        className="object-contain"
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder={t('from')} 
                        className='pl-10' 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        />
                    </div>
                    <div className="p-2 rounded-full bg-muted">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder={t('to')}
                        className='pl-10'
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleSearch} className="w-full">
                    <Search className='mr-2 h-5 w-5' />
                    {t('searchForBuses')}
                </Button>
            </div>
        </header>

        <main className="flex-grow p-4 pb-20">
             <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-[80px]">
                {displayedBus && (
                <div className="p-2 sm:p-4 pointer-events-auto">
                    <div className="bg-background/75 backdrop-blur-sm rounded-t-2xl max-w-md mx-auto shadow-lg p-4 space-y-3">
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {displayedBus.driverImage && <AvatarImage src={displayedBus.driverImage} alt={displayedBus.driver} />}
                                        <AvatarFallback>{displayedBus.driver.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{displayedBus.driver}</h2>
                                        <p className="text-sm text-muted-foreground font-mono">{displayedBus.plate}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {passedBusInfo ? (
                                <Card className="bg-amber-50 border border-amber-200">
                                    <CardContent className="p-4 text-sm text-amber-900 space-y-3">
                                        <p>This bus has passed your current location. The next available stop you can board is:</p>
                                        <div className='font-semibold text-center bg-amber-100 p-2 rounded-md'>
                                            <p className='text-base'>{passedBusInfo.nextStop.name}</p>
                                            <div className='flex justify-center items-center gap-4 text-xs mt-1'>
                                                <span className='flex items-center gap-1'><Bus className='h-3 w-3' /> Bus ETA: {passedBusInfo.nextStop.eta} min</span>
                                                <span className='flex items-center gap-1'><Footprints className='h-3 w-3' /> Your ETA: {passedBusInfo.walkingTime} min</span>
                                            </div>
                                        </div>
                                        <Button className='w-full' onClick={() => handleBoard(passedBusInfo.nextStop)} disabled={selectedSeats.length === 0}>
                                            {selectedSeats.length > 0 ? `Reserve Seat for ${passedBusInfo.nextStop.name}` : "Select a seat first"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Sheet open={isSeatSheetOpen} onOpenChange={setIsSeatSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className='w-full'>
                                            <Armchair className="mr-2 h-5 w-5" />
                                            {selectedSeats.length > 0 ? t('seatsSelected', { count: selectedSeats.length }) : t('viewSeats')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="rounded-t-2xl">
                                        <SheetHeader><SheetTitle>{t('selectYourSeat')}</SheetTitle></SheetHeader>
                                        <BusSeatingChart 
                                            seating={displayedBus.seating}
                                            selectedSeats={selectedSeats}
                                            onSeatSelect={handleSeatSelect}
                                            busPlate={displayedBus.plate}
                                            onConfirm={handleConfirmSeat}
                                        />
                                    </SheetContent>
                                </Sheet>
                            )}

                            <Separator />

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2"><Users className="h-4 w-4" />{t('busCapacity')}</h3>
                                    <p className="text-sm font-mono text-muted-foreground">{displayedBus.capacity.current} / {displayedBus.capacity.max} {t('seats')}</p>
                                </div>
                                <Progress value={(displayedBus.capacity.current / displayedBus.capacity.max) * 100} className="h-2" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-foreground/80 mb-2">{t('busFares')}:</h3>
                                <Accordion type="single" collapsible className="w-full">
                                    {[...displayedBus.stops, { ...displayedBus.finalDestination, isFinal: true }].map((stop, index) => {
                                        let fare = stop.fare;
                                        return (
                                            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                                <AccordionTrigger className="py-2 rounded-lg hover:bg-muted/50 px-2 data-[state=open]:bg-muted">
                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${stop.isFinal ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                                                                {stop.isFinal ? <Flag className="h-3 w-3 text-primary" /> : <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                            </div>
                                                            <p className={`text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{stop.name} {stop.isFinal && `(${t('final')})`}</p>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <p className={`font-mono text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{t('farePerSeat', { fare: fare.toFixed(2) })}</p>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="px-3 pt-2 pb-2 text-center">
                                                    {passedBusInfo ? (
                                                        <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">This bus has passed. Please use the option above.</p>
                                                    ) : displayedBus.capacity.current + selectedSeats.length > displayedBus.capacity.max ? (
                                                        <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">{t('notEnoughSeats')}</p>
                                                    ) : (
                                                        <Button className='w-full' onClick={() => handleBoard(stop)} disabled={isBoarding || selectedSeats.length === 0}>
                                                            {isBoarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedSeats.length === 0 ? t('selectBusSeatFirst') : t('board')}
                                                        </Button>
                                                    )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
                )}
            </div>

            <div className="max-w-md mx-auto mt-4">
                 {(fromQuery || toQuery) && !displayedBus && (
                    <div className='space-y-4'>
                        <h1 className="text-xl font-bold text-foreground">{t('showingResultsFor')}:</h1>
                        <p className="text-muted-foreground -mt-2"><span className='font-semibold text-foreground'>{fromQuery}</span> to <span className='font-semibold text-foreground'>{toQuery}</span></p>

                        {filteredBuses.length > 0 ? (
                            filteredBuses.map(bus => (
                                <Card key={bus.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleBusSelect(bus)}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className='h-12 w-12'>
                                            {bus.driverImage && <AvatarImage src={bus.driverImage} alt={bus.driver} />}
                                            <AvatarFallback>{bus.driver.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex-grow'>
                                            <p className='font-bold'>{bus.driver}</p>
                                            <p className='text-sm text-muted-foreground font-mono'>{bus.plate}</p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-semibold'>{t('minutesAbbr', { minutes: bus.eta })}</p>
                                            <p className='text-xs text-muted-foreground'>{t('eta')}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <Card>
                                <CardContent className='p-8 text-center text-muted-foreground'>
                                    <p>{t('noBusesFound')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
                 {!(fromQuery || toQuery) && !displayedBus && (
                    <div className="text-center mt-16 text-muted-foreground">
                        <Search className="h-16 w-16 text-muted-foreground/30 mb-4 mx-auto" />
                        <h1 className="text-2xl font-bold text-foreground">{t('findYourBus')}</h1>
                        <p className="mt-2">{t('enterDestinationToSeeBuses')}</p>
                    </div>
                )}
            </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-10">
            <BottomNav />
        </div>

        <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader><SheetTitle>{t('yourBoardingPass')}</SheetTitle></SheetHeader>
                <div className="p-4 flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt={t('boardingQrCode')} width={200} height={200} />
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">{t('showQrToDriver')}</p>
                        <div className="flex items-center gap-4 justify-center">
                            <Badge variant="outline">{displayedBus?.plate}</Badge>
                            {primarySeat && <Badge>{t('seat')}: {primarySeat}</Badge>}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}
