
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Home, Briefcase, MapPin } from 'lucide-react';

export type Place = {
  id: string;
  name: string;
  address: string;
  icon: 'Home' | 'Briefcase' | 'MapPin' | string;
};

type SavedPlacesContextType = {
  places: Place[];
  addPlace: (place: Omit<Place, 'id'>) => void;
  removePlace: (placeId: string) => void;
  updatePlace: (placeId: string, newPlaceData: Omit<Place, 'id'>) => void;
  isHydrated: boolean;
};

const SavedPlacesContext = createContext<SavedPlacesContextType | undefined>(undefined);

const initialSavedPlaces: Place[] = [
    { id: '1', name: 'Home', address: '123 Adenta Street, Accra', icon: 'Home' },
    { id: '2', name: 'Work', address: '456 Circle Avenue, Accra', icon: 'Briefcase' },
];


export function SavedPlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            setPlaces(JSON.parse(storedPlaces));
        } else {
            setPlaces(initialSavedPlaces);
            localStorage.setItem('savedPlaces', JSON.stringify(initialSavedPlaces));
        }
    } catch (error) {
        console.error("Failed to load places from localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  const updateLocalStorage = (newPlaces: Place[]) => {
      try {
          localStorage.setItem('savedPlaces', JSON.stringify(newPlaces));
      } catch (error) {
          console.error("Failed to save places to localStorage", error);
      }
  };

  const addPlace = useCallback((place: Omit<Place, 'id'>) => {
    setPlaces(prev => {
        const newPlace = { ...place, id: uuidv4() };
        const newPlaces = [...prev, newPlace];
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const removePlace = useCallback((placeId: string) => {
    setPlaces(prev => {
        const newPlaces = prev.filter(p => p.id !== placeId);
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const updatePlace = useCallback((placeId: string, newPlaceData: Omit<Place, 'id'>) => {
    setPlaces(prev => {
        const newPlaces = prev.map(p => p.id === placeId ? { ...newPlaceData, id: placeId } : p);
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const value = { places, addPlace, removePlace, updatePlace, isHydrated };

  return (
    <SavedPlacesContext.Provider value={value}>
      {children}
    </SavedPlacesContext.Provider>
  );
}

export function useSavedPlaces() {
  const context = useContext(SavedPlacesContext);
  if (context === undefined) {
    throw new Error('useSavedPlaces must be used within a SavedPlacesProvider');
  }
  return context;
}
