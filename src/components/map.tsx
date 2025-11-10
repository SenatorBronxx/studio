
'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';

type Position = {
  lat: number;
  lng: number;
};

export function Map() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
          // Default to a location in Accra if permission is denied
          setPosition({ lat: 5.6037, lng: -0.1870 });
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      // Default to a location in Accra if geolocation is not supported
      setPosition({ lat: 5.6037, lng: -0.1870 });
    }
  }, []);

  if (!API_KEY) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-destructive-foreground p-4 text-center bg-destructive rounded-md">
          Google Maps API Key is missing.
        </p>
      </div>
    );
  }

  if (error) {
    // You could show an error message, but for a better user experience,
    // we'll just show the map centered on Accra.
    console.error(error);
  }

  if (!position) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Finding your location...</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <GoogleMap
        defaultCenter={position}
        defaultZoom={15}
        mapId="eritas-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className='w-full h-full'
      >
        <Marker position={position} />
      </GoogleMap>
    </APIProvider>
  );
}
