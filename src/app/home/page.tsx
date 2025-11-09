
'use client';

import Image from 'next/image';
import {
  ChevronRight,
  Menu,
  Share2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-route');
  const avatarImage = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'there';

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
        <Button variant="default" size="icon" className="bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-800">
          <Menu className="h-5 w-5" />
        </Button>
      </header>
      
      {/* ETA Popup */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-10">
        <Card className="flex items-center shadow-lg">
            <div className='bg-primary text-primary-foreground p-3 rounded-l-lg'>
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
                <path d="M24 44C24 44 32 36 32 26C32 17.1634 28.4183 10 24 10C19.5817 10 16 17.1634 16 26C16 36 24 44 24 44Z" fill="#16a34a" stroke="white" stroke-width="3" stroke-linejoin="round"/>
                <path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="white"/>
            </svg>
        </div>


      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-4">
        <div className="bg-white rounded-t-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Riding to destination</h2>
                <p className="text-sm text-gray-500 hover:underline cursor-pointer">View ride details</p>
              </div>
              <div className='flex flex-col items-center gap-1'>
                 {avatarImage && (
                    <Avatar>
                        <AvatarImage src={avatarImage.imageUrl} alt={avatarImage.description} data-ai-hint={avatarImage.imageHint} />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <Badge variant="default" className="bg-primary/20 text-primary border-0 text-xs">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                    4.8
                </Badge>
              </div>
            </div>
          
            <button className="w-full text-left p-4 bg-green-500 hover:bg-green-600 rounded-xl transition-all flex items-center gap-4 text-white">
                <div className="bg-white/20 p-3 rounded-full">
                    <Share2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <p className="font-bold">Share your ETA</p>
                    <p className="text-sm opacity-90">Share your ride details to friends!</p>
                </div>
                <ChevronRight className="h-6 w-6 opacity-70" />
            </button>
        </div>
      </div>
    </div>
  );
}
