
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { DiscountProvider } from "@/context/discount-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode, createContext, useContext } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { PlacesProvider } from "@/context/places-context";

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
    
    const clearAllData = () => {
        console.log('Clearing all user-specific data from localStorage...');
        // This function iterates over all keys in localStorage and removes the ones
        // specific to this application's user data, while preserving settings
        // like theme or language.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('eritas-') && key !== 'eritas-language' && key !== 'eritas-theme') {
                localStorage.removeItem(key);
            }
        });
        // We reload the window to ensure all contexts and states are reset cleanly.
        window.location.reload();
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
