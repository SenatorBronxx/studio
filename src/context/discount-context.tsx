
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useUserPreferences } from './user-preferences-context';

type Discount = {
  code: string;
  percentage: number;
  description: string;
};

type DiscountContextType = {
  activeDiscount: Discount | null;
  activateDiscount: (discount: Discount) => void;
  deactivateDiscount: () => void;
  isDiscountBannerDismissed: boolean;
  dismissDiscountBanner: () => void;
  isHydrated: boolean;
};

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export function DiscountProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();
  
  const activeDiscount = preferences?.activeDiscount ?? null;
  const isDiscountBannerDismissed = preferences?.isDiscountBannerDismissed ?? false;

  const activateDiscount = useCallback((discount: Discount) => {
    setPreference('activeDiscount', discount);
    setPreference('isDiscountBannerDismissed', false);
  }, [setPreference]);

  const deactivateDiscount = useCallback(() => {
    setPreference('activeDiscount', null);
    setPreference('isDiscountBannerDismissed', true);
  }, [setPreference]);

  const dismissDiscountBanner = useCallback(() => {
    setPreference('isDiscountBannerDismissed', true);
  }, [setPreference]);

  const value = {
    activeDiscount,
    activateDiscount,
    deactivateDiscount,
    isDiscountBannerDismissed,
    dismissDiscountBanner,
    isHydrated
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
}

export function useDiscount() {
  const context = useContext(DiscountContext);
  if (context === undefined) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return context;
}
