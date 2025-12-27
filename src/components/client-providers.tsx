
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { SavedSongsProvider } from "@/context/saved-songs-context";
import { UserProvider } from "@/context/user-context";
import { UserPreferencesProvider } from "@/context/user-preferences-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <UserPreferencesProvider>
                <LanguageProvider>
                    <WalletProvider>
                        <TripProvider>
                            <SavedSongsProvider>
                                {children}
                            </SavedSongsProvider>
                        </TripProvider>
                    </WalletProvider>
                </LanguageProvider>
            </UserPreferencesProvider>
        </UserProvider>
    );
}

