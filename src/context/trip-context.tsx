
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useUserPreferences } from './user-preferences-context';

type BusData = {
    id: string;
    driver: string;
    plate: string;
    driverImage?: string;
    seating: ({ id: string; isOccupied: boolean; } | null)[];
    capacity: { current: number, max: number };
    stops: { name: string; fare: number; eta: number; }[];
    finalDestination: { name: string; fare: number; eta: number; };
    eta: number;
};

export type ActiveTrip = {
    id: string;
    bus: BusData;
    from: string;
    destination: string;
    eta: number;
    seats: string[];
    destinationEta: number;
    currentStopIndex: number;
};

type TripContextType = {
    activeTrip: ActiveTrip | null;
    setActiveTrip: (trip: ActiveTrip | null) => void;
    clearActiveTrip: () => void;
    setDynamicEta: (eta: number) => void;
    updateActiveTripBus: (bus: BusData) => void;
    isHydrated: boolean;
    setCurrentStopIndex: (index: number) => void;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
    const { preferences, setPreference, isHydrated } = useUserPreferences();
    const activeTrip = preferences?.activeTrip || null;

    const setActiveTrip = useCallback((trip: ActiveTrip | null) => {
        setPreference('activeTrip', trip);
    }, [setPreference]);

    const clearActiveTrip = useCallback(() => {
        setActiveTrip(null);
    }, [setActiveTrip]);

    const setDynamicEta = useCallback((eta: number) => {
        if (!activeTrip) return;
        const updatedTrip = { ...activeTrip, eta: Math.max(0, eta) };
        setPreference('activeTrip', updatedTrip);
    }, [activeTrip, setPreference]);

    const setCurrentStopIndex = useCallback((index: number) => {
        if (!activeTrip) return null;
        const updatedTrip = { ...activeTrip, currentStopIndex: index };
        setPreference('activeTrip', updatedTrip);
    }, [activeTrip, setPreference]);
    
    const updateActiveTripBus = useCallback((bus: BusData) => {
        if (!activeTrip) return null;
        const updatedTrip = { ...activeTrip, bus };
        setPreference('activeTrip', updatedTrip);
    }, [activeTrip, setPreference]);

    const value = {
        activeTrip,
        setActiveTrip,
        clearActiveTrip,
        setDynamicEta,
        updateActiveTripBus,
        isHydrated,
        setCurrentStopIndex
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
