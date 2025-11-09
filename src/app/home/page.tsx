
'use client';

import Image from 'next/image';
import {
  ArrowRight,
  BusFront,
  MapPin,
  Menu,
  Search,
  X,
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

const mockBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 15,
      stops: ['Adenta', 'Madina', 'Atomic Junction'],
      position: { top: '45%', left: '25%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
    },
    {
      id: 'bus-2',
      driver: 'Ama Serwaa',
      plate: 'AS 1234-24',
      eta: 25,
      stops: ['Circle', 'Kaneshie', 'Mallam'],
      position: { top: '55%', left: '65%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
    },
];

export default function HomePage() {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-route');
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('name') || 'there';
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedBus, setSelectedBus] = useState<typeof mockBusData[0] | null>(null);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: typeof mockBusData[0]) => {
    setSelectedBus(bus);
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
  }


  return (
    <div className="relative min-h-screen w-full bg-gray-100 font-sans">
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
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <Button variant="default" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-800">
          <Menu className="h-5 w-5" />
        </Button>
      </header>
      
      {/* ETA Popup */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-10">
        <Card className="flex items-center shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden animate-pop-in">
            <div className='bg-primary text-primary-foreground p-3'>
                <p className="text-2xl font-bold">{selectedBus ? selectedBus.eta : '15'}</p>
                <p className="text-xs -mt-1">min</p>
            </div>
            <div className='p-3'>
                <p className='font-semibold text-gray-800'>Paragon Way</p>
            </div>
        </Card>
      </div>

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
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
            {selectedBus ? (
              <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            {selectedBus.driverImage && <AvatarImage src={selectedBus.driverImage} alt={selectedBus.driver} />}
                            <AvatarFallback>{selectedBus.driver.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedBus.driver}</h2>
                            <p className="text-sm text-gray-500 font-mono">{selectedBus.plate}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                 <Separator className="my-3" />
                 <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Stops:</h3>
                    <div className="flex flex-col gap-2">
                        {selectedBus.stops.map((stop, index) => (
                             <div key={index} className="flex items-center gap-3">
                                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                                    <MapPin className="h-3 w-3 text-primary" />
                                </div>
                                <p className="text-gray-600">{stop}</p>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            ) : (
            <>
                <div className='text-center'>
                    <h2 className="text-xl font-bold text-gray-800">Hi {userName}, ready for your next trip?</h2>
                    <p className="text-sm text-gray-500">Find the perfect bus for your journey</p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                        placeholder='From' 
                        className='pl-10' 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        />
                    </div>
                    <div className="p-2 rounded-full bg-gray-100">
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
