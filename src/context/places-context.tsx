
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { useUserPreferences } from './user-preferences-context';

export type SavedPlace = {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
};

export type NewSavedPlace = Partial<Omit<SavedPlace, 'id'>> & Pick<SavedPlace, 'type'>;


type PlacesContextType = {
  places: SavedPlace[];
  addOrUpdatePlace: (place: NewSavedPlace | SavedPlace) => void;
  removePlace: (id: string) => void;
  isHydrated: boolean;
};

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();
  const { toast } = useToast();
  const { t } = useLanguage();

  const places = preferences?.savedPlaces ?? [];

  const addOrUpdatePlace = useCallback((place: NewSavedPlace | SavedPlace) => {
    const currentPlaces = preferences?.savedPlaces ?? [];
    let newPlaces: SavedPlace[];

    if ('id' in place && place.id) { // Update existing
      const existingIndex = currentPlaces.findIndex(p => p.id === place.id);
      if (existingIndex > -1) {
        newPlaces = [...currentPlaces];
        newPlaces[existingIndex] = { ...newPlaces[existingIndex], ...place } as SavedPlace;
      } else {
        newPlaces = [...currentPlaces, { ...place, id: place.id } as SavedPlace];
      }
    } else { // Add new
        newPlaces = [...currentPlaces, { ...place, id: uuidv4() } as SavedPlace];
    }
    
    setPreference('savedPlaces', newPlaces);

    toast({
        title: t('placeSaved'),
        description: t('addressSavedSuccessfully'),
    });

  }, [preferences?.savedPlaces, setPreference, t, toast]);

  const removePlace = useCallback((id: string) => {
    const currentPlaces = preferences?.savedPlaces ?? [];
    const newPlaces = currentPlaces.filter(p => p.id !== id);
    setPreference('savedPlaces', newPlaces);
    toast({
        title: t('placeRemoved'),
    });
  }, [preferences?.savedPlaces, setPreference, t, toast]);

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
