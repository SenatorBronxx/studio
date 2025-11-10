
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, BusFront, X, Flag, Users, Loader2, Clock, Armchair, QrCode, Bell, Trash2, MapPin } from 'lucide-react';
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
import { useWallet } from '@/context/wallet-context';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

const initialBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 15,
      capacity: { current: 35, max: 52 },
      stops: [
        { name: 'Adenta', fare: 5.00 },
        { name: 'Madina', fare: 7.50 },
      ],
      finalDestination: { name: 'Atomic Junction', fare: 10.00 },
      position: { top: '45%', left: '25%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: [
        { id: '1A', isOccupied: true }, { id: '1B', isOccupied: false }, null, { id: '1C', isOccupied: false }, { id: '1D', isOccupied: true },
        { id: '2A', isOccupied: false }, { id: '2B', isOccupied: true }, null, { id: '2C', isOccupied: false }, { id: '2D', isOccupied: false },
        { id: '3A', isOccupied: true }, { id: '3B', isOccupied: true }, null, { id: '3C', isOccupied: false }, { id: '3D', isOccupied: true },
        { id: '4A', isOccupied: false }, { id: '4B', isOccupied: false }, null, { id: '4C', isOccupied: true }, { id: '4D', isOccupied: false },
        { id: '5A', isOccupied: true }, { id: '5B', isOccupied: false }, null, { id: '5C', isOccupied: false }, { id: '5D', isOccupied: false },
      ]
    },
    {
      id: 'bus-2',
      driver: 'Ama Serwaa',
      plate: 'AS 1234-24',
      eta: 25,
      capacity: { current: 48, max: 48 },
      stops: [
        { name: 'Circle', fare: 6.00 },
        { name: 'Kaneshie', fare: 8.50 },
      ],
      finalDestination: { name: 'Mallam', fare: 12.00 },
      position: { top: '55%', left: '65%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: Array.from({ length: 25 }, (_, i) => ({ id: `${Math.floor(i/5)+1}${String.fromCharCode(65 + (i % 5 > 1 ? i%5-1 : i%5))}`, isOccupied: true }))
    },
];

type BusData = typeof initialBusData[0];
type Notification = {
    id: number;
    title: string;
    description: string;
    action?: React.ReactNode;
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
  const { balance, deductBalance, addTransaction } = useWallet();
  
  const [buses, setBuses] = useState(initialBusData);
  const [filteredBuses, setFilteredBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [boardedStop, setBoardedStop] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dynamicEta, setDynamicEta] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
        if (fromQuery || toQuery) {
            const results = buses.filter(bus => {
                const allStops = [...bus.stops.map(s => s.name.toLowerCase()), bus.finalDestination.name.toLowerCase()];
                const fromMatch = fromQuery ? allStops.some(stop => stop.includes(fromQuery.toLowerCase())) : true;
                const toMatch = toQuery ? allStops.some(stop => stop.includes(toQuery.toLowerCase())) : true;
                return fromMatch && toMatch;
            });
            setFilteredBuses(results);
        } else {
            setFilteredBuses([]);
        }
    }
  }, [fromQuery, toQuery, buses, isHydrated]);

   useEffect(() => {
    let interval: NodeJS.Timeout;
    if (boardedStop && dynamicEta !== null && dynamicEta > 0) {
      interval = setInterval(() => {
        setDynamicEta(prevEta => (prevEta ? prevEta - 1 : 0));
      }, 60 * 1000); // Decrease every minute
    }
    return () => clearInterval(interval);
  }, [boardedStop, dynamicEta]);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    setSelectedBus(bus);
    setBoardedStop(null);
    setSelectedSeat(null);
    setDynamicEta(bus.eta);
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setBoardedStop(null);
    setSelectedSeat(null);
    setDynamicEta(null);
  }

  const handleBoard = (stop: {name: string, fare: number}) => {
    if (balance < stop.fare) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `Your ERITAS Pay balance is too low to book this trip. Please top-up.`,
      });
      return;
    }

    setIsBoarding(true);
    setTimeout(() => {
        setIsBoarding(false);
        setBoardedStop(stop.name);
        deductBalance(stop.fare);

        const newTransaction = {
            id: uuidv4(),
            type: 'payment',
            plate: selectedBus?.plate || 'N/A',
            amount: -stop.fare,
        };
        addTransaction(newTransaction);
        
        setBuses(prevBuses => {
            const newBuses = prevBuses.map(b => {
                if (b.id === selectedBus?.id) {
                    const newSeating = b.seating.map(s => s && s.id === selectedSeat ? { ...s, isOccupied: true } : s);
                    const updatedBus = { ...b, seating: newSeating, capacity: { ...b.capacity, current: b.capacity.current + 1 }};
                    setSelectedBus(updatedBus);
                    return updatedBus;
                }
                return b;
            });
            return newBuses;
        });

        const qrData = { bus: selectedBus?.plate, seat: selectedSeat, from: stop.name, to: selectedBus?.finalDestination.name, fare: stop.fare, timestamp: new Date().toISOString() };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`);
        
        const newNotification: Notification = {
            id: Date.now(),
            title: 'Seat Booked Successfully!',
            description: `Your seat ${selectedSeat} on bus ${selectedBus?.plate} is confirmed.`,
            action: <Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}><QrCode className="mr-2 h-4 w-4" />View QR Code</Button>
        }
        setNotifications(prev => [newNotification, ...prev]);

        toast({
            title: "Seat Booked Successfully!",
            description: `A notification has been added. The fare of GH₵${stop.fare.toFixed(2)} has been deducted.`,
        });

    }, 1500);
  }
  
  const handleSeatSelect = (seatId: string) => {
    if (selectedBus) {
        const seat = selectedBus.seating.find(s => s?.id === seatId);
        if (seat && !seat.isOccupied) {
            setSelectedSeat(prevSeat => prevSeat === seatId ? null : seatId);
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="max-w-md mx-auto space-y-2">
                <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder='From' 
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
                        placeholder='To' 
                        className='pl-10'
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleSearch} className="w-full">
                    <Search className='mr-2 h-5 w-5' />
                    Search For Buses
                </Button>
            </div>
        </header>

        <main className="flex-grow p-4">
            <div className="max-w-md mx-auto">
                {selectedBus ? (
                    <div className="space-y-3">
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            {selectedBus.driverImage && <AvatarImage src={selectedBus.driverImage} alt={selectedBus.driver} />}
                                            <AvatarFallback>{selectedBus.driver.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">{selectedBus.driver}</h2>
                                            <p className="text-sm text-muted-foreground font-mono">{selectedBus.plate}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <Sheet open={isSeatSheetOpen} onOpenChange={setIsSeatSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className='w-full'>
                                            <Armchair className="mr-2 h-5 w-5" />
                                            {selectedSeat ? `Seat ${selectedSeat} Selected` : 'View Seats'}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="rounded-t-2xl">
                                        <SheetHeader><SheetTitle>Select Your Seat</SheetTitle></SheetHeader>
                                        <BusSeatingChart 
                                            seating={selectedBus.seating}
                                            selectedSeat={selectedSeat}
                                            onSeatSelect={handleSeatSelect}
                                            busPlate={selectedBus.plate}
                                            onConfirm={handleConfirmSeat}
                                        />
                                    </SheetContent>
                                </Sheet>

                                <Separator />

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2"><Users className="h-4 w-4" />Bus Capacity</h3>
                                        <p className="text-sm font-mono text-muted-foreground">{selectedBus.capacity.current} / {selectedBus.capacity.max} Seats</p>
                                    </div>
                                    <Progress value={(selectedBus.capacity.current / selectedBus.capacity.max) * 100} className="h-2" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-foreground/80 mb-2">Bus Fares:</h3>
                                    <Accordion type="single" collapsible className="w-full">
                                        {[...selectedBus.stops, { ...selectedBus.finalDestination, isFinal: true }].map((stop, index) => (
                                        <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                            <AccordionTrigger className="py-2 rounded-lg hover:bg-muted/50 px-2 data-[state=open]:bg-muted">
                                                <div className="flex items-center justify-between gap-3 w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${stop.isFinal ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                                                            {stop.isFinal ? <Flag className="h-3 w-3 text-primary" /> : <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                        </div>
                                                        <p className={`text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{stop.name} {stop.isFinal && '(Final)'}</p>
                                                    </div>
                                                    <p className={`font-mono text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>GH₵{stop.fare.toFixed(2)}</p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="px-3 pt-2 pb-2 text-center">
                                                {boardedStop === stop.name ? (
                                                    <div className="flex items-center justify-center gap-2 text-primary font-semibold p-2 bg-primary/10 rounded-md">
                                                        <Clock className="h-5 w-5" />
                                                        <span>Arriving in <strong>{dynamicEta} min</strong></span>
                                                    </div>
                                                ) : selectedBus.capacity.current < selectedBus.capacity.max ? (
                                                    <Button className='w-full' onClick={() => handleBoard(stop)} disabled={isBoarding || !selectedSeat}>
                                                        {isBoarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : !selectedSeat ? 'Select bus seat first' : 'BOARD'}
                                                    </Button>
                                                ) : (
                                                    <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">This bus is full.</p>
                                                )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (fromQuery || toQuery) ? (
                    <div className='space-y-4'>
                        <h1 className="text-xl font-bold text-foreground">Showing results for:</h1>
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
                                            <p className='font-semibold'>{bus.eta} min</p>
                                            <p className='text-xs text-muted-foreground'>ETA</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <Card>
                                <CardContent className='p-8 text-center text-muted-foreground'>
                                    <p>No buses found for this route.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="text-center mt-16 text-muted-foreground">
                        <Search className="h-16 w-16 text-muted-foreground/30 mb-4 mx-auto" />
                        <h1 className="text-2xl font-bold text-foreground">Find Your Bus</h1>
                        <p className="mt-2">Enter a destination to see available buses.</p>
                    </div>
                )}
            </div>
        </main>

        <div className="sticky bottom-0 z-20">
            <BottomNav />
        </div>

        <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader><SheetTitle>Your Boarding Pass</SheetTitle></SheetHeader>
                <div className="p-4 flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt="Boarding QR Code" width={200} height={200} />
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">Show this QR code to the driver for verification.</p>
                        <div className="flex items-center gap-4 justify-center">
                            <Badge variant="outline">{selectedBus?.plate}</Badge>
                            <Badge>Seat {selectedSeat}</Badge>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}
