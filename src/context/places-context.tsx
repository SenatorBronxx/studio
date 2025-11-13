
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';

export type SavedPlace = {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
};

// This allows creating a place without an ID, which will be generated.
export type NewSavedPlace = Partial<Omit<SavedPlace, 'id'>> & Pick<SavedPlace, 'type'>;


type PlacesContextType = {
  places: SavedPlace[];
  addOrUpdatePlace: (place: NewSavedPlace | SavedPlace) => void;
  removePlace: (id: string) => void;
  isHydrated: boolean;
};

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedPlaces = localStorage.getItem('eritas-saved-places');
      if (storedPlaces) {
        setPlaces(JSON.parse(storedPlaces));
      }
    } catch (error) {
      console.error("Failed to read saved places from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-saved-places', JSON.stringify(places));
      } catch (error) {
        console.error("Failed to write saved places to localStorage", error);
      }
    }
  }, [places, isHydrated]);

  const addOrUpdatePlace = useCallback((place: NewSavedPlace | SavedPlace) => {
    setPlaces(prevPlaces => {
      // If it's a pre-defined type (home/work), we update or add it.
      if (place.type === 'home' || place.type === 'work') {
        const existingIndex = prevPlaces.findIndex(p => p.type === place.type);
        if (existingIndex > -1) {
            // Update existing home/work
            const newPlaces = [...prevPlaces];
            newPlaces[existingIndex] = { ...newPlaces[existingIndex], ...place };
            return newPlaces;
        }
      }
      
      // If it's a place with an ID, it's an update.
      if ('id' in place && place.id) {
        const existingIndex = prevPlaces.findIndex(p => p.id === place.id);
        if (existingIndex > -1) {
          const newPlaces = [...prevPlaces];
          newPlaces[existingIndex] = { ...newPlaces[existingIndex], ...place };
          return newPlaces;
        }
      }
      
      // Otherwise, it's a new place to add.
      return [...prevPlaces, { ...place, id: uuidv4() } as SavedPlace];
    });

    toast({
        title: t('placeSaved'),
        description: t('addressSavedSuccessfully'),
    });

  }, [t, toast]);

  const removePlace = useCallback((id: string) => {
    setPlaces(prevPlaces => prevPlaces.filter(p => p.id !== id));
    toast({
        title: t('placeRemoved'),
    });
  }, [t, toast]);

  const value = { places, addOrUpdatePlace, removePlace, isHydrated };

  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}
