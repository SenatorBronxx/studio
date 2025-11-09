
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <WalletProvider>
            {children}
        </WalletProvider>
    );
}
