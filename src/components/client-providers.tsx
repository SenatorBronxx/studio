
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { DiscountProvider } from "@/context/discount-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode, createContext, useContext, useCallback } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { PlacesProvider } from "@/context/places-context";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";


type AppStateContextType = {
    clearAllData: () => void;
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within ClientProviders');
    }
    return context;
}

export function ClientProviders({ children }: { children: ReactNode }) {
    const auth = useAuth();
    
    const clearAllData = () => {
        console.log('Clearing all user-specific data from localStorage...');
        const language = localStorage.getItem('eritas-language');
        const theme = localStorage.getItem('eritas-theme');
        
        localStorage.clear();

        if (language) localStorage.setItem('eritas-language', language);
        if (theme) localStorage.setItem('eritas-theme', theme);
        
        window.location.assign('/');
    };

    return (
        <AppStateContext.Provider value={{ clearAllData }}>
            <LanguageProvider>
                <UserProvider>
                    <WalletProvider>
                        <TripProvider>
                            <MusicProvider>
                                <NotificationSettingsProvider>
                                    <SecuritySettingsProvider>
                                        <DiscountProvider>
                                            <PlacesProvider>
                                                {children}
                                            </PlacesProvider>
                                        </DiscountProvider>
                                    </SecuritySettingsProvider>
                                </NotificationSettingsProvider>
                            </MusicProvider>
                        </TripProvider>
                    </WalletProvider>
                </UserProvider>
            </LanguageProvider>
        </AppStateContext.Provider>
    );
}
