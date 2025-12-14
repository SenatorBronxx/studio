
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
  ArrowUpRight,
  Footprints,
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { TripRating } from '@/components/trip-rating';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

type BusData = {
  id: string;
  driver: string;
  plate: string;
  eta: number;
  capacity: { current: number, max: number };
  stops: { name: string; fare: number; eta: number; }[];
  finalDestination: { name: string; fare: number; eta: number; };
  position: { top: string; left: string; };
  driverImage: string | undefined;
  seating: ({ id: string; isOccupied: boolean; } | null)[];
};
type StopInfo = { name: string; fare: number; eta: number };
type Notification = {
    id: number;
    title: string;
    description: string;
    tripId?: string;
    action?: React.ReactNode;
};
type PassedBusInfo = {
    nextStop: StopInfo;
    walkingTime: number;
};

export default function HomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { balance, deductBalance, addTransaction, addLoyaltyPoints, addBalance: refundBalance, isLowBalance } = useWallet();
  const { setIsOnBus, isOnBus, setNowPlaying } = useMusic();
  const { activeTrip, setActiveTrip, isHydrated: isTripHydrated, setDynamicEta, clearActiveTrip, setCurrentStopIndex } = useTrip();
  const { bookingAlerts } = useNotificationSettings();
  const { activeDiscount, isDiscountBannerDismissed, dismissDiscountBanner } = useDiscount();
  const { t } = useLanguage();
  
  const [fromLocation, setFromLocation] = useState('Your Current Location');
  const [toLocation, setToLocation] = useState('');
  
  // *** POINT 1: LISTENING FOR DRIVER APPS ***
  // This fetches all bus data from the `/buses` collection in Firestore.
  // Driver apps would be responsible for writing and updating their documents here.
  const busesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'buses') : null, [firestore]);
  const { data: buses, isLoading: isLoadingBuses } = useCollection<BusData>(busesQuery);

  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDiscountBanner, setShowDiscountBanner] = useState(false);
  const [busHasArrived, setBusHasArrived] = useState(false);
  const [tripToRate, setTripToRate] = useState<ActiveTrip | null>(null);
  const [passedBusInfo, setPassedBusInfo] = useState<PassedBusInfo | null>(null);

  useBusArrivalNotification(busHasArrived);
  
  useEffect(() => {
    if (activeDiscount && !isDiscountBannerDismissed) {
      setShowDiscountBanner(true);
    } else {
      setShowDiscountBanner(false);
    }
  }, [activeDiscount, isDiscountBannerDismissed]);

  useEffect(() => {
    if (isTripHydrated && activeTrip && buses) {
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
      }, 5 * 1000); // 5 seconds for faster testing
    } else if (activeTrip && activeTrip.eta <= 0) {
      if (isOnBus) {
        // Trip has ended
        toast({
          title: t('tripEndedTitle'),
          description: t('tripEndedDescription'),
        });
        setTripToRate(activeTrip);
        clearActiveTrip();
        setIsOnBus(false);
        setNowPlaying(null);
      } else {
        // Bus has arrived for pickup
        if (!busHasArrived) {
          setBusHasArrived(true);
        }
        setIsOnBus(true);
        const destinationStop = [...activeTrip.bus.stops, activeTrip.bus.finalDestination].find(s => s.name === activeTrip.destination);
        if (destinationStop) {
            setDynamicEta(destinationStop.eta);
            setCurrentStopIndex(0); // Start tracking stops
        }
        toast({
            title: t('onTheBusToastTitle'),
            description: t('onTheBusToastDescription'),
        });
      }
    }

    return () => clearInterval(interval);
  }, [activeTrip, isOnBus, setDynamicEta, setIsOnBus, t, toast, clearActiveTrip, setCurrentStopIndex, busHasArrived, setNowPlaying]);

  useEffect(() => {
    if (isLowBalance) {
        if (!notifications.some(n => n.id === -1)) {
            const lowBalanceNotification: Notification = {
                id: -1,
                title: t('lowBalanceWarningToastTitle'),
                description: t('lowBalanceWarningToastDescription'),
                action: (
                    <Button onClick={() => router.push('/top-up')} size="sm">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        {t('topUp')}
                    </Button>
                ),
            };
            setNotifications(prev => [lowBalanceNotification, ...prev.filter(n => n.id !== -1)]);
        }
    } else {
        setNotifications(prev => prev.filter(n => n.id !== -1));
    }
  }, [isLowBalance, t, router]);


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
    setPassedBusInfo(null); // Reset passed bus info

    // Check if the bus has already passed
    if (bus.eta <= 0 && bus.stops.length > 0) {
        const nextStop = bus.stops[0]; // Simple logic: suggest the first stop
        const walkingTime = 5 + Math.floor(Math.random() * 10); // Mock walking time: 5-15 mins
        setPassedBusInfo({ nextStop, walkingTime });
    }
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassedBusInfo(null);
  }

  const handleBoard = async (stop: {name: string, fare: number, eta: number}) => {
    if (!selectedBus || selectedSeats.length === 0 || !user || !firestore) return;

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
    
    // *** POINT 2: CREATING A TRIP FOR THE DRIVER APP ***
    // This creates a new document in the `/trips` collection.
    // The driver's app would be listening for new documents here.
    const tripId = uuidv4();
    const tripRef = doc(firestore, 'trips', tripId);
    const tripData = {
        id: tripId,
        userId: user.uid,
        busId: selectedBus.id,
        busPlate: selectedBus.plate,
        status: 'pending', // Driver app would change this to 'accepted'
        origin: { name: 'Current Location', location: null /* Add GeoPoint here */ },
        destination: { name: stop.name, location: null /* Add GeoPoint here */ },
        pickupLocation: null, // User's current location
        currentBusLocation: null, // Driver app updates this
        eta: selectedBus.eta,
        fare: totalFare,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    
    try {
        await setDoc(tripRef, tripData);
    
        // All local state updates happen after successful DB write.
        deductBalance(totalFare);
        const newTransaction = { id: tripId, type: 'payment', plate: selectedBus?.plate || 'N/A', amount: -totalFare };
        addTransaction(newTransaction);
        
        // This part is a simulation of how the bus data would update.
        // In a real app, this would be updated by a backend function or the driver app.
        const updatedBus = {
            ...selectedBus,
            seating: selectedBus.seating.map(s => (s && selectedSeats.includes(s.id)) ? { ...s, isOccupied: true } : s),
            capacity: { ...selectedBus.capacity, current: selectedBus.capacity.current + selectedSeats.length }
        };
        setSelectedBus(updatedBus);

        const newTrip: ActiveTrip = {
            id: tripId,
            bus: updatedBus,
            from: "Your Location",
            destination: stop.name,
            eta: updatedBus.eta,
            seats: selectedSeats,
            destinationEta: stop.eta,
            currentStopIndex: -1,
        };
        setActiveTrip(newTrip);

        const pointsEarned = Math.floor(totalFare);
        addLoyaltyPoints(pointsEarned);

        const primarySeat = selectedSeats[0];
        const qrData = { tripId: tripId, bus: selectedBus.plate, seat: primarySeat, from: stop.name, to: selectedBus.finalDestination.name, fare: totalFare / selectedSeats.length, timestamp: new Date().toISOString() };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        const newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`;
        setQrCodeUrl(newQrCodeUrl);
        
        if (bookingAlerts) {
            let toastDescription = t('fareDeductedToastDescription', { fare: totalFare.toFixed(2) });
            if (activeDiscount) { toastDescription += ` (${t('discountAppliedToast', { percentage: activeDiscount.percentage })})` }

            toast({
                title: t('seatBookedToastTitle'),
                description: toastDescription,
                action: (<Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}><QrCode className="mr-2 h-4 w-4" />{t('viewQrCode')}</Button>)
            });

            // ... other notifications
        }

    } catch (error) {
        console.error("Error creating trip:", error);
        toast({ variant: 'destructive', title: "Booking Failed", description: "Could not create your trip. Please try again."});
    } finally {
        setIsBoarding(false);
    }
  }

   const handleCancelTrip = () => {
    if (!activeTrip) return;

    const tripId = activeTrip.id;

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

    // 2. Clear trip state
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

    // 5. Remove any related notifications
    setNotifications(prev => prev.filter(n => n.tripId !== tripId));
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
  
  const handleRatingSubmit = () => {
    setTripToRate(null);
    toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve our service!",
    });
  }

  const displayedBus = activeTrip?.bus || selectedBus;
  const primarySeat = (activeTrip?.seats && activeTrip.seats.length > 0) ? activeTrip.seats[0] : (Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats[0] : null);

  const allStops = displayedBus ? [...displayedBus.stops, displayedBus.finalDestination] : [];
  const nextStop = (activeTrip && activeTrip.currentStopIndex >= 0 && activeTrip.currentStopIndex < allStops.length)
      ? allStops[activeTrip.currentStopIndex]
      : null;


  if (isUserLoading || isLoadingBuses) {
      return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

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
    <div className="relative flex flex-col min-h-screen w-full bg-background font-sans overflow-hidden">
        <div className="flex-grow h-full w-full">
            <Map />
            <div className="absolute inset-0 bg-background/20 pointer-events-none" />
        </div>
      

      <header className="absolute top-0 left-0 right-0 py-2 px-4 flex justify-between items-center z-20">
        <Image
            src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
            alt="Eritas Transport Company Logo"
            width={120}
            height={60}
            priority
            className="object-contain"
        />
        <div className="flex items-center gap-2">
            <ProfileSidebar />
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
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isLowBalance ? "bg-destructive" : "bg-primary")}></span>
                                <span className={cn("relative inline-flex rounded-full h-4 w-4 text-primary-foreground text-xs items-center justify-center", isLowBalance ? "bg-destructive" : "bg-primary")}>
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
                                <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar">
                                    {notifications.map(notification => (
                                        <Card key={notification.id} className={cn(notification.id === -1 && "bg-destructive/10 border-destructive")}>
                                            <CardContent className='p-4 space-y-2'>
                                                <h3 className="font-semibold">{notification.title}</h3>
                                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                {notification.action && <div className='pt-2'>{notification.action}</div>}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="mt-4">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('clearAll')}
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>{t('clearNotificationsTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('clearNotificationsDescription')}
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => setNotifications(isLowBalance ? notifications.filter(n => n.id === -1) : [])}
                                        >
                                            {t('confirmClear')}
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
      
       {buses && buses.map((bus, index) => (
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

      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-[80px]">
        <div className="p-2 sm:p-4 pointer-events-auto">
            <div className="bg-background/75 backdrop-blur-sm rounded-t-2xl max-w-md mx-auto p-4 flex flex-col gap-4 shadow-lg">
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
                {tripToRate ? (
                     <TripRating trip={tripToRate} onSubmit={handleRatingSubmit} />
                ) : displayedBus && isTripHydrated ? (
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
                    <div className={cn("relative p-3 bg-primary/10 rounded-lg text-center")}>
                            <div className={cn("transition-opacity duration-500")}>
                                <p className='text-sm text-primary/80'>
                                {isOnBus ? (
                                    <>
                                        {nextStop ? `${t('nextStop')}: ${nextStop.name}` : `${t('arrivingAt')}`}
                                    </>
                                ) : (
                                    `${t('busArrivingAtYourLocation')}:`
                                )}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
                                    <Clock className="h-5 w-5" />
                                    {activeTrip.eta > 0 ? (
                                        <span dangerouslySetInnerHTML={{ __html: t('arrivingIn', { minutes: activeTrip.eta }) }} />
                                    ) : (
                                        <span>{isOnBus ? t('youHaveArrived') : t('busHasArrived')}</span>
                                    )}
                                </div>
                                {isOnBus && <p className='text-xs text-primary/60 mt-1'>{`${t('finalDestination')}: ${activeTrip.destination}`}</p>}
                            </div>
                        </div>
                    ) : passedBusInfo ? (
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
                                        ): passedBusInfo ? (
                                            <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">This bus has passed. Please use the option above.</p>
                                        ) : displayedBus.capacity.current + selectedSeats.length > displayedBus.capacity.max ? (
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
                        <h2 className="text-xl font-bold text-foreground">{t('homeGreeting', { name: user?.displayName?.split(' ')[0] || t('friend') })}</h2>
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
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10">
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
                           {primarySeat && <Badge>{t('seat')}: {primarySeat}</Badge>}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}
