
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { DiscountProvider } from "@/context/discount-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <UserProvider>
                <WalletProvider>
                    <MusicProvider>
                        <NotificationSettingsProvider>
                            <SecuritySettingsProvider>
                                <DiscountProvider>
                                    {children}
                                </DiscountProvider>
                            </SecuritySettingsProvider>
                        </NotificationSettingsProvider>
                    </MusicProvider>
                </WalletProvider>
            </UserProvider>
        </LanguageProvider>
    );
}
