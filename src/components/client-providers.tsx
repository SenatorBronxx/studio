
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
import { Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';

type AppStateContextType = {
    clearAllData: () => void;
    handleGoogleSignIn: () => Promise<any>;
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

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Google sign-in error:", error);
            return null;
        }
    };

    return (
        <AppStateContext.Provider value={{ clearAllData, handleGoogleSignIn }}>
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
