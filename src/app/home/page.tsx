
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/bottom-nav';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BusSeatingChart } from '@/components/bus-seating-chart';

const mockBusData = [
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

type BusData = typeof mockBusData[0];

export default function HomePage() {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-route');
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('name') || 'there';
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [boardedStop, setBoardedStop] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    setSelectedBus(bus);
    setBoardedStop(null); // Reset boarded stop when a new bus is selected
    setSelectedSeat(null); // Reset selected seat
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setBoardedStop(null);
    setSelectedSeat(null);
  }

  const handleBoard = (stopName: string) => {
    setIsBoarding(true);
    // Simulate API call
    setTimeout(() => {
        setIsBoarding(false);
        setBoardedStop(stopName);
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
        {mapImage && (
          <Image
            alt={mapImage.description}
            src={mapImage.imageUrl}
            data-ai-hint={mapImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-background/20" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <ProfileSidebar />
      </header>
      
       {/* Bus Icon Stickers */}
        {mockBusData.map((bus, index) => (
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
                                        <span>Arriving in <strong>{selectedBus.eta} min</strong></span>
                                    </div>
                                ) : selectedBus.capacity.current < selectedBus.capacity.max ? (
                                    <Button 
                                        className='w-full' 
                                        onClick={() => handleBoard(stop.name)} 
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
    </div>
  );
}

    
