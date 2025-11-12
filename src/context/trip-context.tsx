
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

type BusData = {
    id: string;
    driver: string;
    plate: string;
    driverImage?: string;
    // Add other relevant bus properties
    seating: ({ id: string; isOccupied: boolean; } | null)[];
    capacity: { current: number, max: number };
    stops: { name: string; fare: number; }[];
    finalDestination: { name: string; fare: number; };
};

export type ActiveTrip = {
    bus: BusData;
    from: string;
    destination: string;
    eta: number;
    seat: string | null;
};

type TripContextType = {
    activeTrip: ActiveTrip | null;
    setActiveTrip: (trip: ActiveTrip | null) => void;
    clearActiveTrip: () => void;
    setDynamicEta: (eta: number) => void;
    updateActiveTripBus: (bus: BusData) => void;
    isHydrated: boolean;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
    const [activeTrip, setActiveTripState] = useState<ActiveTrip | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedTrip = localStorage.getItem('eritas-active-trip');
            if (storedTrip) {
                const parsedTrip = JSON.parse(storedTrip);
                // Basic validation
                if (parsedTrip && parsedTrip.bus && parsedTrip.destination) {
                    setActiveTripState(parsedTrip);
                }
            }
        } catch (error) {
            console.error("Failed to read active trip from localStorage", error);
        }
        setIsHydrated(true);
    }, []);

    const setActiveTrip = useCallback((trip: ActiveTrip | null) => {
        setActiveTripState(trip);
        try {
            if (trip) {
                localStorage.setItem('eritas-active-trip', JSON.stringify(trip));
            } else {
                localStorage.removeItem('eritas-active-trip');
            }
        } catch (error) {
            console.error("Failed to write active trip to localStorage", error);
        }
    }, []);

    const clearActiveTrip = useCallback(() => {
        setActiveTrip(null);
    }, [setActiveTrip]);

    const setDynamicEta = useCallback((eta: number) => {
        setActiveTripState(prevTrip => {
            if (!prevTrip) return null;
            const updatedTrip = { ...prevTrip, eta: Math.max(0, eta) };
            try {
                localStorage.setItem('eritas-active-trip', JSON.stringify(updatedTrip));
            } catch (error) {
                console.error("Failed to write active trip to localStorage", error);
            }
            return updatedTrip;
        });
    }, []);
    
    const updateActiveTripBus = useCallback((bus: BusData) => {
        setActiveTripState(prevTrip => {
            if (!prevTrip) return null;
            const updatedTrip = { ...prevTrip, bus };
            try {
                localStorage.setItem('eritas-active-trip', JSON.stringify(updatedTrip));
            } catch (error) {
                console.error("Failed to write active trip to localStorage", error);
            }
            return updatedTrip;
        });
    }, []);

    const value = {
        activeTrip,
        setActiveTrip,
        clearActiveTrip,
        setDynamicEta,
        updateActiveTripBus,
        isHydrated
    };
    
    if (!isHydrated) {
        return null;
    }

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
