
'use client';

import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { UserPreferencesProvider } from "@/context/user-preferences-context";


export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <UserPreferencesProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </UserPreferencesProvider>
    );
}
