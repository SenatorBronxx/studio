
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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
  const [activeDiscount, setActiveDiscount] = useState<Discount | null>(null);
  const [isDiscountBannerDismissed, setIsDiscountBannerDismissed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedDiscount = localStorage.getItem('eritas-active-discount');
      if (storedDiscount) {
        setActiveDiscount(JSON.parse(storedDiscount));
      }
      const storedDismissed = localStorage.getItem('eritas-discount-banner-dismissed');
      if (storedDismissed) {
        setIsDiscountBannerDismissed(JSON.parse(storedDismissed));
      }
    } catch (error) {
      console.error("Failed to read discount state from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const activateDiscount = useCallback((discount: Discount) => {
    setActiveDiscount(discount);
    setIsDiscountBannerDismissed(false); // Show banner when a new discount is activated
    try {
      localStorage.setItem('eritas-active-discount', JSON.stringify(discount));
      localStorage.setItem('eritas-discount-banner-dismissed', JSON.stringify(false));
    } catch (error) {
      console.error("Failed to write discount state to localStorage", error);
    }
  }, []);

  const deactivateDiscount = useCallback(() => {
    setActiveDiscount(null);
    setIsDiscountBannerDismissed(true); // Hide banner when deactivated
    try {
        localStorage.removeItem('eritas-active-discount');
        localStorage.setItem('eritas-discount-banner-dismissed', JSON.stringify(true));
    } catch (error) {
        console.error("Failed to write discount state to localStorage", error);
    }
  }, []);

  const dismissDiscountBanner = useCallback(() => {
    setIsDiscountBannerDismissed(true);
    try {
      localStorage.setItem('eritas-discount-banner-dismissed', JSON.stringify(true));
    } catch (error) {
        console.error("Failed to write discount state to localStorage", error);
    }
  }, []);

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
