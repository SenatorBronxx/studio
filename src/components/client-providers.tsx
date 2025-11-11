
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <WalletProvider>
                <MusicProvider>
                    <NotificationSettingsProvider>
                        {children}
                    </NotificationSettingsProvider>
                </MusicProvider>
            </WalletProvider>
        </UserProvider>
    );
}
