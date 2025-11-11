
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { UserProvider } from "@/context/user-context";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <WalletProvider>
                <MusicProvider>
                    {children}
                </MusicProvider>
            </WalletProvider>
        </UserProvider>
    );
}
