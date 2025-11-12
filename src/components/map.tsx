
'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map as GoogleMap, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

type Position = {
  lat: number;
  lng: number;
};

function MapComponent() {
  const [position, setPosition] = useState<Position | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Check if the maps library loaded correctly
  const coreLib = useMapsLibrary('core');
  useEffect(() => {
    if (!coreLib) {
      setMapError(t('mapLoadError'));
    } else {
      setMapError(null);
    }
  }, [coreLib, t]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to a location in Accra if permission is denied
          setPosition({ lat: 5.6037, lng: -0.1870 });
        }
      );
    } else {
      // Default to a location in Accra if geolocation is not supported
      setPosition({ lat: 5.6037, lng: -0.1870 });
    }
  }, []);

  if (mapError) {
    return (
       <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-destructive-foreground p-4 text-center bg-destructive rounded-md max-w-sm">
            <h3 className="font-bold mb-2">{t('mapErrorTitle')}</h3>
            <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">{t('findingYourLocation')}</p>
      </div>
    );
  }

  return (
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
  );
}


export function Map() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const { t } = useLanguage();

  if (!API_KEY) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-destructive-foreground p-4 text-center bg-destructive rounded-md">
            <h3 className="font-bold mb-2">{t('mapConfigErrorTitle')}</h3>
            <p className="text-sm">{t('mapConfigErrorDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
        <MapComponent />
    </APIProvider>
  );
}
