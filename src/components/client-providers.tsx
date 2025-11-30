
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
import { SavedSongsProvider } from "@/context/saved-songs-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <UserProvider>
                <WalletProvider>
                    <TripProvider>
                        <SavedSongsProvider>
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
                        </SavedSongsProvider>
                    </TripProvider>
                </WalletProvider>
            </UserProvider>
        </LanguageProvider>
    );
}
