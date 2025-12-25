
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/components/client-providers";
import { OfflineIndicator } from "@/components/offline-indicator";
import { FirebaseClientProvider, useUser } from "@/firebase";

export const metadata: Metadata = {
  title: "Eritas Gateway",
  description: "Your gateway to smart and seamless transportation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("h-full font-body antialiased", "bg-background")}>
        <FirebaseClientProvider>
          <ClientProviders>
            <OfflineIndicator />
            {children}
            <Toaster />
          </ClientProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
