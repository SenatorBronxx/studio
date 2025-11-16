
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
    handleGoogleSignIn: () => Promise<User | null>;
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
    
    const handleGoogleSignIn = useCallback(async () => {
        if (!auth) {
            throw new Error("Firebase Auth is not initialized.");
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            // Let the calling component handle UI updates
            throw error;
        }
    }, [auth]);

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
