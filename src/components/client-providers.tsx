
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { DiscountProvider } from "@/context/discount-context";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <WalletProvider>
                <MusicProvider>
                    <NotificationSettingsProvider>
                        <DiscountProvider>
                            {children}
                        </DiscountProvider>
                    </NotificationSettingsProvider>
                </MusicProvider>
            </WalletProvider>
        </UserProvider>
    );
}
