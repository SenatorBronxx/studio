
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// This mirrors the BusData type but is defined here to avoid circular dependencies.
type BusInfo = {
  id: string;
  driver: string;
  plate: string;
  eta: number;
  capacity: { current: number; max: number; };
  stops: { name: string; fare: number; eta: number; }[];
  finalDestination: { name: string; fare: number; eta: number; };
  driverImage?: string;
};

export type ActiveTrip = {
    bus: BusInfo;
    boardingStop: { name: string; fare: number; eta: number; };
    seats: string[];
    tripId: string;
};

type TripStatus = 'idle' | 'en_route_to_pickup' | 'bus_arrived' | 'en_route_to_destination' | 'trip_ended' | 'rating';

type TripContextType = {
  activeTrip: ActiveTrip | null;
  tripStatus: TripStatus;
  currentEta: number;
  startTrip: (trip: ActiveTrip) => void;
  endTrip: () => void;
  submitRating: () => void;
  cancelTrip: () => { fare: number, seats: number };
  setTripStatus: (status: TripStatus) => void;
  isHydrated: boolean;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [currentEta, setCurrentEta] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedTrip = localStorage.getItem('activeTrip');
      const storedStatus = localStorage.getItem('tripStatus') as TripStatus;
      const storedEta = localStorage.getItem('currentEta');

      if (storedTrip) setActiveTrip(JSON.parse(storedTrip));
      if (storedStatus) setTripStatus(storedStatus);
      if (storedEta) setCurrentEta(JSON.parse(storedEta));

    } catch (error) {
        console.error("Failed to load trip data from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return; // Don't save initial unhydrated state
    try {
        if (activeTrip) localStorage.setItem('activeTrip', JSON.stringify(activeTrip));
        else localStorage.removeItem('activeTrip');
        
        localStorage.setItem('tripStatus', tripStatus);
        localStorage.setItem('currentEta', JSON.stringify(currentEta));
    } catch (error) {
        console.error("Failed to save trip data to localStorage", error);
    }
  }, [activeTrip, tripStatus, currentEta, isHydrated]);


  const startTrip = useCallback((trip: ActiveTrip) => {
    setActiveTrip(trip);
    setTripStatus('en_route_to_pickup');
    setCurrentEta(trip.boardingStop.eta);
  }, []);

  const endTrip = useCallback(() => {
    setTripStatus('rating');
  }, []);

  const submitRating = useCallback(() => {
    setActiveTrip(null);
    setTripStatus('idle');
    setCurrentEta(0);
  }, []);

  const cancelTrip = useCallback(() => {
    if (!activeTrip) return { fare: 0, seats: 0 };
    const fareToRefund = activeTrip.boardingStop.fare * activeTrip.seats.length;
    const seatsFreed = activeTrip.seats.length;
    
    setActiveTrip(null);
    setTripStatus('idle');
    setCurrentEta(0);
    
    return { fare: fareToRefund, seats: seatsFreed };

  }, [activeTrip]);

  // Simulate ETA countdown
  useEffect(() => {
    if ((tripStatus === 'en_route_to_pickup' || tripStatus === 'en_route_to_destination') && currentEta > 0) {
      const timer = setInterval(() => {
        setCurrentEta(prevEta => {
          const newEta = prevEta - 1;
          if (newEta <= 0) {
            if (tripStatus === 'en_route_to_pickup') {
              setTripStatus('bus_arrived');
            } else if (tripStatus === 'en_route_to_destination') {
              setTripStatus('trip_ended');
            }
            clearInterval(timer);
            return 0;
          }
          return newEta;
        });
      }, 60 * 1000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [tripStatus, currentEta]);

  // Transition from 'bus_arrived' to 'en_route_to_destination'
  useEffect(() => {
    if (tripStatus === 'bus_arrived' && activeTrip) {
      // Simulate boarding time
      const timer = setTimeout(() => {
        setTripStatus('en_route_to_destination');
        setCurrentEta(activeTrip.bus.finalDestination.eta - activeTrip.boardingStop.eta);
      }, 10 * 1000); // 10-second boarding time
      return () => clearTimeout(timer);
    }
  }, [tripStatus, activeTrip]);

  // Transition from 'trip_ended' to 'rating'
  useEffect(() => {
      if (tripStatus === 'trip_ended') {
          const timer = setTimeout(() => {
              setTripStatus('rating');
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [tripStatus]);

  const value = {
    activeTrip,
    tripStatus,
    currentEta,
    startTrip,
    endTrip,
    submitRating,
    cancelTrip,
    setTripStatus,
    isHydrated,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
