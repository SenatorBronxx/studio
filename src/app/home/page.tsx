
'use client';

import Image from 'next/image';
import {
  ArrowLeft,
  Bus,
  Clock,
  MapPin,
  Search,
  Settings2,
  Star,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'accra-map');
  const suggestions = [
    {
      name: 'National Museum',
      icon: <MapPin className="text-green-500" />,
      distance: '5km',
    },
    {
      name: 'Labadi Beach',
      icon: <MapPin className="text-green-500" />,
      distance: '12km',
    },
    {
      name: 'W.E.B. Du Bois Centre',
      icon: <MapPin className="text-green-500" />,
      distance: '8km',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-background font-sans">
      {/* Map Background */}
      <div className="absolute inset-0">
        {mapImage && (
          <Image
            alt={mapImage.description}
            src={mapImage.imageUrl}
            data-ai-hint={mapImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full hover:bg-white">
          <User className="h-5 w-5 text-gray-700" />
        </Button>
        <Image
            src="/eritas-logo.png"
            alt="Eritas Transport Company Logo"
            width={120}
            height={40}
          />
        <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full hover:bg-white">
          <Settings2 className="h-5 w-5 text-gray-700" />
        </Button>
      </header>
      
      {/* Moving buses */}
      <Bus className="absolute top-1/4 left-0 h-10 w-10 text-white/80 drop-shadow-lg animate-bus-move" style={{ animationDelay: '0s', animationDuration: '20s' }} />
      <Bus className="absolute top-1/2 left-0 h-8 w-8 text-white/80 drop-shadow-lg animate-bus-move" style={{ animationDelay: '5s', animationDuration: '25s' }} />
      <Bus className="absolute top-1/3 left-0 h-9 w-9 text-white/80 drop-shadow-lg animate-bus-move" style={{ animationDelay: '10s', animationDuration: '18s' }} />


      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-4 max-w-md mx-auto flex flex-col gap-4 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Jane!</h1>
            <p className="text-gray-600">Where are you heading today?</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search for a bus or destination..."
              className="pl-10 bg-white/50 border-gray-300 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Suggestions</h3>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((item) => (
                <button
                  key={item.name}
                  className="w-full text-left p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all flex items-center gap-3"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.distance}</p>
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
