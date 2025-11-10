
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { MusicProvider } from "@/context/music-context";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <WalletProvider>
            <MusicProvider>
                {children}
            </MusicProvider>
        </WalletProvider>
    );
}
