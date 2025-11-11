
'use client';

import Image from 'next/image';
import {
  ArrowRight,
  BusFront,
  MapPin,
  Search,
  X,
  Flag,
  Users,
  Loader2,
  Clock,
  Armchair,
  QrCode,
  Bell,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/bottom-nav';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BusSeatingChart } from '@/components/bus-seating-chart';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/context/wallet-context';
import { v4 as uuidv4 } from 'uuid';
import { Map } from '@/components/map';
import { useMusic } from '@/context/music-context';
import { useNotificationSettings } from '@/context/notification-settings-context';

const initialBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 1,
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

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { balance, deductBalance, addTransaction } = useWallet();
  const { setIsOnBus } = useMusic();
  const { bookingAlerts } = useNotificationSettings();
  const userName = searchParams.get('name') || 'there';
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [buses, setBuses] = useState(initialBusData);
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
    let interval: NodeJS.Timeout;
    if (boardedStop && dynamicEta !== null && dynamicEta > 0) {
      interval = setInterval(() => {
        setDynamicEta(prevEta => (prevEta ? prevEta - 1 : 0));
      }, 60 * 1000); // Decrease every minute
    } else if (dynamicEta === 0) {
        setIsOnBus(true);
        toast({
            title: "You're on the bus!",
            description: "You can now add songs to the bus playlist.",
        });
    }
    return () => clearInterval(interval);
  }, [boardedStop, dynamicEta, setIsOnBus, toast]);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    setSelectedBus(bus);
    setBoardedStop(null); // Reset boarded stop when a new bus is selected
    setSelectedSeat(null); // Reset selected seat
    setDynamicEta(bus.eta); // Initialize dynamic ETA
    setIsOnBus(false); // Reset on bus status
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setBoardedStop(null);
    setSelectedSeat(null);
    setDynamicEta(null);
    setIsOnBus(false); // Reset on bus status
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
    // Simulate API call
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
        
        // Update bus data
        setBuses(prevBuses => {
            const newBuses = prevBuses.map(b => {
                if (b.id === selectedBus?.id) {
                    const newSeating = b.seating.map(s => {
                        if (s && s.id === selectedSeat) {
                            return { ...s, isOccupied: true };
                        }
                        return s;
                    });
                    const updatedBus = {
                        ...b,
                        seating: newSeating,
                        capacity: { ...b.capacity, current: b.capacity.current + 1 },
                    };
                    setSelectedBus(updatedBus); // Update selectedBus with new data
                    return updatedBus;
                }
                return b;
            });
            return newBuses;
        });


        // Generate QR code data
        const qrData = {
          bus: selectedBus?.plate,
          seat: selectedSeat,
          from: stop.name,
          to: selectedBus?.finalDestination.name,
          fare: stop.fare,
          timestamp: new Date().toISOString(),
        };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`);
        
        if (bookingAlerts) {
            const newNotification: Notification = {
                id: Date.now(),
                title: 'Seat Booked Successfully!',
                description: `Your seat ${selectedSeat} on bus ${selectedBus?.plate} is confirmed.`,
                action: (
                     <Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        View QR Code
                    </Button>
                )
            }
            
            setNotifications(prev => [newNotification, ...prev]);

            toast({
                title: "Seat Booked Successfully!",
                description: `A notification has been added to your inbox. The fare of GH₵${stop.fare.toFixed(2)} has been deducted.`,
            });
        }

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


  return (
    <div className="relative min-h-screen w-full bg-background font-sans">
      {/* Map Background */}
      <div className="absolute inset-0 h-full w-full">
        <Map />
        <div className="absolute inset-0 bg-background/20 pointer-events-none" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <ProfileSidebar />
        <Sheet>
            <SheetTrigger asChild>
                 <Button
                    variant="default"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground relative"
                >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-primary-foreground text-xs items-center justify-center">
                                {notifications.length}
                            </span>
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="py-4 h-full flex flex-col">
                    {notifications.length > 0 ? (
                        <>
                            <div className="flex-grow space-y-4 overflow-y-auto">
                                {notifications.map(notification => (
                                    <Card key={notification.id}>
                                        <CardContent className='p-4 space-y-2'>
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                                            {notification.action && <div className='pt-2'>{notification.action}</div>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => setNotifications([])}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear All
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4" />
                            <p>You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
      </header>
      
       {/* Bus Icon Stickers */}
        {buses.map((bus, index) => (
            <div 
                key={bus.id}
                className="absolute z-10 animate-float cursor-pointer"
                style={{
                    top: bus.position.top,
                    left: bus.position.left,
                    animationDelay: `-${index * 2}s`
                }}
                onClick={() => handleBusSelect(bus)}
            >
                 <BusFront className="h-12 w-12 text-primary opacity-80" />
            </div>
        ))}

        {/* Map Pin Sticker */}
        <div className="absolute top-1/3 right-1/4 animate-float [animation-delay:-2s]">
          <MapPin className="h-12 w-12 text-red-500 opacity-70" />
        </div>


      {/* Bottom Sheet - Search and Nav */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-t-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
            {selectedBus ? (
              <div className="space-y-3">
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
                        <SheetHeader>
                            <SheetTitle>Select Your Seat</SheetTitle>
                        </SheetHeader>
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
                                        {dynamicEta !== null && dynamicEta > 0 ? (
                                            <span>Arriving in <strong>{dynamicEta} min</strong></span>
                                        ) : (
                                            <span>You are on the bus!</span>
                                        )}
                                    </div>
                                ) : selectedBus.capacity.current < selectedBus.capacity.max ? (
                                    <Button 
                                        className='w-full' 
                                        onClick={() => handleBoard(stop)} 
                                        disabled={isBoarding || !selectedSeat}
                                    >
                                        {isBoarding ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : !selectedSeat ? (
                                            'Select bus seat first'
                                        ) : (
                                            'BOARD'
                                        )}
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
              </div>
            ) : (
            <>
                <div className='text-center'>
                    <h2 className="text-xl font-bold text-foreground">Hi {userName}, ready for your next trip?</h2>
                    <p className="text-sm text-muted-foreground">Find the perfect bus for your journey</p>
                </div>
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
                <Button onClick={handleSearch}>
                    <Search className='mr-2 h-5 w-5' />
                    Search Buses
                </Button>
            </>
            )}
        </div>
        <BottomNav />
      </div>

       <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>Your Boarding Pass</SheetTitle>
                </SheetHeader>
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
