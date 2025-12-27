
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { SavedSongsProvider } from "@/context/saved-songs-context";
import { UserProvider } from "@/context/user-context";
import { UserPreferencesProvider } from "@/context/user-preferences-context";
import { NotificationProvider } from "@/context/notification-context";
import { MusicProvider } from "@/context/music-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <UserPreferencesProvider>
                <LanguageProvider>
                    <WalletProvider>
                        <NotificationProvider>
                            <TripProvider>
                                <MusicProvider>
                                    <SavedSongsProvider>
                                        <NotificationSettingsProvider>
                                            <SecuritySettingsProvider>
                                                {children}
                                            </SecuritySettingsProvider>
                                        </NotificationSettingsProvider>
                                    </SavedSongsProvider>
                                </MusicProvider>
                            </TripProvider>
                        </NotificationProvider>
                    </WalletProvider>
                </LanguageProvider>
            </UserPreferencesProvider>
        </UserProvider>
    );
}
