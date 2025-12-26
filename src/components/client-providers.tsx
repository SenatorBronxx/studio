
'use client';

import { WalletProvider } from "@/context/wallet-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { UserPreferencesProvider } from "@/context/user-preferences-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserPreferencesProvider>
            <LanguageProvider>
                <WalletProvider>
                    {children}
                </WalletProvider>
            </LanguageProvider>
        </UserPreferencesProvider>
    );
}
