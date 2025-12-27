
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { SavedSongsProvider } from "@/context/saved-songs-context";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <WalletProvider>
                <TripProvider>
                    <SavedSongsProvider>
                        {children}
                    </SavedSongsProvider>
                </TripProvider>
            </WalletProvider>
        </LanguageProvider>
    );
}
