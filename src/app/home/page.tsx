
'use client';

import Image from 'next/image';
import {
  ArrowRight,
  BusFront,
  Menu,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/bottom-nav';
import { useState } from 'react';

export default function HomePage() {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-route');
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('name') || 'there';
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };


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
        <Card className="flex items-center shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className='bg-primary text-primary-foreground p-3'>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs -mt-1">min</p>
            </div>
            <div className='p-3'>
                <p className='font-semibold text-gray-800'>Paragon Way</p>
            </div>
        </Card>
      </div>

       {/* Bus Icon */}
        <div className="absolute bottom-[45%] left-1/4 z-10 animate-float">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 44C24 44 32 36 32 26C32 17.1634 28.4183 10 24 10C19.5817 10 16 17.1634 16 26C16 36 24 44 24 44Z" fill="#16a34a" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
                <path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="white"/>
            </svg>
        </div>


      {/* Bottom Sheet - Search and Nav */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
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
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
