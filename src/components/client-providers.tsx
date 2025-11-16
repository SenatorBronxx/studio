
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { DiscountProvider } from "@/context/discount-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { PlacesProvider } from "@/context/places-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    
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
        <LanguageProvider>
            <UserProvider clearAllData={clearAllData}>
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
    );
}

export function useAppState() {
    // This is a placeholder. In a real app, you might have a shared state context here.
    const clearAllData = () => {
        console.log('Clearing all user-specific data from localStorage...');
        const language = localStorage.getItem('eritas-language');
        const theme = localStorage.getItem('eritas-theme');
        
        localStorage.clear();

        if (language) localStorage.setItem('eritas-language', language);
        if (theme) localStorage.setItem('eritas-theme', theme);
        
        window.location.assign('/');
    };
    
    return { clearAllData };
}
