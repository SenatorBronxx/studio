
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
  Ticket,
  LogIn,
  Bus,
  UserCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';
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
import { useDiscount } from '@/context/discount-context';
import { useLanguage } from '@/context/language-context';
import { useTrip, type ActiveTrip } from '@/context/trip-context';
import { useUser } from '@/context/user-context';
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
type Notification = {
    id: number;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { balance, deductBalance, addTransaction, addLoyaltyPoints, addBalance: refundBalance } = useWallet();
  const { setIsOnBus, isOnBus } = useMusic();
  const { activeTrip, setActiveTrip, isHydrated: isTripHydrated, setDynamicEta, clearActiveTrip } = useTrip();
  const { bookingAlerts } = useNotificationSettings();
  const { activeDiscount, isDiscountBannerDismissed, dismissDiscountBanner } = useDiscount();
  const { t } = useLanguage();
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [buses, setBuses] = useState(initialBusData);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDiscountBanner, setShowDiscountBanner] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (activeDiscount && !isDiscountBannerDismissed) {
      setShowDiscountBanner(true);
    } else {
      setShowDiscountBanner(false);
    }
  }, [activeDiscount, isDiscountBannerDismissed]);

  useEffect(() => {
    if (isTripHydrated && activeTrip) {
      const busData = buses.find(b => b.id === activeTrip.bus.id);
      if (busData) {
        setSelectedBus(busData);
        setSelectedSeats(activeTrip.seats);
      }
    } else if (isTripHydrated && !activeTrip) {
      setSelectedBus(null);
      setSelectedSeats([]);
    }
  }, [isTripHydrated, activeTrip, buses]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTrip && activeTrip.eta > 0) {
      interval = setInterval(() => {
        setDynamicEta(activeTrip.eta - 1);
      }, 60 * 1000); 
    } else if (activeTrip && activeTrip.eta <= 0 && !isOnBus) {
        setIsTransitioning(true);
        setTimeout(() => {
            setIsOnBus(true);
            const destinationStop = [...activeTrip.bus.stops, activeTrip.bus.finalDestination].find(s => s.name === activeTrip.destination);
            if (destinationStop) {
                setDynamicEta(destinationStop.eta);
            }
            toast({
                title: t('onTheBusToastTitle'),
                description: t('onTheBusToastDescription'),
            });
            setIsTransitioning(false);
        }, 2000); // Duration of the animation
    }
    return () => clearInterval(interval);
  }, [activeTrip, isOnBus, setIsOnBus, setDynamicEta, toast, t]);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
     if (!user) {
      toast({
        variant: "destructive",
        title: t('notLoggedIn'),
        description: "You must be logged in to select a bus.",
      });
      return;
    }
    if (activeTrip) {
      toast({
        variant: "destructive",
        title: "Trip in Progress",
        description: "You cannot select a new bus while a trip is in progress."
      });
      return;
    }
    setSelectedBus(bus);
    setSelectedSeats([]); 
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
  }

  const handleBoard = (stop: {name: string, fare: number, eta: number}) => {
    if (!selectedBus || selectedSeats.length === 0) return;

    let farePerSeat = stop.fare;
    if (activeDiscount) {
        farePerSeat = farePerSeat * (1 - activeDiscount.percentage / 100);
    }
    const totalFare = farePerSeat * selectedSeats.length;


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
        setIsBoarding(false);
        deductBalance(totalFare);

        const newTransaction = {
            id: uuidv4(),
            type: 'payment',
            plate: selectedBus?.plate || 'N/A',
            amount: -totalFare,
        };
        addTransaction(newTransaction);
        
        let updatedBus : BusData | undefined;
        const updatedBuses = buses.map(b => {
            if (b.id === selectedBus.id) {
                const newSeating = b.seating.map(s => (s && selectedSeats.includes(s.id)) ? { ...s, isOccupied: true } : s);
                updatedBus = { ...b, seating: newSeating, capacity: { ...b.capacity, current: b.capacity.current + selectedSeats.length }};
                setSelectedBus(updatedBus);
                return updatedBus;
            }
            return b;
        });
        setBuses(updatedBuses);

        if(updatedBus){
            const newTrip: ActiveTrip = {
                bus: updatedBus,
                from: "Your Location", // Mock user's current location
                destination: stop.name,
                eta: updatedBus.eta, // ETA for bus to arrive at user's location
                seats: selectedSeats,
                destinationEta: stop.eta, // ETA from boarding stop to destination
            };
            setActiveTrip(newTrip);
        }

        const pointsEarned = Math.floor(totalFare);
        addLoyaltyPoints(pointsEarned);

        const primarySeat = selectedSeats[0];
        const qrData = {
          bus: selectedBus.plate,
          seat: primarySeat,
          from: stop.name,
          to: selectedBus.finalDestination.name,
          fare: totalFare / selectedSeats.length, // Fare per seat
          timestamp: new Date().toISOString(),
        };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`);
        
        if (bookingAlerts) {
            const newNotification: Notification = {
                id: Date.now(),
                title: t('seatBookedToastTitle'),
                description: t('seatBookedNotificationDescription', { seat: primarySeat, plate: selectedBus.plate }),
                action: (
                     <Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        {t('viewQrCode')}
                    </Button>
                )
            }
            setNotifications(prev => [newNotification, ...prev]);

            if (selectedSeats.length > 1) {
                const reservedSeatsNotification: Notification = {
                    id: Date.now() + 1,
                    title: t('seatsReservedForOthers'),
                    description: t('seatsReservedForOthersDescription'),
                    action: (
                        <Button variant="default" size="sm" onClick={() => router.push('/share-trip')}>
                            <Send className="mr-2 h-4 w-4" />
                            {t('sendToRecipient')}
                        </Button>
                    )
                }
                setNotifications(prev => [reservedSeatsNotification, ...prev]);
            }

            let toastDescription = t('fareDeductedToastDescription', { fare: totalFare.toFixed(2) });
            if (activeDiscount) {
                toastDescription += ` (${t('discountAppliedToast', { percentage: activeDiscount.percentage })})`
            }

            toast({
                title: t('seatBookedToastTitle'),
                description: toastDescription,
            });

            if (pointsEarned > 0) {
                toast({
                    title: t('loyaltyPointsAwarded'),
                    description: t('loyaltyPointsAwardedDescription', { points: pointsEarned }),
                });
            }
        }

    }, 1500);
  }

   const handleCancelTrip = () => {
    if (!activeTrip) return;

    // Find the original fare
    const allStops = [...activeTrip.bus.stops, activeTrip.bus.finalDestination];
    const destinationStop = allStops.find(s => s.name === activeTrip.destination);
    if (!destinationStop) return; // Should not happen

    let fareToRefund = destinationStop.fare * activeTrip.seats.length;
    if (activeDiscount) {
      fareToRefund *= (1 - activeDiscount.percentage / 100);
    }
    
    // 1. Refund the user
    refundBalance(fareToRefund);
    addTransaction({ type: 'top-up', plate: `Refund for ${activeTrip.bus.plate}`, amount: fareToRefund });

    // 2. Free up the seat
    const updatedBuses = buses.map(b => {
      if (b.id === activeTrip.bus.id) {
        const newSeating = b.seating.map(s => (s && activeTrip.seats.includes(s.id)) ? { ...s, isOccupied: false } : s);
        return { ...b, seating: newSeating, capacity: { ...b.capacity, current: b.capacity.current - activeTrip.seats.length }};
      }
      return b;
    });
    setBuses(updatedBuses);

    // 3. Clear trip state
    clearActiveTrip();
    setSelectedBus(null);
    setSelectedSeats([]);
    setIsOnBus(false);
    setQrCodeUrl(null); // Invalidate QR Code

    // 4. Notify user
    toast({
      title: t('tripCancelled'),
      description: t('tripCancelledDescription', { fare: fareToRefund.toFixed(2) }),
    });

    const newNotification: Notification = {
        id: Date.now(),
        title: "Trip Cancelled",
        description: "Your QR code for this trip has been terminated."
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  
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

  const handleDismissBanner = () => {
    dismissDiscountBanner();
    setShowDiscountBanner(false);
  }

  const displayedBus = activeTrip?.bus || selectedBus;
  const primarySeat = activeTrip?.seats[0] || selectedSeats[0];

  if (!user) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">{t('signInToContinue')}</h1>
            <p className='text-muted-foreground'>{t('signInToAccessFeatures')}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              <LogIn className="mr-2 h-4 w-4" />
              {t('goToSignIn')}
            </Button>
        </div>
    );
  }


  return (
    <div className="relative min-h-screen w-full bg-background font-sans">
      <div className="absolute inset-0 h-full w-full">
        <Map />
        <div className="absolute inset-0 bg-background/20 pointer-events-none" />
      </div>

      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <div className="flex-1">
          <ProfileSidebar />
        </div>
        <div className="flex-1 flex justify-center">
            <Image
                src="https://jklylnqjwfrmjrsqfzys.supabase.co/storage/v1/object/public/images/eritas-logo-1763267730211.png"
                alt="Eritas Transport Company Logo"
                width={120}
                height={60}
                priority
                className="object-contain"
            />
        </div>
        <div className="flex-1 flex justify-end">
        <Sheet>
            <SheetTrigger asChild>
                 <Button
                    variant="default"
                    size="icon"
                    className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
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
                    <SheetTitle>{t('notifications')}</SheetTitle>
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
                                {t('clearAll')}
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4" />
                            <p>{t('noNewNotifications')}</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
        </div>
      </header>
      
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

        <div className="absolute top-1/3 right-1/4 animate-float [animation-delay:-2s]">
          <MapPin className="h-12 w-12 text-red-500 opacity-70" />
        </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-4">
        <div className="bg-background/75 backdrop-blur-sm rounded-t-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
            {showDiscountBanner && activeDiscount && (
                 <div className="relative bg-primary/10 border-l-4 border-primary text-primary-foreground p-4 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-primary hover:bg-primary/20" onClick={handleDismissBanner}>
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Ticket className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-bold text-primary">{t('discountActivatedTitle', { percentage: activeDiscount.percentage })}</h3>
                            <p className="text-sm text-primary/80">{activeDiscount.description}</p>
                        </div>
                    </div>
                </div>
            )}
            {displayedBus && isTripHydrated ? (
              <div className="space-y-3">
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
                     {!activeTrip && (
                      <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                          <X className="h-5 w-5" />
                      </Button>
                    )}
                    {activeTrip && !isOnBus && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                                <X className="mr-2 h-4 w-4" />
                                {t('cancel')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('cancelTripConfirmationTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('cancelTripConfirmationDescription')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('goBack')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancelTrip}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {t('confirmCancellation')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {activeTrip ? (
                   <div className="relative p-3 bg-primary/10 rounded-lg text-center overflow-hidden">
                        <Bus className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-8 w-8 text-primary/50",
                            isTransitioning ? 'animate-slide-across' : '-left-12'
                        )} />
                        <div className={cn("transition-opacity duration-500", isTransitioning ? 'opacity-0' : 'opacity-100')}>
                            <p className='text-sm text-primary/80'>
                            {isOnBus ? t('arrivingAt') : t('busArrivingAtYourLocation')} <span className='font-bold'>{isOnBus ? activeTrip.destination : activeTrip.from}</span>
                            </p>
                            <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
                                <Clock className="h-5 w-5" />
                                {activeTrip.eta > 0 ? (
                                    <span dangerouslySetInnerHTML={{ __html: t('arrivingIn', { minutes: activeTrip.eta }) }} />
                                ) : (
                                    <span>{isOnBus ? t('youHaveArrived') : t('busHasArrived')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Sheet open={isSeatSheetOpen} onOpenChange={setIsSeatSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className='w-full'>
                                <Armchair className="mr-2 h-5 w-5" />
                                {selectedSeats.length > 0 ? t('seatsSelected', { count: selectedSeats.length }) : t('viewSeats')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl">
                            <SheetHeader>
                                <SheetTitle>{t('selectYourSeat')}</SheetTitle>
                            </SheetHeader>
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
                             if (activeDiscount) {
                                fare = fare * (1 - activeDiscount.percentage / 100);
                             }

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
                                        {activeDiscount && <Badge variant="destructive">-{activeDiscount.percentage}%</Badge>}
                                            <p className={`font-mono text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{t('farePerSeat', { fare: fare.toFixed(2) })}</p>
                                        </div>
                                    </div>
                                 </AccordionTrigger>
                                 <AccordionContent>
                                    <div className="px-3 pt-2 pb-2 text-center">
                                    {activeTrip ? (
                                         <p className='text-sm text-muted-foreground'>{t('tripInProgress')}</p>
                                    ): displayedBus.capacity.current + selectedSeats.length > displayedBus.capacity.max ? (
                                        <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">{t('notEnoughSeats')}</p>
                                    ) : (
                                        <Button 
                                            className='w-full' 
                                            onClick={() => handleBoard(stop)} 
                                            disabled={isBoarding || selectedSeats.length === 0 || !!activeTrip}
                                        >
                                            {isBoarding ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : selectedSeats.length === 0 ? (
                                                t('selectBusSeatFirst')
                                            ) : (
                                                t('board')
                                            )}
                                        </Button>
                                    )}
                                    </div>
                                 </AccordionContent>
                               </AccordionItem>
                            )
                        })}
                    </Accordion>
                 </div>
              </div>
            ) : (
            <>
                <div className='text-center'>
                    <h2 className="text-xl font-bold text-foreground">{t('homeGreeting', { name: user?.name.split(' ')[0] || t('friend') })}</h2>
                    <p className="text-sm text-muted-foreground">{t('homeSubGreeting')}</p>
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
                <Button onClick={handleSearch}>
                    <Search className='mr-2 h-5 w-5' />
                    {t('searchBuses')}
                </Button>
            </>
            )}
        </div>
        <BottomNav />
      </div>

       <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>{t('yourBoardingPass')}</SheetTitle>
                </SheetHeader>
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
                            <Badge>{t('seat')}: {primarySeat}</Badge>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}

    

    




    

    