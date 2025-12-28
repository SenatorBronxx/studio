// =================================================================================================
// FILE: .env
// =================================================================================================



// =================================================================================================
// FILE: README.md
// =================================================================================================
# Eritas Gateway - Pseudocode Overview

This document provides a high-level pseudocode overview of the Eritas Gateway application's architecture and core functionality.

---

## 1. Core Structure & Providers

The application is a Next.js-based Progressive Web App (PWA) built with React and TypeScript. Global state and context are managed through a series of React Context Providers wrapped around the main application layout.

`
RootLayout
|-- ClientProviders
|   |-- UserProvider (Manages mock user data)
|   |-- UserPreferencesProvider (Manages food, music, destination preferences)
|   |-- LanguageProvider (Handles internationalization)
|   |-- WalletProvider (Manages balance and transactions)
|   |-- NotificationProvider (Manages in-app notifications)
|   |-- TripProvider (Manages active bus trip state)
|   |-- MusicProvider (Manages the bus playlist and playback)
|   |-- SavedSongsProvider (Manages user's saved/favorite songs)
|   |-- SavedPlacesProvider (Manages user's saved home/work addresses)
|   |-- NotificationSettingsProvider (Manages notification preferences)
|   |-- SecuritySettingsProvider (Manages PIN/2FA settings)
|-- OfflineIndicator (Displays a screen when the user is offline)
|-- Toaster (Handles global toast notifications)
|-- {children} (The currently rendered page)
`

## 2. Authentication Flow (`/app/page.tsx`)

Handles user sign-in and sign-up.

`pseudocode
FUNCTION LoginPage:
  INITIALIZE router, language context (t), loading state, slideshow state

  // Simulate checking for a logged-in user
  ON component mount:
    SET loading to false

  FUNCTION handleSignInSuccess:
    REDIRECT user to '/home'

  FUNCTION handleSignUpSuccess:
    SET showSlideshow to true

  FUNCTION handleFinishSlideshow:
    REDIRECT user to '/home'

  IF loading:
    RETURN LoadingSpinner
  ELSE IF showSlideshow:
    RETURN SignupSlideshow(onFinish = handleFinishSlideshow)
  ELSE:
    RETURN LoginPageUI:
      DISPLAY app logo
      DISPLAY welcome message
      CREATE Tabs for "Sign In" and "Sign Up"
      
      IN "Sign In" Tab:
        RENDER AuthForm(mode="signin", onSuccess=handleSignInSuccess)
      
      IN "Sign-Up" Tab:
        RENDER AuthForm(mode="signup", onSuccess=handleSignUpSuccess)
`

## 3. Home & Bus Search (`/app/home/page.tsx`, `/app/search/page.tsx`)

The core user experience for finding and boarding a bus.

`pseudocode
FUNCTION HomePage:
  INITIALIZE contexts: router, trip, wallet, notifications, language
  INITIALIZE states: from/to locations, buses, selectedBus, etc.

  // If a trip is active, the UI changes completely
  IF activeTrip exists:
    DISPLAY ActiveTripUI:
      SHOW driver info, ETA to pickup/destination
      SHOW progress bar for trip
      PROVIDE "Cancel Trip" button
  ELSE:
    DISPLAY MainSearchUI:
      SHOW map with bus icons at mock locations
      ON bus icon click -> handleBusSelect(bus)

      IF a bus is selected (selectedBus is not null):
        DISPLAY BusDetailsPanel:
          SHOW driver info, capacity, ETA
          PROVIDE "View Seats" button -> opens BusSeatingChart
          DISPLAY list of stops with fares (Accordion)
          
          FOR EACH stop:
            PROVIDE "Board" button
            ON "Board" click -> handleBoard(bus, stop)

      ELSE (no bus selected):
        DISPLAY LocationSearchPanel:
          INPUT field for 'From'
          INPUT field for 'To'
          PROVIDE "Search Buses" button -> navigates to '/search'
  
  DISPLAY BottomNav

FUNCTION handleBoard(bus, stop):
  VALIDATE selectedSeats > 0
  VALIDATE userBalance >= totalFare
  IF validation fails -> SHOW error toast
  
  SET isBoarding to true
  SIMULATE API call (setTimeout):
    DEDUCT fare from wallet -> addTransaction()
    START new trip -> startTrip(tripDetails)
    GENERATE QR code for boarding pass
    ADD notification with QR code -> addNotification()
    SHOW success toast
    REDIRECT to '/home' to show active trip UI
`

## 4. Wallet & Payments (`/app/eritas-pay/page.tsx`, `/app/top-up/page.tsx`)

Manages the user's balance and transaction history.

`pseudocode
FUNCTION EritasPayPage:
  INITIALIZE contexts: wallet, language, notifications
  
  DISPLAY Header with Profile and Notification bell
  
  DISPLAY EritasPayBalanceCard:
    FETCH and DISPLAY balance from wallet context
    IF balance is low -> SHOW warning icon/popover
    DISPLAY progress bar for wallet capacity
  
  DISPLAY Top-Up and Withdraw buttons
  
  DISPLAY RecentActivityCard:
    FETCH and DISPLAY transactions from wallet context
    IF no transactions -> SHOW "No recent activity" message
    PROVIDE "Clear History" button
`

## 5. Music Integration (`/app/music/page.tsx`, `/context/music-context.tsx`)

Allows users on an active trip to manage a shared bus playlist.

`pseudocode
// MusicProvider Context
FUNCTION MusicProvider:
  INITIALIZE states: playlist, nowPlaying, isPlaying, progress
  GET activeTrip from TripContext

  // Core playback simulation loop
  USE_EFFECT (when nowPlaying or isPlaying changes):
    IF a trip is active AND a song is playing:
      CREATE interval to increment 'progress' every second
      IF 'progress' >= 100:
        CALL playNextSong()
    RETURN cleanup to clear interval

  // Clear playlist when trip ends
  USE_EFFECT (when activeTrip changes):
    IF no active trip:
      RESET all music states to initial values

// MusicPage UI
FUNCTION MusicPage:
  INITIALIZE contexts: trip, music, savedSongs, preferences
  INITIALIZE states: searchTerm, searchResults, selectedArtistId

  IF selectedArtistId is not null:
    RETURN ArtistDetailView(artistId)
  
  DISPLAY Header with "Music" title and buttons for Playlist and Saved Songs (opens a Sheet)
  
  DISPLAY SearchBar with toggle for 'Tracks' and 'Artists'
  
  IF searchTerm exists:
    DISPLAY SearchResults
  ELSE:
    DISPLAY DefaultView:
      IF AI recommendations exist -> SHOW "Recommended For You"
      SHOW "Genres" section
      SHOW "Popular Artists" section

  // "Now Playing" bar appears if a trip is active
  IF nowPlaying and activeTrip:
    DISPLAY FloatingNowPlayingBar at bottom of screen
`

## 6. Settings & Profile Management (`/app/settings/*.tsx`)

A collection of pages for managing user-specific settings.

`pseudocode
FUNCTION SettingsPage:
  INITIALIZE router, language context
  GET user data from UserContext
  
  DISPLAY User Avatar and Name/Email
  
  CREATE list of settings options:
    - Edit Profile
    - Linked Devices (Marked as Unavailable)
    - Payment Methods
    - Notifications
    - Security
  
  RENDER each option as a link to its respective page.
  
  DISPLAY ThemeSwitcher component (Light/Dark mode)
  DISPLAY Logout and Delete Account buttons

// Example: EditProfilePage
FUNCTION EditProfilePage:
  INITIALIZE form (react-hook-form) with validation schema
  GET user data and populate form defaults
  
  ON form submit:
    SET isSubmitting to true
    SIMULATE API call (setTimeout):
      UPDATE mock user data
      SHOW success toast
      REDIRECT back
`

## 7. State Management & Data Persistence

- **React Context**: Used for global state that needs to be accessed by many components (e.g., `wallet`, `trip`, `language`).
- **`useState`**: Used for component-level, non-persistent state (e.g., `isLoading`, `selectedBus`).
- **`localStorage`**: Used to persist state across page reloads and browser sessions. This provides a "database-less" experience. Context providers read from `localStorage` on initial mount and write to it whenever the state changes. This is handled within each respective context file (e.g., `wallet-context.tsx`).
- **Genkit/AI**: The `get-recommendations-flow.ts` file defines a Genkit flow that uses an AI model and a custom tool (`getMusicRecommendations`) to fetch song suggestions from the Spotify API based on user preferences. This flow is called from the `MusicPage` component.


// =================================================================================================
// FILE: apphosting.yaml
// =================================================================================================
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1


// =================================================================================================
// FILE: components.json
// =================================================================================================
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}


// =================================================================================================
// FILE: next.config.ts
// =================================================================================================

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jklylnqjwfrmjrsqfzys.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'momodeveloper.mtn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'play.telecel.com.gh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bayfrontgardens.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-141831e61e69445289222976a15b6fb3.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;


// =================================================================================================
// FILE: package.json
// =================================================================================================
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit-next dev",
    "genkit:watch": "genkit-next dev",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/google-genai": "^1.20.0",
    "@genkit-ai/next": "^1.20.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@vis.gl/react-google-maps": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "genkit": "^1.20.0",
    "lucide-react": "^0.475.0",
    "next": "15.3.8",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-confetti": "^6.1.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^9.0.8",
    "genkit-cli": "^1.20.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}


// =================================================================================================
// FILE: src/ai/flows/get-recommendations-flow.ts
// =================================================================================================

'use server';
/**
 * @fileOverview An AI flow to get music recommendations based on user preferences.
 *
 * - getRecommendations - a function that fetches song recommendations.
 * - GetRecommendationsInput - The input type for the getRecommendations function.
 * - GetRecommendationsOutput - The return type for the getRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchTracks } from '@/lib/spotify';

const GetRecommendationsInputSchema = z.object({
  favoriteMusic: z.string().describe('The user\'s stated favorite music genre or style, e.g., "Highlife" or "90s hip-hop".'),
});
export type GetRecommendationsInput = z.infer<typeof GetRecommendationsInputSchema>;

// We don't need a strict output schema for the flow itself,
// as the final transformation to Track[] happens in the exported function.
const GetRecommendationsOutputSchema = z.object({
    recommendations: z.array(z.any()).describe("An array of recommended Spotify track objects."),
});
export type GetRecommendationsOutput = z.infer<typeof GetRecommendationsOutputSchema>;


const recommendationTool = ai.defineTool(
    {
        name: 'getMusicRecommendations',
        description: 'Gets a list of songs from Spotify based on a search query.',
        inputSchema: z.object({
            queries: z.array(z.string()).describe('An array of 3 diverse search queries based on the user\'s favorite music.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        const results = await Promise.all(
            input.queries.map(q => searchTracks(q, 5))
        );
        // Flatten the array of arrays and return
        return results.flat();
    }
);


const getRecommendationsFlow = ai.defineFlow(
    {
        name: 'getRecommendationsFlow',
        inputSchema: GetRecommendationsInputSchema,
        outputSchema: GetRecommendationsOutputSchema,
    },
    async (input) => {
        const llmResponse = await ai.generate({
            prompt: `You are a music recommendation expert. Based on the user's favorite music style, "{{favoriteMusic}}", generate 3 diverse search queries to find songs they might like on Spotify. Use the provided tool to get the song recommendations.`,
            model: 'googleai/gemini-2.5-pro-preview',
            tools: [recommendationTool],
        });

        const toolResponse = llmResponse.toolRequest()?.output();
        
        if (!toolResponse) {
            // Handle case where the model doesn't use the tool
            // and just returns text. We can try searching with the text.
            const fallbackResults = await searchTracks(llmResponse.text(), 10);
            return { recommendations: fallbackResults };
        }

        // De-duplicate tracks based on ID
        const uniqueTracks = Array.from(new Map(toolResponse.map((track: any) => [track.id, track])).values());

        return { recommendations: uniqueTracks as any[] };
    }
);

/**
 * Gets personalized music recommendations.
 * @param {GetRecommendationsInput} input The user's music preferences.
 * @returns {Promise<GetRecommendationsOutput>} A promise that resolves to a list of recommended tracks.
 */
export async function getRecommendations(input: GetRecommendationsInput): Promise<GetRecommendationsOutput> {
    return getRecommendationsFlow(input);
}


// =================================================================================================
// FILE: src/ai/genkit.ts
// =================================================================================================
/**
 * @fileoverview This file initializes the Genkit AI platform with necessary plugins.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI(),
    next(),
  ],
});


// =================================================================================================
// FILE: src/app/access-denied/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex items-center gap-4 p-6 bg-destructive/10 border-2 border-dashed border-destructive/20 rounded-lg">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <div className="text-left">
          <h1 className="text-2xl font-bold text-destructive-foreground">
            Access Denied
          </h1>
          <p className="text-destructive-foreground/80">
            You do not have the necessary permissions to view this page.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/home')}
            className="mt-4"
          >
            Go to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/eritas-pay/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, Loader2, MoreVertical, Wallet, Bell, Trash2, Shield, CircleDollarSign, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet, Transaction } from '@/context/wallet-context';
import { useLanguage } from '@/context/language-context';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';
import { cn } from '@/lib/utils';
import { BusTicketIcon } from '@/components/icons/bus-ticket-icon';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { CardIconBackground } from '@/components/card--background';
import { Badge } from '@/components/ui/badge';
import { useNotification, Notification } from '@/context/notification-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


export default function EritasPayPage() {
  const router = useRouter();
  const { balance, transactions, isHydrated, clearTransactions } = useWallet();
  const { t } = useLanguage();
  const { notifications, clearNotifications } = useNotification();

  const WALLET_THRESHOLD = 400;
  const LOW_BALANCE_THRESHOLD = 20;

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
        case 'top-up':
            return <div className="p-2 bg-green-500/10 rounded-full"><Wallet className="h-5 w-5 text-green-600"/></div>;
        case 'payment':
            return <div className="p-2 bg-blue-500/10 rounded-full"><BusTicketIcon className="h-5 w-5 text-blue-600"/></div>;
        default:
            return <div className="p-2 bg-muted rounded-full"><Wallet className="h-5 w-5 text-muted-foreground"/></div>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="w-10"></div>
            <h1 className="text-lg font-semibold text-center flex-grow">{t('eritasPay')}</h1>
            <div className="flex items-center gap-2">
                <ProfileSidebar />
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="default"
                            size="icon"
                            className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", "bg-primary")}></span>
                                    <span className={cn("relative inline-flex rounded-full h-4 w-4 text-primary-foreground text-xs items-center justify-center", "bg-primary")}>
                                        {notifications.length}
                                    </span>
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{t('notifications')}</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 h-full flex flex-col">
                            {notifications.length > 0 ? (
                                <>
                                    <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar">
                                        {notifications.map(notification => (
                                            <Card key={notification.id} className={cn(notification.id === -1 && "bg-destructive/10 border-destructive")}>
                                                <CardContent className='p-4 space-y-2'>
                                                    <h3 className="font-semibold">{notification.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                    {notification.action && <div className='pt-2'>{notification.action}</div>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="mt-4">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t('clearAll')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>{t('clearNotificationsTitle')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('clearNotificationsDescription')}
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={clearNotifications}
                                            >
                                                {t('confirmClear')}
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4" />
                                    <p>{t('noNewNotifications')}</p>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>

      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-4">
                <Card className="shadow-lg relative overflow-hidden">
                    <CardIconBackground />
                     <div className="absolute top-3 right-3 p-2 bg-primary/10 rounded-full">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle>{t('eritasPayBalance')}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex justify-between items-center mb-2">
                            {isHydrated ? 
                                <p className="text-4xl font-bold">GH₵ {balance.toFixed(2)}</p>
                                : <Loader2 className="h-8 w-8 animate-spin" />
                            }
                            {isHydrated && balance < LOW_BALANCE_THRESHOLD && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive animate-pulse">
                                            <AlertCircle className="h-6 w-6" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <div className="space-y-2 text-sm">
                                            <h4 className="font-semibold">Low Balance Warning</h4>
                                            <p className="text-muted-foreground">Your balance is below GH₵{LOW_BALANCE_THRESHOLD.toFixed(2)}. Please top up to avoid service interruptions.</p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Progress value={isHydrated ? (balance / WALLET_THRESHOLD) * 100 : 0} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>GH₵ 0.00</span>
                                <span>GH₵ {WALLET_THRESHOLD.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/top-up" className="block">
                        <Button size="lg" className="w-full">{t('topUp')}</Button>
                    </Link>
                    <Link href="/withdraw" className="block">
                        <Button size="lg" variant="outline" className="w-full">
                             <ArrowUpRight className="mr-2 h-4 w-4" />
                            Withdraw
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('recentActivity')}</CardTitle>
                    {transactions.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Clear Transaction History?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all your transaction records. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={clearTransactions}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Yes, Clear
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardHeader>
                <CardContent>
                    {isHydrated ? (
                        transactions.length > 0 ? (
                             <div className="space-y-4">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center gap-4">
                                        {getTransactionIcon(transaction)}
                                        <div className="flex-grow">
                                            <p className="font-semibold">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(transaction.timestamp), 'MMM d, yyyy')}</p>
                                        </div>
                                        <p className={cn("font-semibold text-lg", transaction.amount > 0 ? "text-green-600" : "text-destructive")}>
                                            {transaction.amount > 0 ? '+' : ''}GH₵{transaction.amount.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">{t('noRecentActivity')}</p>
                        )
                    ) : (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>

      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}

    

    


// =================================================================================================
// FILE: src/app/food/page.tsx
// =================================================================================================

'use client';

import { useLanguage } from '@/context/language-context';
import { Utensils } from 'lucide-react';

export default function FoodPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Utensils className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-foreground">{t('foodTitle')}</h1>
      <p className="text-muted-foreground mt-2">
        {t('foodDescription')}
      </p>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/globals.css
// =================================================================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer base {
  :root {
    --background: 45 67% 97%;
    --foreground: 240 10% 3.9%;
    --card: 45 67% 97%;
    --card-foreground: 240 10% 3.9%;
    --popover: 45 67% 97%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 140 61% 30%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 140 61% 40%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 140 61% 30%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 240 6% 10%;
    --foreground: 60 9.1% 97.8%;
    --card: 240 4% 12%;
    --card-foreground: 60 9.1% 97.8%;
    --popover: 240 6% 10%;
    --popover-foreground: 60 9.1% 97.8%;
    --primary: 140 71% 55%;
    --primary-foreground: 140 40% 5%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 60 9.1% 97.8%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 140 71% 65%;
    --accent-foreground: 140 40% 5%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 140 71% 65%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5% 14%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 140 71% 55%;
    --sidebar-primary-foreground: 140 40% 5%;
    --sidebar-accent: 240 3.7% 18.9%;
    --sidebar-accent-foreground: 60 9.1% 97.8%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 140 71% 65%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
}


// =================================================================================================
// FILE: src/app/home/page.tsx
// =================================================================================================

'use client';

import Image from 'next/image';
import {
  ArrowRight,
  BusFront,
  MapPin,
  Search,
  X,
  Flag,
  Users,
  Loader2,
  Clock,
  Armchair,
  QrCode,
  Bell,
  Trash2,
  Ticket,
  LogIn,
  Bus,
  UserCircle,
  Send,
  ArrowUpRight,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/bottom-nav';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BusSeatingChart } from '@/components/bus-seating-chart';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { Map } from '@/components/map';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBusArrivalNotification } from '@/hooks/use-bus-arrival-notification';
import { TripRating } from '@/components/trip-rating';
import { useWallet } from '@/context/wallet-context';
import { useNotification, Notification } from '@/context/notification-context';
import { useTrip } from '@/context/trip-context';

const initialBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 1,
      capacity: { current: 35, max: 52 },
      stops: [
        { name: 'Adenta', fare: 5.00, eta: 5 },
        { name: 'Madina', fare: 7.50, eta: 15 },
      ],
      finalDestination: { name: 'Atomic Junction', fare: 10.00, eta: 25 },
      position: { top: '45%', left: '25%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: [
        { id: '1A', isOccupied: false }, { id: '2A', isOccupied: true }, { id: '3A', isOccupied: false }, { id: '4A', isOccupied: false },
        { id: '1B', isOccupied: false }, { id: '1C', isOccupied: true }, { id: '2B', isOccupied: false }, { id: '2C', isOccupied: true },
        { id: '3B', isOccupied: true }, { id: '3C', isOccupied: false }, { id: '4B', isOccupied: false }, { id: '4C', isOccupied: false },
      ].concat(Array.from({ length: 13 }, (_, i) => ({ id: `5${String.fromCharCode(65 + i)}`, isOccupied: Math.random() > 0.5 })))
    },
    {
      id: 'bus-2',
      driver: 'Ama Serwaa',
      plate: 'AS 1234-24',
      eta: 25,
      capacity: { current: 48, max: 48 },
      stops: [
        { name: 'Circle', fare: 6.00, eta: 10 },
        { name: 'Kaneshie', fare: 8.50, eta: 20 },
      ],
      finalDestination: { name: 'Mallam', fare: 12.00, eta: 30 },
      position: { top: '55%', left: '65%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: Array.from({ length: 25 }, (_, i) => ({ id: `${Math.floor(i/5)+1}${String.fromCharCode(65 + (i % 5 > 1 ? i%5-1 : i%5))}`, isOccupied: true }))
    },
];

type BusData = typeof initialBusData[0];
type StopInfo = { name: string; fare: number; eta: number; };
type PassedBusInfo = {
    nextStop: StopInfo;
    walkingTime: number;
};
// Mock user for DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app'
}

export default function HomePage() {
  const router = useRouter();
  const user = mockUser; // Use mock user
  const { toast } = useToast();
  const { t } = useLanguage();
  const { balance, addTransaction, isHydrated: isWalletHydrated } = useWallet();
  const { notifications, addNotification, clearNotifications } = useNotification();
  const { activeTrip, tripStatus, currentEta, startTrip, endTrip, submitRating, cancelTrip, isHydrated: isTripHydrated } = useTrip();
  
  const [fromLocation, setFromLocation] = useState('Your Current Location');
  const [toLocation, setToLocation] = useState('');
  
  const [buses, setBuses] = useState(initialBusData);
  const [isLoadingBuses, setIsLoadingBuses] = useState(true);

  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [passedBusInfo, setPassedBusInfo] = useState<PassedBusInfo | null>(null);
  const [isBusArriving, setIsBusArriving] = useState(false);

  const busHasArrived = tripStatus === 'bus_arrived';
  useBusArrivalNotification(busHasArrived);
  
  useEffect(() => {
    // Simulate loading buses
    setTimeout(() => setIsLoadingBuses(false), 500);
  }, []);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    if (activeTrip) return;
    setSelectedBus(bus);
    setSelectedSeats([]); 
    setPassedBusInfo(null); // Reset passed bus info

    // Check if the bus has already passed
    if (bus.eta <= 0 && bus.stops.length > 0) {
        const nextStop = bus.stops[0]; // Simple logic: suggest the first stop
        const walkingTime = 5 + Math.floor(Math.random() * 10); // Mock walking time: 5-15 mins
        setPassedBusInfo({ nextStop, walkingTime });
    }
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassedBusInfo(null);
  }

  const handleBoard = async (bus: BusData, stop: StopInfo) => {
    if (selectedSeats.length === 0 || !isWalletHydrated) return;

    const totalFare = stop.fare * selectedSeats.length;

    if (balance < totalFare) {
        toast({
            variant: "destructive",
            title: t('insufficientBalanceToastTitle'),
            description: t('insufficientBalanceToastDescription'),
        });
        return;
    }

    setIsBoarding(true);
    
    // Simulate API call and local state update
    setTimeout(() => {
        addTransaction({
            type: 'payment',
            amount: -totalFare,
            description: `Bus ticket to ${bus.finalDestination.name}`,
            plate: bus.plate,
        });

        const tripId = uuidv4();
        const primarySeat = selectedSeats[0];
        const qrData = { tripId: tripId, bus: bus.plate, seat: primarySeat, from: stop.name, to: bus.finalDestination.name, fare: totalFare / selectedSeats.length, timestamp: new Date().toISOString() };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        const newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`;
        setQrCodeUrl(newQrCodeUrl);
        
        let toastDescription = `The fare of GHS ${totalFare.toFixed(2)} has been deducted.`;

        toast({
            title: "Seat Booked!",
            description: toastDescription,
            action: (<Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}><QrCode className="mr-2 h-4 w-4" />View QR Code</Button>)
        });
        
        startTrip({
            bus: bus,
            boardingStop: stop,
            seats: selectedSeats,
            tripId: tripId,
        });

         addNotification({
            title: "Your Boarding Pass",
            description: `Show this QR code to the driver for verification. (${bus.plate} - Seat: ${primarySeat})`,
            tripId: tripId,
            action: (
                <div className="mt-2 flex justify-center">
                    <Image src={newQrCodeUrl} alt="Boarding QR Code" width={150} height={150} />
                </div>
            )
        });

        if (selectedSeats.length > 1) {
            addNotification({
                title: "Seats Reserved for Others",
                description: "You have reserved multiple seats. You can share the trip details with the recipients.",
                action: (
                    <Button variant="default" size="sm" onClick={() => router.push('/share-trip')}>
                        <Send className="mr-2 h-4 w-4" />
                        Send to Recipient
                    </Button>
                )
            });
        }
    
        setIsBoarding(false);
        clearSelectedBus();
    }, 1500);
  }
  
  const handleSeatSelect = (seatId: string) => {
    if (selectedBus) {
        const seat = selectedBus.seating.find(s => s?.id === seatId);
        if (seat && !seat.isOccupied) {
            setSelectedSeats(prevSeats => {
                if (prevSeats.includes(seatId)) {
                    return prevSeats.filter(s => s !== seatId);
                } else {
                    return [...prevSeats, seatId];
                }
            });
        }
    }
  }
  
  const handleConfirmSeat = () => {
    setIsSeatSheetOpen(false);
  }
  
  const handleTripRatingSubmit = (rating: number, complaint?: string) => {
      // Here you would typically send the rating to your backend
      toast({
          title: "Rating Submitted",
          description: "Thank you for your feedback!",
      });
      submitRating();
  };

  const handleCancelTrip = () => {
    const { fare, seats } = cancelTrip();
    if (fare > 0) {
      addTransaction({
        type: 'top-up', // Refund is a form of top-up
        amount: fare,
        description: 'Trip cancellation refund',
      });
      toast({
        title: t('tripCancelled'),
        description: t('tripCancelledDescription', { fare: fare.toFixed(2) }),
      });
    }
  };

  const displayedBus = selectedBus;
  const primarySeat = (Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats[0] : null);

  const allStops = displayedBus ? [...displayedBus.stops, displayedBus.finalDestination] : [];
 
  if ((isLoadingBuses && !buses) || !isTripHydrated) {
      return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (isTripHydrated && tripStatus === 'rating' && activeTrip) {
      return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
            <TripRating trip={activeTrip} onSubmit={handleTripRatingSubmit} />
        </div>
      )
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-background font-sans overflow-hidden">
        <div className="flex-grow h-full w-full">
            <Map />
            <div className="absolute inset-0 bg-background/20 pointer-events-none" />
        </div>
      
      <header className="absolute top-0 left-0 right-0 py-2 px-4 flex justify-between items-center z-20">
        <Image
            src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
            alt="Eritas Transport Company Logo"
            width={120}
            height={60}
            priority
            className="object-contain"
        />
        <div className="flex items-center gap-2">
            <ProfileSidebar />
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="default"
                        size="icon"
                        className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", "bg-primary")}></span>
                                <span className={cn("relative inline-flex rounded-full h-4 w-4 text-primary-foreground text-xs items-center justify-center", "bg-primary")}>
                                    {notifications.length}
                                </span>
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{t('notifications')}</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 h-full flex flex-col">
                        {notifications.length > 0 ? (
                            <>
                                <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar">
                                    {notifications.map(notification => (
                                        <Card key={notification.id} className={cn(notification.id === -1 && "bg-destructive/10 border-destructive")}>
                                            <CardContent className='p-4 space-y-2'>
                                                <h3 className="font-semibold">{notification.title}</h3>
                                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                {notification.action && <div className='pt-2'>{notification.action}</div>}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="mt-4">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('clearAll')}
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>{t('clearNotificationsTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('clearNotificationsDescription')}
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={clearNotifications}
                                        >
                                            {t('confirmClear')}
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                                <Bell className="h-12 w-12 mb-4" />
                                <p>{t('noNewNotifications')}</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </header>
      
       {!activeTrip && buses && buses.map((bus, index) => (
            <div 
                key={bus.id}
                className="absolute z-10 animate-float cursor-pointer"
                style={{
                    top: bus.position.top,
                    left: bus.position.left,
                    animationDelay: `-${index * 2}s`
                }}
                onClick={() => handleBusSelect(bus)}
            >
                 <BusFront className="h-12 w-12 text-primary opacity-80" />
            </div>
        ))}

        <div className="absolute top-1/3 right-1/4 animate-float [animation-delay:-2s]">
          <MapPin className="h-12 w-12 text-red-500 opacity-70" />
        </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-[80px]">
        <div className="p-2 sm:p-4 pointer-events-auto">
            <div className="bg-background/75 backdrop-blur-sm rounded-t-2xl max-w-md mx-auto p-4 flex flex-col gap-4 shadow-lg">
                {activeTrip && isTripHydrated ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {activeTrip.bus.driverImage && <AvatarImage src={activeTrip.bus.driverImage} alt={activeTrip.bus.driver} />}
                                <AvatarFallback>{activeTrip.bus.driver.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{activeTrip.bus.driver}</h2>
                                <p className="text-sm text-muted-foreground font-mono">{activeTrip.bus.plate}</p>
                            </div>
                        </div>
                        <Card className="text-center">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    {tripStatus === 'en_route_to_pickup' && t('busArrivingAtYourLocation')}
                                    {tripStatus === 'bus_arrived' && t('busHasArrived')}
                                    {(tripStatus === 'en_route_to_destination' || tripStatus === 'trip_ended') && `${t('arrivingAt')} ${activeTrip.boardingStop.name}`}
                                </p>
                                <p className="text-3xl font-bold text-primary">
                                    {currentEta > 0 ? t('minutesAbbr', { minutes: currentEta }) : tripStatus === 'bus_arrived' ? 'Now' : '...'}
                                </p>
                            </CardContent>
                        </Card>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="destructive" 
                                    className="w-full"
                                    disabled={tripStatus !== 'en_route_to_pickup'}
                                >
                                    <X className="mr-2 h-4 w-4" /> Cancel Trip
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cancelTripConfirmationTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cancelTripConfirmationDescription')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('goBack')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancelTrip}>{t('confirmCancellation')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ) : displayedBus ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                {displayedBus.driverImage && <AvatarImage src={displayedBus.driverImage} alt={displayedBus.driver} />}
                                <AvatarFallback>{displayedBus.driver.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{displayedBus.driver}</h2>
                                <p className="text-sm text-muted-foreground font-mono">{displayedBus.plate}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {passedBusInfo ? (
                        <Card className="bg-amber-50 border border-amber-200">
                            <CardContent className="p-4 text-sm text-amber-900 space-y-3">
                                <p>This bus has passed your current location. The next available stop you can board is:</p>
                                <div className='font-semibold text-center bg-amber-100 p-2 rounded-md'>
                                    <p className='text-base'>{passedBusInfo.nextStop.name}</p>
                                    <div className='flex justify-center items-center gap-4 text-xs mt-1'>
                                        <span className='flex items-center gap-1'><Bus className='h-3 w-3' /> Bus ETA: {passedBusInfo.nextStop.eta} min</span>
                                        <span className='flex items-center gap-1'><Footprints className='h-3 w-3' /> Your ETA: {passedBusInfo.walkingTime} min</span>
                                    </div>
                                </div>
                                <Button className='w-full' onClick={() => handleBoard(displayedBus, passedBusInfo.nextStop)} disabled={selectedSeats.length === 0}>
                                    {selectedSeats.length > 0 ? `Reserve Seat for ${passedBusInfo.nextStop.name}` : "Select a seat first"}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Sheet open={isSeatSheetOpen} onOpenChange={setIsSeatSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className='w-full'>
                                    <Armchair className="mr-2 h-5 w-5" />
                                    {selectedSeats.length > 0 ? t('seatsSelected', { count: selectedSeats.length }) : t('viewSeats')}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-2xl">
                                <SheetHeader>
                                    <SheetTitle>{t('selectYourSeat')}</SheetTitle>
                                </SheetHeader>
                                <BusSeatingChart 
                                    seating={displayedBus.seating}
                                    selectedSeats={selectedSeats}
                                    onSeatSelect={handleSeatSelect}
                                    busPlate={displayedBus.plate}
                                    onConfirm={handleConfirmSeat}
                                />
                            </SheetContent>
                        </Sheet>
                    )}

                    <Separator />

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2"><Users className="h-4 w-4" />{t('busCapacity')}</h3>
                            <p className="text-sm font-mono text-muted-foreground">{displayedBus.capacity.current} / {displayedBus.capacity.max} {t('seats')}</p>
                        </div>
                        <Progress value={(displayedBus.capacity.current / displayedBus.capacity.max) * 100} className="h-2" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground/80 mb-2">{t('busFares')}:</h3>
                        <Accordion type="single" collapsible className="w-full">
                            {[...displayedBus.stops, { ...displayedBus.finalDestination, isFinal: true }].map((stop, index) => {
                                let fare = stop.fare;

                                return (
                                <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                    <AccordionTrigger className="py-2 rounded-lg hover:bg-muted/50 px-2 data-[state=open]:bg-muted">
                                        <div className="flex items-center justify-between gap-3 w-full">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${stop.isFinal ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                                                    {stop.isFinal ? <Flag className="h-3 w-3 text-primary" /> : <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                </div>
                                                <p className={`text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{stop.name} {stop.isFinal && `(${t('final')})`}</p>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <p className={`font-mono text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{t('farePerSeat', { fare: fare.toFixed(2) })}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="px-3 pt-2 pb-2 text-center">
                                        {passedBusInfo ? (
                                            <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">This bus has passed. Please use the option above.</p>
                                        ) : displayedBus.capacity.current + selectedSeats.length > displayedBus.capacity.max ? (
                                            <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">{t('notEnoughSeats')}</p>
                                        ) : (
                                            <Button 
                                                className='w-full' 
                                                onClick={() => handleBoard(displayedBus, stop)} 
                                                disabled={isBoarding || selectedSeats.length === 0}
                                            >
                                                {isBoarding ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : selectedSeats.length === 0 ? (
                                                    t('selectBusSeatFirst')
                                                ) : (
                                                    t('board')
                                                )}
                                            </Button>
                                        )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>
                </div>
                ) : (
                <>
                    <div className='text-center'>
                        <h2 className="text-xl font-bold text-foreground">{t('homeGreeting', { name: user?.displayName?.split(' ')[0] || t('friend') })}</h2>
                        <p className="text-sm text-muted-foreground">{t('homeSubGreeting')}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='relative flex-1'>
                            <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                            placeholder={t('from')}
                            className='pl-10' 
                            value={fromLocation}
                            onChange={(e) => setFromLocation(e.target.value)}
                            />
                        </div>
                        <div className="p-2 rounded-full bg-muted">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className='relative flex-1'>
                            <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                            placeholder={t('to')}
                            className='pl-10'
                            value={toLocation}
                            onChange={(e) => setToLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className='mr-2 h-5 w-5' />
                        {t('searchBuses')}
                    </Button>
                </>
                )}
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNav />
      </div>

       <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>{t('yourBoardingPass')}</SheetTitle>
                </SheetHeader>
                <div className="p-4 flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt={t('boardingQrCode')} width={200} height={200} />
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">{t('showQrToDriver')}</p>
                        <div className="flex items-center gap-4 justify-center">
                            <Badge variant="outline">{activeTrip?.bus.plate || displayedBus?.plate}</Badge>
                           {primarySeat && <Badge>{t('seat')}: {primarySeat}</Badge>}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}

    

    


// =================================================================================================
// FILE: src/app/layout.tsx
// =================================================================================================

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/client-providers";
import { OfflineIndicator } from "@/components/offline-indicator";

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
        <ClientProviders>
          <OfflineIndicator />
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}


// =================================================================================================
// FILE: src/app/link-card/page.tsx
// =================================================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { VisaIcon } from '@/components/icons/visa';
import { CardPattern } from '@/components/icons/card-pattern';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export default function LinkCardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isCardLinked, setIsCardLinked] = useState(false);

    const [topUpAmount, setTopUpAmount] = useState('');
    const [isToppingUp, setIsToppingUp] = useState(false);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        setCardNumber(value);
    };

    const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Remove non-letters/spaces
        setCardHolder(value);
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiryDate(value);
    };
    
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCvv(value);
    };

    const handleLinkCard = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate API call to link card
        setTimeout(() => {
            setIsProcessing(false);
            setIsCardLinked(true);
            toast({
                title: t('cardLinkedToastTitle'),
                description: t('cardLinkedToastDescription'),
            });
        }, 1500);
    };

    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (!amount || amount <= 0) {
            toast({
                variant: 'destructive',
                title: t('invalidAmountToastTitle'),
                description: t('invalidAmountToastDescription'),
            });
            return;
        }
        setIsToppingUp(true);
        setTimeout(() => {
            toast({
                title: t('topUpSuccessfulToastTitle'),
                description: t('topUpSuccessfulToastDescription', { amount: amount.toFixed(2) }),
            });
            setIsToppingUp(false);
            router.push('/home');
        }, 1500);
    };

    const formatCardNumber = (num: string) => {
        if (num.length < 4) {
            return num.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
        }
        const firstTwo = num.slice(0, 2);
        const lastTwo = num.slice(-2);
        return `${firstTwo}${'*'.repeat(12)}${lastTwo}`.replace(/(.{4})/g, '$1 ').trim();
    };


    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
                <div className="max-w-md mx-auto flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold mx-auto">{isCardLinked ? t('topUpFromCardTitle') : t('linkVisaCardTitle')}</h1>
                </div>
            </header>

            <main className="flex-grow p-4">
                <div className="max-w-md mx-auto">
                    <Card className="mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <CardPattern />
                        </div>
                        <CardContent className="p-6 relative flex flex-col justify-between min-h-[200px]">
                           <div className="flex justify-end items-start">
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa Logo" width={80} height={26} />
                            </div>
                            <div className='space-y-2 mt-auto'>
                                <p className="text-xl font-mono tracking-widest text-foreground/80">
                                  {formatCardNumber(cardNumber)}
                                </p>
                                <div className="flex justify-between items-end">
                                  <p className="text-sm text-foreground/70 uppercase">{cardHolder || t('cardholderNamePlaceholder')}</p>
                                  <div className="text-right">
                                    <p className="text-xs text-foreground/70">Expires</p>
                                    <p className="text-sm font-mono text-foreground/80">{expiryDate || 'MM/YY'}</p>
                                  </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isCardLinked ? (
                        <form onSubmit={handleLinkCard}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('enterCardDetailsTitle')}</CardTitle>
                                    <CardDescription>{t('enterCardDetailsDescription')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card-number">{t('cardNumberLabel')}</Label>
                                        <Input
                                            id="card-number"
                                            placeholder="4500 1234 5678 9012"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength={16}
                                            required
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="card-holder">{t('cardHolderNameLabel')}</Label>
                                        <Input
                                            id="card-holder"
                                            placeholder={t('cardHolderNameExample')}
                                            value={cardHolder}
                                            onChange={handleCardHolderChange}
                                            required
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry-date">{t('expiryDateLabel')}</Label>
                                            <Input
                                                id="expiry-date"
                                                placeholder="MM/YY"
                                                value={expiryDate}
                                                onChange={handleExpiryDateChange}
                                                maxLength={5}
                                                required
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                type="password"
                                                value={cvv}
                                                onChange={handleCvvChange}
                                                maxLength={3}
                                                required
                                                disabled={isProcessing}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <CreditCard className="mr-2 h-5 w-5" />
                                )}
                                {t('linkCardButton')}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleTopUp}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('topUpEritasPayWalletTitle')}</CardTitle>
                                    <CardDescription>{t('topUpEritasPayWalletDescription')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="top-up-amount">{t('amountLabel')}</Label>
                                        <Input
                                            id="top-up-amount"
                                            type="number"
                                            placeholder={t('amountExample')}
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            required
                                            step="0.01"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                             <Button type="submit" size="lg" className="w-full mt-6" disabled={isToppingUp}>
                                {isToppingUp ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Wallet className="mr-2 h-5 w-5" />
                                )}
                                {t('topUpFromCardButton')}
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}


// =================================================================================================
// FILE: src/app/loyalty/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Bus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';
import { BottomNav } from '@/components/bottom-nav';

export default function LoyaltyPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const tripHistory: any[] = [];
  const loyaltyPoints = 0;

  const pointsHistory = tripHistory.map(trip => ({
    ...trip,
    pointsEarned: Math.floor(Math.abs(trip.amount)),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('loyaltyPoints')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
            <Card className="bg-primary text-primary-foreground text-center shadow-lg">
                <CardContent className="p-6">
                    <p className="text-sm opacity-80">{t('totalPoints')}</p>
                    <div className="flex items-center justify-center gap-2">
                        <Award className="h-10 w-10" />
                        <p className="text-5xl font-bold">{loyaltyPoints}</p>
                    </div>
                    <p className="text-xs opacity-80 mt-2">{t('redeemForDiscounts')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('pointsHistory')}</CardTitle>
                    <CardDescription>{t('pointsHistoryDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {pointsHistory.length > 0 ? (
                        <ScrollArea className="h-[40vh]">
                            <div className="space-y-4">
                            {pointsHistory.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                        <AvatarFallback>
                                            <Bus className='w-5 h-5'/>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{t('tripOnBus', { plate: item.plate })}</p>
                                        <p className="text-sm text-muted-foreground">{t('fare')}: GH₵{Math.abs(item.amount).toFixed(2)}</p>
                                    </div>
                                    <div className="font-semibold text-right text-primary">
                                        <p>+{item.pointsEarned}</p>
                                        <p className="text-xs font-normal">{t('points')}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                            <History className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold">{t('noPointsHistory')}</h3>
                            <p className="text-sm mt-1">{t('noPointsHistoryDescription')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/music/now-playing/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { useMusic } from '@/context/music-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Music, Pause, Play, Heart, Share2, ListMusic, SkipBack, SkipForward } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useSavedSongs } from '@/context/saved-songs-context';
import { cn } from '@/lib/utils';

export default function NowPlayingPage() {
    const router = useRouter();
    const { nowPlaying, isPlaying, progress, togglePlay, playlist, playNext, playPrevious } = useMusic();
    const { t } = useLanguage();
    const { saveSong, unsaveSong, isSongSaved } = useSavedSongs();

    if (!nowPlaying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <Music className="h-16 w-16 text-primary mb-4" />
                <h1 className="text-2xl font-bold text-foreground">No song playing</h1>
                <p className="text-muted-foreground mt-2">
                    Add a song to the bus playlist to start listening.
                </p>
                <Button onClick={() => router.push('/music')} className="mt-4">
                    Go to Music
                </Button>
            </div>
        );
    }
    
    const formatDuration = (ms: number, p: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const currentSeconds = Math.floor(totalSeconds * (p / 100));
        
        const formatTime = (seconds: number) => {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        return {
            currentTime: formatTime(currentSeconds),
            totalTime: formatTime(totalSeconds)
        };
    };

    const { currentTime, totalTime } = formatDuration(nowPlaying.duration, progress);

    const handleSaveToggle = () => {
        if (isSongSaved(nowPlaying.id)) {
            unsaveSong(nowPlaying.id);
        } else {
            saveSong(nowPlaying);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-primary/10 to-background">
             <header className="p-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                 <h1 className="text-lg font-semibold">{t('nowPlaying')}</h1>
                 <Button variant="ghost" size="icon" disabled>
                    <Share2 className="h-5 w-5" />
                </Button>
            </header>

            <main className="flex-grow flex flex-col justify-center items-center p-4 space-y-8">
                 <Avatar className="h-64 w-64 rounded-lg shadow-2xl">
                    <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />
                    <AvatarFallback className="rounded-lg"><Music/></AvatarFallback>
                </Avatar>

                <div className="text-center">
                    <h2 className="text-3xl font-bold truncate">{nowPlaying.title}</h2>
                    <p className="text-lg text-muted-foreground truncate">{nowPlaying.artist}</p>
                </div>

                <div className="w-full max-w-sm space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{currentTime}</span>
                        <span>{totalTime}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6 w-full max-w-sm">
                    <Button variant="ghost" size="icon" className="h-16 w-16" onClick={handleSaveToggle}>
                        <Heart className={cn('h-7 w-7', isSongSaved(nowPlaying.id) && 'fill-red-500 text-red-500')} />
                    </Button>
                    <div className="w-16 h-16"></div>
                    <div className="w-20 h-20"></div>
                     <div className="w-16 h-16"></div>
                    <Button variant="ghost" size="icon" className="h-16 w-16" disabled>
                         <ListMusic className="h-7 w-7" />
                    </Button>
                </div>
            </main>
        </div>
    )
}


// =================================================================================================
// FILE: src/app/music/page.tsx
// =================================================================================================

'use client';

import { useState, useEffect }from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Music, Mic, ListMusic, Plus, X, Heart, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useLanguage } from '@/context/language-context';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTracks as searchSpotifyTracks, searchArtists, getArtist, getArtistAlbums, getAlbumTracks } from '@/lib/spotify';
import { useTrip } from '@/context/trip-context';
import { useMusic, Track } from '@/context/music-context';
import { NowPlayingIcon } from '@/components/icons/now-playing-icon';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { getRecommendations } from '@/ai/flows/get-recommendations-flow';
import { useUserPreferences } from '@/context/user-preferences-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSavedSongs } from '@/context/saved-songs-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';


const genres = [
    { name: "Highlife", color: "bg-red-500", imageId: "music-art-1" },
    { name: "Hiplife", color: "bg-blue-500", imageId: "music-art-2" },
    { name: "Afrobeats", color: "bg-purple-500", imageId: "music-art-3" },
    { name: "Gospel", color: "bg-green-500", imageId: "music-art-4" },
];

const popularArtists = [
    { name: "Sarkodie", imageId: "artist-sarkodie" },
    { name: "Stonebwoy", imageId: "artist-stonebwoy" },
    { name: "Shatta Wale", imageId: "artist-shatta-wale" },
    { name: "E.L.", imageId: "artist-el" },
];

function ArtistDetailView({ artistId, onBack, onAddSong, activeTrip, isSongSaved, handleSaveToggle }: { artistId: string, onBack: () => void, onAddSong: (track: Track) => void, activeTrip: boolean, isSongSaved: (id: string) => boolean, handleSaveToggle: (track: Track) => void }) {
    const [artist, setArtist] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [artistData, albumsData] = await Promise.all([
                    getArtist(artistId),
                    getArtistAlbums(artistId, 20)
                ]);
                setArtist(artistData);
                setAlbums(albumsData);
            } catch (error) {
                console.error("Failed to fetch artist details", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not load artist details." });
            }
            setIsLoading(false);
        };
        fetchData();
    }, [artistId, toast]);

    const handleAlbumClick = async (album: any) => {
        setSelectedAlbum(album);
        setIsLoadingTracks(true);
        const tracks = await getAlbumTracks(album.id);
        setSelectedAlbumTracks(tracks);
        setIsLoadingTracks(false);
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!artist) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Artist not found.</p></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold truncate">{artist.name}</h1>
            </header>

            <main className="flex-grow">
                 <div className="relative h-48 w-full">
                    <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={artist.images[0]?.url} alt={artist.name} className="object-cover" />
                        <AvatarFallback className="rounded-none"><Music /></AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <h2 className="text-4xl font-bold text-foreground truncate">{artist.name}</h2>
                        <p className="text-muted-foreground">{artist.followers.total.toLocaleString()} followers</p>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <h3 className="text-xl font-bold">Albums</h3>
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="flex space-x-4">
                            {albums.map(album => (
                                <div key={album.id} className="w-36 flex-shrink-0 cursor-pointer" onClick={() => handleAlbumClick(album)}>
                                    <Avatar className="h-36 w-36 rounded-md border">
                                        <AvatarImage src={album.images[0]?.url} alt={album.name} />
                                        <AvatarFallback className="rounded-md"><Music /></AvatarFallback>
                                    </Avatar>
                                    <p className="mt-2 text-sm font-semibold truncate">{album.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(album.release_date).getFullYear()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedAlbum && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">{selectedAlbum.name}</h3>
                            <Card>
                                <CardContent className="p-2">
                                     {isLoadingTracks ? (
                                        <div className="flex justify-center items-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                     ) : selectedAlbumTracks.map((track) => (
                                        <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                            <div className='flex-grow overflow-hidden'>
                                                <p className='font-semibold truncate'>{track.name}</p>
                                                <p className='text-sm text-muted-foreground truncate'>{track.artists.map((a: any) => a.name).join(', ')}</p>
                                            </div>
                                            <p className='text-sm text-muted-foreground font-mono'>{formatDuration(track.duration_ms)}</p>
                                             <div className="flex items-center flex-shrink-0">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    const trackToAdd: Track = {
                                                        id: track.id, title: track.name, artist: track.artists[0].name,
                                                        albumArt: selectedAlbum?.images[0]?.url || artist.images[0]?.url,
                                                        duration: track.duration_ms, artistId: track.artists[0].id
                                                    };
                                                    handleSaveToggle(trackToAdd);
                                                }}>
                                                    <Heart className={cn('h-5 w-5', isSongSaved(track.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    const trackToAdd: Track = {
                                                        id: track.id, title: track.name, artist: track.artists[0].name,
                                                        albumArt: selectedAlbum?.images[0]?.url || artist.images[0]?.url,
                                                        duration: track.duration_ms, artistId: track.artists[0].id
                                                    };
                                                    onAddSong(trackToAdd);
                                                }} disabled={!activeTrip}>
                                                    <Plus className='h-5 w-5' />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}


export default function MusicPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Track[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [searchType, setSearchType] = useState<'track' | 'artist'>('track');
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { activeTrip } = useTrip();
    const { playlist, nowPlaying, addSong, removeSong } = useMusic();
    const { savedSongs, saveSong, unsaveSong, isSongSaved, isHydrated: isSavedSongsHydrated } = useSavedSongs();
    const { toast } = useToast();
    const { preferences } = useUserPreferences();


    useEffect(() => {
        if (!isSavedSongsHydrated) return;

        const saveSongWithToast = (song: Track) => {
            if (isSongSaved(song.id)) return;
            saveSong(song);
            toast({ title: "Song Saved", description: `${song.title} has been added to your saved songs.` });
        };

        const unsaveSongWithToast = (songId: string) => {
            const song = savedSongs.find(s => s.id === songId);
            if (!song) return;
            unsaveSong(songId);
            toast({ title: "Song Unsaved", description: `${song.title} has been removed.` });
        };

    }, [isSavedSongsHydrated, isSongSaved, saveSong, unsaveSong, savedSongs, toast]);


    useEffect(() => {
        const fetchRecommendations = async () => {
            if (preferences?.music && recommendations.length === 0) {
                setIsLoadingRecommendations(true);
                try {
                    const result = await getRecommendations({ favoriteMusic: preferences.music });
                    
                    const recommendedTracks: Track[] = result.recommendations.map((item: any) => ({
                        id: item.id,
                        title: item.name,
                        artist: item.artists[0].name,
                        albumArt: item.album.images[0]?.url,
                        duration: item.duration_ms,
                        artistId: item.artists[0].id,
                    }));

                    setRecommendations(recommendedTracks);
                } catch (error) {
                    console.error("Failed to fetch recommendations:", error);
                    toast({
                        variant: 'destructive',
                        title: "Couldn't get recommendations",
                        description: "There was an issue getting AI recommendations."
                    });
                }
                setIsLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [preferences, recommendations.length, toast]);

    useEffect(() => {
        const search = async () => {
            if (debouncedSearchTerm) {
                setIsLoading(true);
                const results = searchType === 'track' 
                    ? await searchSpotifyTracks(debouncedSearchTerm, 20)
                    : await searchArtists(debouncedSearchTerm, 20);

                const formattedResults = results.map(item => ({
                    id: item.id,
                    title: item.name,
                    artist: item.artists?.[0]?.name,
                    albumArt: item.album?.images[0]?.url || item.images?.[0]?.url,
                    duration: item.duration_ms,
                    type: item.type,
                    followers: item.followers?.total,
                    artistId: item.type === 'artist' ? item.id : item.artists?.[0].id,
                }));
                setSearchResults(formattedResults);
                setIsLoading(false);
            } else {
                setSearchResults([]);
            }
        };
        search();
    }, [debouncedSearchTerm, searchType]);

    const handleAddSong = (song: Track) => {
        if (!activeTrip) {
            toast({
                variant: "destructive",
                title: t('notOnBusToastTitle'),
                description: t('notOnBusToastDescription'),
            });
            return;
        }
        if (playlist.find(s => s.id === song.id) || nowPlaying?.id === song.id) {
             toast({
                variant: "destructive",
                title: t('alreadyInPlaylistToastTitle'),
                description: t('alreadyInPlaylistToastDescription', { title: song.title }),
            });
            return;
        }
        addSong(song, "user-id"); // Mock user ID
        toast({
            title: t('addedToPlaylistToastTitle'),
            description: t('addedToPlaylistToastDescription', { title: song.title, artist: song.artist }),
        });
        setSearchTerm('');
    };

    const handleRemoveSong = (songId: string) => {
        const song = playlist.find(s => s.id === songId);
        if(song) {
            removeSong(songId, "user-id");
            toast({
                title: t('songRemovedToastTitle'),
                description: t('songRemovedToastDescription'),
            });
        }
    };

    const handleSaveToggle = (track: Track) => {
        if (isSongSaved(track.id)) {
            unsaveSong(track.id);
        } else {
            saveSong(track);
        }
    };
    
    const handleArtistSelect = async (artist: any) => {
        if (artist.type === 'artist') {
            setSelectedArtistId(artist.id);
        } else if (artist.artistId) {
             const artists = await searchArtists(artist.artist, 1);
             if (artists.length > 0) {
                setSelectedArtistId(artists[0].id);
             }
        }
    };
    
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    const renderTrackItem = (track: any) => (
        <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
            <Avatar className='h-12 w-12 rounded-md flex-shrink-0'>
                {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
            </Avatar>
            <div className='flex-grow overflow-hidden'>
                <p className='font-semibold truncate'>{track.title}</p>
                {track.artist && 
                    <div onClick={(e) => { e.stopPropagation(); handleArtistSelect(track); }} className='text-sm text-muted-foreground truncate hover:underline cursor-pointer'>
                        {track.artist}
                    </div>
                }
            </div>
            {track.duration && <p className='text-sm text-muted-foreground font-mono hidden sm:block mx-2'>{formatDuration(track.duration)}</p>}
            <div className='flex items-center flex-shrink-0'>
                 <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSaveToggle(track); }}>
                    <Heart className={cn('h-5 w-5', isSongSaved(track.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                </Button>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAddSong(track); }} disabled={!activeTrip}>
                    <Plus className='h-5 w-5' />
                </Button>
            </div>
        </div>
    );
    
    const renderArtistItem = (artist: any) => (
         <div key={artist.id} onClick={() => handleArtistSelect(artist)} className="block cursor-pointer">
            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className='h-12 w-12 rounded-full'>
                    {artist.albumArt && <AvatarImage src={artist.albumArt} alt={artist.title} />}
                    <AvatarFallback className='rounded-full'><Mic /></AvatarFallback>
                </Avatar>
                <div className='flex-grow overflow-hidden'>
                    <p className='font-semibold truncate'>{artist.title}</p>
                    {artist.followers && <p className='text-sm text-muted-foreground'>{artist.followers.toLocaleString()} followers</p>}
                </div>
            </div>
        </div>
    );

    if (selectedArtistId) {
        return <ArtistDetailView 
            artistId={selectedArtistId} 
            onBack={() => setSelectedArtistId(null)}
            onAddSong={handleAddSong}
            activeTrip={!!activeTrip}
            isSongSaved={isSongSaved}
            handleSaveToggle={handleSaveToggle}
        />
    }

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow p-4 pb-48">
        <div className="max-w-md mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('music')}</h1>
                <div className='flex items-center gap-2'>
                    {activeTrip && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ListMusic className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>{t('busPlaylist')}</SheetTitle>
                                </SheetHeader>
                                <div className="py-4 h-full">
                                {nowPlaying ? (
                                    <div className='space-y-4'>
                                        <div className="flex items-center gap-4 p-2 rounded-lg bg-muted">
                                            <div className='flex-grow flex items-center gap-4 cursor-pointer overflow-hidden' onClick={() => router.push('/music/now-playing')}>
                                                <Avatar className='h-12 w-12 rounded-md'>
                                                    {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                                                    <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-hidden">
                                                    <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                                                    <p className='text-sm text-muted-foreground truncate'>{nowPlaying.artist}</p>
                                                </div>
                                            </div>
                                            <NowPlayingIcon />
                                        </div>

                                        {playlist.length > 0 && (
                                            <div className='space-y-2'>
                                                 <h3 className="text-md font-semibold">{t('upNext')}</h3>
                                                 <div className='h-[60vh] overflow-y-auto pr-4 no-scrollbar'>
                                                    <div className='space-y-2'>
                                                        {playlist.map((track, index) => (
                                                            <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                                                <span className='font-mono text-muted-foreground text-sm w-4 text-center'>{index + 1}</span>
                                                                <div className='flex-grow overflow-hidden'>
                                                                    <p className='font-medium text-sm truncate'>{track.title}</p>
                                                                    <p className='text-xs text-muted-foreground truncate'>{track.artist}</p>
                                                                </div>
                                                                <Button size="icon" variant="ghost" className='h-8 w-8' onClick={() => handleRemoveSong(track.id)}>
                                                                    <X className='h-4 w-4' />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[70vh] text-muted-foreground">
                                        <Music className="h-16 w-16 mb-4" />
                                        <h2 className="text-xl font-semibold">{t('noSongsAdded')}</h2>
                                        <p className="mt-2">{t('browseAndAddSongs')}</p>
                                    </div>
                                )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Saved Songs</SheetTitle>
                            </SheetHeader>
                            <div className="py-4 h-full">
                                {isSavedSongsHydrated && savedSongs.length > 0 ? (
                                    <div className="h-[85vh] overflow-y-auto no-scrollbar">
                                        <div className="space-y-2">
                                            {savedSongs.map(track => (
                                                 <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                                                    <Avatar className='h-12 w-12 rounded-md flex-shrink-0'>
                                                        {track.albumArt && <AvatarImage src={track.albumArt} alt={track.title} />}
                                                        <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                                                    </Avatar>
                                                    <div className='flex-1 w-0 overflow-hidden'>
                                                        <p className='font-semibold truncate'>{track.title}</p>
                                                        <p className='text-sm text-muted-foreground truncate'>{track.artist}</p>
                                                    </div>
                                                    <div className="flex items-center flex-shrink-0">
                                                        <Button size="icon" variant="ghost" onClick={() => handleAddSong(track)} disabled={!activeTrip}>
                                                            <Plus className='h-5 w-5' />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="icon" variant="ghost">
                                                                    <Trash2 className='h-5 w-5 text-destructive' />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Unsave Song?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove "{track.title}" from your saved songs?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => unsaveSong(track.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Unsave
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[70vh] text-muted-foreground">
                                        <Heart className="h-16 w-16 mb-4" />
                                        <h2 className="text-xl font-semibold">No Saved Songs</h2>
                                        <p className="mt-2">Tap the heart icon on a song to save it here.</p>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
                    {searchType === 'track' ? <Music /> : <Mic />}
                </div>
                <Input
                    placeholder={searchType === 'track' ? t('searchSongsPlaceholder') : "Search for artists"}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <div className='absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-background'>
                    <Button 
                        size="sm" 
                        variant={searchType === 'track' ? 'secondary' : 'ghost'} 
                        className="h-8"
                        onClick={() => setSearchType('track')}
                    >
                        Tracks
                    </Button>
                    <Button 
                        size="sm" 
                        variant={searchType === 'artist' ? 'secondary' : 'ghost'}
                        className="h-8"
                        onClick={() => setSearchType('artist')}
                    >
                        Artists
                    </Button>
                </div>
            </div>
            
            {searchTerm ? (
                 <div className="space-y-4 mt-6">
                    <h2 className="text-xl font-semibold">{t('searchResultsFor', { query: searchTerm })}</h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                            {searchResults.map(item => item.type === 'artist' ? renderArtistItem(item) : renderTrackItem(item))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">{t('noTracksFound')}</p>
                    )}
                 </div>
            ) : (
                <div className="space-y-8 mt-4">
                    
                    {recommendations.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold">Recommended For You</h2>
                            <p className="text-sm text-muted-foreground mb-3">Based on your love for {preferences?.music}</p>
                            <div className="space-y-1">
                                {recommendations.slice(0, 5).map(renderTrackItem)}
                            </div>
                        </div>
                    )}
                     {isLoadingRecommendations && (
                        <div className="flex justify-center items-center py-8">
                            <p className='text-muted-foreground'>Getting AI recommendations...</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('genres')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {genres.map(genre => {
                                const image = PlaceHolderImages.find(p => p.id === genre.imageId);
                                return (
                                <Card key={genre.name} className="relative overflow-hidden text-white cursor-pointer h-28 hover:scale-105 transition-transform">
                                    {image && <img src={image.imageUrl} alt={genre.name} className='absolute inset-0 w-full h-full object-cover'/>}
                                    <div className='absolute inset-0 bg-black/40'></div>
                                    <CardContent className="p-4 relative">
                                        <h3 className="font-bold">{genre.name}</h3>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-semibold mb-4">Popular Artists</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {popularArtists.map(artist => {
                                const image = PlaceHolderImages.find(p => p.id === artist.imageId);
                                return (
                                <div key={artist.name} onClick={async () => {
                                    const artists = await searchArtists(artist.name, 1);
                                    if (artists.length > 0) {
                                        handleArtistSelect(artists[0]);
                                    }
                                }}>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer">
                                        <Avatar className="h-16 w-16">
                                            {image && <AvatarImage src={image.imageUrl} alt={artist.name} />}
                                            <AvatarFallback><Mic /></AvatarFallback>
                                        </Avatar>
                                        <p className="text-xs font-semibold text-center truncate w-full">{artist.name}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

       {nowPlaying && activeTrip && (
            <div className="fixed bottom-[80px] left-0 right-0 z-20 p-2 pointer-events-none">
                <Card 
                    className="max-w-md mx-auto bg-background/80 backdrop-blur-sm shadow-lg pointer-events-auto"
                >
                    <CardContent className="p-2 flex items-center gap-4">
                        <div className='flex-grow flex items-center gap-4 cursor-pointer overflow-hidden' onClick={() => router.push('/music/now-playing')}>
                            <Avatar className='h-10 w-10 rounded-md flex-shrink-0'>
                                {nowPlaying.albumArt && <AvatarImage src={nowPlaying.albumArt} alt={nowPlaying.title} />}
                                <AvatarFallback className='rounded-md'><Music /></AvatarFallback>
                            </Avatar>
                            <div className='flex-grow overflow-hidden'>
                                <p className='font-semibold truncate text-primary'>{nowPlaying.title}</p>
                                <p className='text-sm text-muted-foreground truncate'>{nowPlaying.artist}</p>
                            </div>
                        </div>
                        <div className='flex items-center'>
                           <NowPlayingIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

      <div className="sticky bottom-0 z-10">
        <BottomNav />
      </div>
    </div>
  );
}




// =================================================================================================
// FILE: src/app/page.tsx
// =================================================================================================

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { IconMosaicBackground } from '@/components/icon-mosaic-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/language-context';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate a logged-out state.
  useEffect(() => {
    // In a real app, you might check for a token here.
    // For now, we just show the login page.
    setLoading(false);
  }, []);
  
  const handleSignInSuccess = () => {
    router.push('/home');
  }
  
  const handleSignUpSuccess = () => {
    setShowSlideshow(true);
  }

  const handleFinishSlideshow = () => {
      router.push('/home');
  }

  if (showSlideshow) {
      return <SignupSlideshow onFinish={handleFinishSlideshow} />;
  }

  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      <IconMosaicBackground />
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center">
            <Image
                src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
                alt="Eritas Transport Company Logo"
                width={150}
                height={75}
                priority
                className="mx-auto object-contain"
            />
          <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to continue
          </p>
        </div>
        <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm mt-4">
                    <AuthForm mode="signin" onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
                </div>
            </TabsContent>
            <TabsContent value="signup">
                <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm mt-4">
                    <AuthForm mode="signup" onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/search/page.tsx
// =================================================================================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, BusFront, X, Flag, Users, Loader2, Clock, Armchair, QrCode, Bell, Trash2, MapPin, Bus, Send, Footprints } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BusSeatingChart } from '@/components/bus-seating-chart';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBusArrivalNotification } from '@/hooks/use-bus-arrival-notification';
import { TripRating } from '@/components/trip-rating';
import { useWallet } from '@/context/wallet-context';
import { useNotification, Notification } from '@/context/notification-context';
import { useTrip } from '@/context/trip-context';

const initialBusData = [
    {
      id: 'bus-1',
      driver: 'Kofi Mensah',
      plate: 'GT 4589-23',
      eta: 1,
      capacity: { current: 35, max: 52 },
      stops: [
        { name: 'Adenta', fare: 5.00, eta: 5 },
        { name: 'Madina', fare: 7.50, eta: 15 },
      ],
      finalDestination: { name: 'Atomic Junction', fare: 10.00, eta: 25 },
      position: { top: '45%', left: '25%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: [
        { id: '1A', isOccupied: false }, { id: '2A', isOccupied: true }, { id: '3A', isOccupied: false }, { id: '4A', isOccupied: false },
        { id: '1B', isOccupied: false }, { id: '1C', isOccupied: true }, { id: '2B', isOccupied: false }, { id: '2C', isOccupied: true },
        { id: '3B', isOccupied: true }, { id: '3C', isOccupied: false }, { id: '4B', isOccupied: false }, { id: '4C', isOccupied: false },
      ].concat(Array.from({ length: 13 }, (_, i) => ({ id: `5${String.fromCharCode(65 + i)}`, isOccupied: Math.random() > 0.5 })))
    },
    {
      id: 'bus-2',
      driver: 'Ama Serwaa',
      plate: 'AS 1234-24',
      eta: 25,
      capacity: { current: 48, max: 48 },
      stops: [
        { name: 'Circle', fare: 6.00, eta: 10 },
        { name: 'Kaneshie', fare: 8.50, eta: 20 },
      ],
      finalDestination: { name: 'Mallam', fare: 12.00, eta: 30 },
      position: { top: '55%', left: '65%' },
      driverImage: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
      seating: Array.from({ length: 25 }, (_, i) => ({ id: `${Math.floor(i/5)+1}${String.fromCharCode(65 + (i % 5 > 1 ? i%5-1 : i%5))}`, isOccupied: true }))
    },
];

type BusData = typeof initialBusData[0];
type StopInfo = { name: string; fare: number; eta: number };
type PassedBusInfo = {
    nextStop: StopInfo;
    walkingTime: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fromQuery = searchParams.get('from') || '';
  const toQuery = searchParams.get('to') || '';

  const [fromLocation, setFromLocation] = useState(fromQuery);
  const [toLocation, setToLocation] = useState(toQuery);
  const [isHydrated, setIsHydrated] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { balance, addTransaction, isHydrated: isWalletHydrated } = useWallet();
  const { addNotification } = useNotification();
  const { activeTrip, startTrip, isHydrated: isTripHydrated } = useTrip();
  
  const [buses, setBuses] = useState(initialBusData);
  const [filteredBuses, setFilteredBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [passedBusInfo, setPassedBusInfo] = useState<PassedBusInfo | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    if(activeTrip) {
        router.push('/home');
    }
  }, [activeTrip, router]);

  useEffect(() => {
    if (isHydrated) {
        if (fromQuery || toQuery) {
            const results = buses.filter(bus => {
                const allStops = [...bus.stops.map(s => s.name.toLowerCase()), bus.finalDestination.name.toLowerCase()];
                const isFromCurrentLocation = fromQuery === 'Your Current Location';
                
                const fromMatch = isFromCurrentLocation ? true : allStops.some(stop => stop.includes(fromQuery.toLowerCase()));
                
                const toMatch = toQuery ? allStops.some(stop => stop.includes(toQuery.toLowerCase())) : true;
                
                return fromMatch && toMatch;
            });
            setFilteredBuses(results);
        } else {
            setFilteredBuses([]);
        }
    }
}, [fromQuery, toQuery, buses, isHydrated]);


  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  const handleBusSelect = (bus: BusData) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setPassedBusInfo(null);

    if (bus.eta <= 0 && bus.stops.length > 0) {
        const nextStop = bus.stops[0];
        const walkingTime = 5 + Math.floor(Math.random() * 10);
        setPassedBusInfo({ nextStop, walkingTime });
    }
  }
  
  const clearSelectedBus = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassedBusInfo(null);
  }

  const handleBoard = (bus: BusData, stop: StopInfo) => {
    if(!selectedSeats.length || !isWalletHydrated) return;
    
    const totalFare = stop.fare * selectedSeats.length;

    if (balance < totalFare) {
        toast({
            variant: "destructive",
            title: t('insufficientBalanceToastTitle'),
            description: t('insufficientBalanceToastDescription'),
        });
        return;
    }

    setIsBoarding(true);
    setTimeout(() => {
        addTransaction({
            type: 'payment',
            amount: -totalFare,
            description: `Bus ticket to ${bus.finalDestination.name}`,
            plate: bus.plate,
        });

        const tripId = uuidv4();
        const primarySeat = selectedSeats[0];
        const qrData = { tripId: tripId, bus: bus.plate, seat: primarySeat, from: stop.name, to: bus.finalDestination.name, fare: totalFare / selectedSeats.length, timestamp: new Date().toISOString() };
        const encodedQrData = encodeURIComponent(JSON.stringify(qrData));
        const newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedQrData}`;
        setQrCodeUrl(newQrCodeUrl);
        
        let toastDescription = t('fareDeductedToastDescription', { fare: totalFare.toFixed(2) });

        toast({
            title: t('seatBookedToastTitle'),
            description: toastDescription,
            action: (
                <Button variant="outline" size="sm" onClick={() => setIsQrSheetOpen(true)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    {t('viewQrCode')}
                </Button>
            )
        });

        addNotification({
            title: t('yourBoardingPass'),
            description: `${t('showQrToDriver')} (${bus.plate} - ${t('seat')}: ${primarySeat})`,
            tripId: tripId,
            action: (
                <div className="mt-2 flex justify-center">
                    <Image src={newQrCodeUrl} alt={t('boardingQrCode')} width={150} height={150} />
                </div>
            )
        });
        
        startTrip({
            bus: bus,
            boardingStop: stop,
            seats: selectedSeats,
            tripId: tripId,
        });

        if (selectedSeats.length > 1) {
            addNotification({
                title: t('seatsReservedForOthers'),
                description: t('seatsReservedForOthersDescription'),
                action: (
                    <Button variant="default" size="sm" onClick={() => router.push('/share-trip')}>
                        <Send className="mr-2 h-4 w-4" />
                        {t('sendToRecipient')}
                    </Button>
                )
            });
        }
        setIsBoarding(false);
        clearSelectedBus();
        router.push('/home'); // Redirect to home to see the active trip
    }, 1500);
  }

  const handleSeatSelect = (seatId: string) => {
    if (selectedBus) {
        const seat = selectedBus.seating.find(s => s?.id === seatId);
        if (seat && !seat.isOccupied) {
            setSelectedSeats(prevSeats => {
                if (prevSeats.includes(seatId)) {
                    return prevSeats.filter(s => s !== seatId);
                } else {
                    return [...prevSeats, seatId];
                }
            });
        }
    }
  }
  
  const handleConfirmSeat = () => {
    setIsSeatSheetOpen(false);
  }
  
  if (!isHydrated || !isTripHydrated) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const displayedBus = selectedBus;
  const primarySeat = (Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats[0] : null);

  const allStops = displayedBus ? [...displayedBus.stops, displayedBus.finalDestination] : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-20 bg-background/75 backdrop-blur-sm p-4 shadow-sm">
            <div className="max-w-md mx-auto space-y-4">
                 <div className="flex justify-center">
                    <Image
                        src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
                        alt="Eritas Transport Company Logo"
                        width={120}
                        height={60}
                        priority
                        className="object-contain"
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder={t('from')} 
                        className='pl-10' 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        />
                    </div>
                    <div className="p-2 rounded-full bg-muted">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder={t('to')}
                        className='pl-10'
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleSearch} className="w-full">
                    <Search className='mr-2 h-5 w-5' />
                    {t('searchForBuses')}
                </Button>
            </div>
        </header>

        <main className="flex-grow p-4 pb-20">
             <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-[80px]">
                {displayedBus && (
                <div className="p-2 sm:p-4 pointer-events-auto">
                    <div className="bg-background/75 backdrop-blur-sm rounded-t-2xl max-w-md mx-auto shadow-lg p-4 space-y-3">
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {displayedBus.driverImage && <AvatarImage src={displayedBus.driverImage} alt={displayedBus.driver} />}
                                        <AvatarFallback>{displayedBus.driver.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{displayedBus.driver}</h2>
                                        <p className="text-sm text-muted-foreground font-mono">{displayedBus.plate}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={clearSelectedBus} className="h-8 w-8 -mt-1 -mr-2">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {passedBusInfo ? (
                                <Card className="bg-amber-50 border border-amber-200">
                                    <CardContent className="p-4 text-sm text-amber-900 space-y-3">
                                        <p>This bus has passed your current location. The next available stop you can board is:</p>
                                        <div className='font-semibold text-center bg-amber-100 p-2 rounded-md'>
                                            <p className='text-base'>{passedBusInfo.nextStop.name}</p>
                                            <div className='flex justify-center items-center gap-4 text-xs mt-1'>
                                                <span className='flex items-center gap-1'><Bus className='h-3 w-3' /> Bus ETA: {passedBusInfo.nextStop.eta} min</span>
                                                <span className='flex items-center gap-1'><Footprints className='h-3 w-3' /> Your ETA: {passedBusInfo.walkingTime} min</span>
                                            </div>
                                        </div>
                                        <Button className='w-full' onClick={() => handleBoard(displayedBus, passedBusInfo.nextStop)} disabled={selectedSeats.length === 0}>
                                            {selectedSeats.length > 0 ? `Reserve Seat for ${passedBusInfo.nextStop.name}` : "Select a seat first"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Sheet open={isSeatSheetOpen} onOpenChange={setIsSeatSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className='w-full'>
                                            <Armchair className="mr-2 h-5 w-5" />
                                            {selectedSeats.length > 0 ? t('seatsSelected', { count: selectedSeats.length }) : t('viewSeats')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="rounded-t-2xl">
                                        <SheetHeader><SheetTitle>{t('selectYourSeat')}</SheetTitle></SheetHeader>
                                        <BusSeatingChart 
                                            seating={displayedBus.seating}
                                            selectedSeats={selectedSeats}
                                            onSeatSelect={handleSeatSelect}
                                            busPlate={displayedBus.plate}
                                            onConfirm={handleConfirmSeat}
                                        />
                                    </SheetContent>
                                </Sheet>
                            )}

                            <Separator />

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2"><Users className="h-4 w-4" />{t('busCapacity')}</h3>
                                    <p className="text-sm font-mono text-muted-foreground">{displayedBus.capacity.current} / {displayedBus.capacity.max} {t('seats')}</p>
                                </div>
                                <Progress value={(displayedBus.capacity.current / displayedBus.capacity.max) * 100} className="h-2" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-foreground/80 mb-2">{t('busFares')}:</h3>
                                <Accordion type="single" collapsible className="w-full">
                                    {[...displayedBus.stops, { ...displayedBus.finalDestination, isFinal: true }].map((stop, index) => {
                                        let fare = stop.fare;
                                        return (
                                            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                                <AccordionTrigger className="py-2 rounded-lg hover:bg-muted/50 px-2 data-[state=open]:bg-muted">
                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${stop.isFinal ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                                                                {stop.isFinal ? <Flag className="h-3 w-3 text-primary" /> : <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                            </div>
                                                            <p className={`text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{stop.name} {stop.isFinal && `(${t('final')})`}</p>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <p className={`font-mono text-sm ${stop.isFinal ? 'font-semibold text-primary' : 'text-foreground'}`}>{t('farePerSeat', { fare: fare.toFixed(2) })}</p>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="px-3 pt-2 pb-2 text-center">
                                                    {passedBusInfo ? (
                                                        <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">This bus has passed. Please use the option above.</p>
                                                    ) : displayedBus.capacity.current + selectedSeats.length > displayedBus.capacity.max ? (
                                                        <p className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">{t('notEnoughSeats')}</p>
                                                    ) : (
                                                        <Button className='w-full' onClick={() => handleBoard(displayedBus, stop)} disabled={isBoarding || selectedSeats.length === 0}>
                                                            {isBoarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedSeats.length === 0 ? t('selectBusSeatFirst') : t('board')}
                                                        </Button>
                                                    )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
                )}
            </div>

            <div className="max-w-md mx-auto mt-4">
                 {(fromQuery || toQuery) && !displayedBus && (
                    <div className='space-y-4'>
                        <h1 className="text-xl font-bold text-foreground">{t('showingResultsFor')}:</h1>
                        <p className="text-muted-foreground -mt-2"><span className='font-semibold text-foreground'>{fromQuery}</span> to <span className='font-semibold text-foreground'>{toQuery}</span></p>

                        {filteredBuses.length > 0 ? (
                            filteredBuses.map(bus => (
                                <Card key={bus.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleBusSelect(bus)}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className='h-12 w-12'>
                                            {bus.driverImage && <AvatarImage src={bus.driverImage} alt={bus.driver} />}
                                            <AvatarFallback>{bus.driver.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex-grow'>
                                            <p className='font-bold'>{bus.driver}</p>
                                            <p className='text-sm text-muted-foreground font-mono'>{bus.plate}</p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-semibold'>{t('minutesAbbr', { minutes: bus.eta })}</p>
                                            <p className='text-xs text-muted-foreground'>{t('eta')}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <Card>
                                <CardContent className='p-8 text-center text-muted-foreground'>
                                    <p>{t('noBusesFound')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
                 {!(fromQuery || toQuery) && !displayedBus && (
                    <div className="text-center mt-16 text-muted-foreground">
                        <Search className="h-16 w-16 text-muted-foreground/30 mb-4 mx-auto" />
                        <h1 className="text-2xl font-bold text-foreground">{t('findYourBus')}</h1>
                        <p className="mt-2">{t('enterDestinationToSeeBuses')}</p>
                    </div>
                )}
            </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-10">
            <BottomNav />
        </div>

        <Sheet open={isQrSheetOpen} onOpenChange={setIsQrSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader><SheetTitle>{t('yourBoardingPass')}</SheetTitle></SheetHeader>
                <div className="p-4 flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt={t('boardingQrCode')} width={200} height={200} />
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">{t('showQrToDriver')}</p>
                        <div className="flex items-center gap-4 justify-center">
                            <Badge variant="outline">{displayedBus?.plate}</Badge>
                            {primarySeat && <Badge>{t('seat')}: {primarySeat}</Badge>}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  );
}

    


// =================================================================================================
// FILE: src/app/settings/edit-profile/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Save, User as UserIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/language-context';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine(data => {
    if(data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Current password is required to set a new one.",
    path: ["currentPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  useEffect(() => {
    form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
    });
  }, [user, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    
    // Simulate upload and get a local URL
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newPhotoURL = URL.createObjectURL(file);
    setUser(prev => ({...prev, photoURL: newPhotoURL})); // Update local mock user state

    toast({
        title: "Profile Picture Updated",
        description: "Your new profile picture has been saved.",
    });

    setIsUploading(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);

        const updatedUser = {...user, displayName: data.displayName };
        setUser(updatedUser);

        toast({
            title: t('profileUpdatedToastTitle'),
            description: t('profileUpdatedToastDescription'),
        });

        if (data.newPassword) {
             toast({
                title: t('passwordUpdatedToastDescription'),
            });
        }
        
        router.back();

    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('editProfile')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className='relative'>
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                <AvatarFallback>
                  <UserIcon className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <Button 
                size="icon" 
                className='absolute bottom-0 right-0 rounded-full h-8 w-8'
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Camera className='h-4 w-4' />}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('fullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailAddressLabel')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('emailAddressPlaceholder')} {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password to change it" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newPasswordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('newPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirmNewPasswordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('confirmNewPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('saveChanges')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/linked-devices/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Laptop, Tablet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';

const initialDevices = [
  {
    id: 1,
    type: 'smartphone',
    name: 'Samsung Galaxy S24 Ultra',
    location: 'Accra, GH',
    lastActive: 'Online now',
    isCurrent: true,
  },
  {
    id: 2,
    type: 'laptop',
    name: 'Macbook Pro 14"',
    location: 'Kumasi, GH',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 3,
    type: 'tablet',
    name: 'iPad Air',
    location: 'Tema, GH',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

const deviceIcons = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
};

export default function LinkedDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState(initialDevices);
  const { t } = useLanguage();

  const handleUnlink = (deviceId: number) => {
    setDevices((prevDevices) => prevDevices.filter((device) => device.id !== deviceId));
    // Here you would also make an API call to invalidate the session for that device
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('linkedDevices')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('linkedDevicesDescription')}
          </p>

          {devices.map((device) => {
            const Icon = deviceIcons[device.type as keyof typeof deviceIcons];
            return (
              <Card key={device.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-grow">
                    <p className="font-semibold">{device.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.location} • {device.lastActive}
                    </p>
                  </div>
                  {device.isCurrent ? (
                    <Badge variant="secondary">{t('currentDevice')}</Badge>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('unlinkDeviceTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('unlinkDeviceDescription', { deviceName: device.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnlink(device.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {t('unlink')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/notifications/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificationSettings } from '@/context/notification-settings-context';
import { useLanguage } from '@/context/language-context';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    routeAlerts,
    setRouteAlerts,
    bookingAlerts,
    setBookingAlerts,
    systemAlerts,
    setSystemAlerts
  } = useNotificationSettings();
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('notifications')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <Label htmlFor="route-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <Bus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('routeAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('routeAlertsDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch 
                    id="route-alerts"
                    checked={routeAlerts}
                    onCheckedChange={setRouteAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <Label htmlFor="booking-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('bookingAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('bookingAlertsDescription')}
                        </p>
                    </div>
                   </Label>
                   <Switch 
                    id="booking-alerts"
                    checked={bookingAlerts}
                    onCheckedChange={setBookingAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                   <Label htmlFor="system-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('systemAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('systemAlertsDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch 
                    id="system-alerts"
                    checked={systemAlerts}
                    onCheckedChange={setSystemAlerts}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Smartphone,
  CreditCard,
  Bell,
  Lock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Palette } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const settingsOptions = [
  {
    icon: User,
    titleKey: 'editProfile',
    descriptionKey: 'editProfileDescription',
    href: '/settings/edit-profile',
  },
  {
    icon: Smartphone,
    titleKey: 'linkedDevices',
    descriptionKey: 'linkedDevicesDescriptionSettings',
    href: '/settings/linked-devices',
  },
  {
    icon: CreditCard,
    titleKey: 'paymentMethods',
    descriptionKey: 'paymentMethodsDescription',
    href: '/settings/payment-methods',
  },
  {
    icon: Bell,
    titleKey: 'notifications',
    descriptionKey: 'notificationsDescription',
    href: '/settings/notifications',
  },
  {
    icon: Lock,
    titleKey: 'securitySettings',
    descriptionKey: 'securitySettingsDescription',
    href: '/settings/security',
  },
];

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('profileSettings')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center -mt-2 mb-6">
            {isLoading ? (
                <div className='h-24 w-24 flex items-center justify-center'>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : user ? (
                <>
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-10 w-10"/>}
                    </AvatarFallback>
                </Avatar>
                <div className='text-center mt-2'>
                    <p className='font-bold text-xl'>{user.displayName}</p>
                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                </div>
                </>
            ) : (
                 <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarFallback>
                        <User className="h-10 w-10"/>
                    </AvatarFallback>
                </Avatar>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {settingsOptions.map((item) => {
                  const content = (
                      <div className="flex items-center gap-4 p-4">
                        <div className="p-2 bg-muted rounded-full">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold">{t(item.titleKey)}</p>
                          <p className="text-sm text-muted-foreground">
                            {t(item.descriptionKey)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                  );
                  
                  if (item.titleKey === 'linkedDevices') {
                    return (
                        <div key={item.titleKey} className="relative">
                            <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 flex items-center justify-center">
                                <Badge variant="destructive">Unavailable</Badge>
                            </div>
                            <div className="opacity-50 pointer-events-none">
                                {content}
                            </div>
                        </div>
                    )
                  }

                  if (item.href) {
                    return (
                      <Link href={item.href} key={item.titleKey} className="cursor-pointer hover:bg-muted/50 block">
                        {content}
                      </Link>
                    );
                  }
                  
                  return (
                    <div key={item.titleKey} className="cursor-pointer hover:bg-muted/50">
                        {content}
                    </div>
                  );
                })}
                 <div className="flex items-center gap-4 p-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('appTheme')}</p>
                        <p className="text-sm text-muted-foreground">
                        {t('appThemeDescription')}
                        </p>
                    </div>
                    <ThemeSwitcher />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/payment-methods/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { useWallet } from '@/context/wallet-context';
import { CashIcon } from '@/components/icons/cash-icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mobileMoneyAccounts = [
    { id: 1, provider: 'mtn', number: '+233 24 *** 4567' },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { balance, isHydrated } = useWallet();


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('paymentMethods')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* ERITAS Pay Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                ERITAS Pay
              </CardTitle>
              <CardDescription>{t('eritasPayDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{t('currentBalance')}</p>
                  {isHydrated ? (
                    <p className="text-2xl font-bold">GH₵ {balance.toFixed(2)}</p>
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  )}
                </div>
                <Link href="/top-up" passHref>
                    <Button>{t('topUp')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Cash Payment */}
          <Card className={cn("relative overflow-hidden")}>
             <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 flex items-center justify-center">
                <Badge variant="destructive">Unavailable</Badge>
             </div>
             <div className="opacity-50 pointer-events-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CashIcon className="h-6 w-6" />
                        {t('cashPayment')}
                    </CardTitle>
                    <CardDescription>{t('cashPaymentDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="cash" className="space-y-4">
                        <Label htmlFor="cash-payment" className="flex items-center justify-between p-4 border rounded-lg cursor-not-allowed has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <div className="flex items-center gap-4">
                                <CashIcon className="h-6 w-6 text-primary" />
                                <span className="font-medium">{t('payWithCash')}</span>
                            </div>
                            <RadioGroupItem value="cash" id="cash-payment" disabled />
                        </Label>
                    </RadioGroup>
                </CardContent>
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/recent-trips/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';

export default function RecentTripsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tripHistory: any[] = [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('recentTrips')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
                <CardTitle>{t('yourTripHistory')}</CardTitle>
                <CardDescription>{t('yourTripHistoryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {tripHistory.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                        {tripHistory.map((trip) => (
                            <div key={trip.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                    <AvatarFallback>
                                        <Bus className='w-5 h-5'/>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{t('tripOnBus', { plate: trip.plate })}</p>
                                    <p className="text-sm text-muted-foreground">{t('journeyDetailsPlaceholder')}</p>
                                </div>
                                <div className="font-semibold text-right">
                                    <p>GH₵{Math.abs(trip.amount).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground font-normal">{t('fare')}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                        <History className="h-12 w-12 mb-4" />
                        <h3 className="font-semibold">{t('noTripHistory')}</h3>
                        <p className="text-sm mt-1">{t('noTripHistoryDescription')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/saved-places/edit/page.tsx
// =================================================================================================

'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Save, Home, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useSavedPlaces } from '@/context/saved-places-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const placeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  icon: z.string().default('MapPin'),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

const iconOptions = [
  { value: 'Home', icon: Home },
  { value: 'Briefcase', icon: Briefcase },
  { value: 'MapPin', icon: MapPin },
];

function EditSavedPlaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get('id');
  const { places, addPlace, updatePlace } = useSavedPlaces();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = Boolean(placeId);
  const existingPlace = isEditing ? places.find(p => p.id === placeId) : undefined;
  
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: '',
      address: '',
      icon: 'MapPin',
    },
  });
  
  useEffect(() => {
    if (isEditing && existingPlace) {
      form.reset(existingPlace);
    }
  }, [isEditing, existingPlace, form]);
  

  const onSubmit = async (data: PlaceFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        if (isEditing && placeId) {
            updatePlace(placeId, data);
        } else {
            addPlace(data);
        }
        
        toast({
            title: t('placeSaved'),
            description: t('addressSavedSuccessfully'),
        });
        
        setIsSubmitting(false);
        router.back();
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{isEditing ? t('editSavedPlace') : t('addANewPlace')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {t('saveAddressForQuickAccess')}
          </p>
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Home, Work" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('enterAddressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            {iconOptions.map(({ value, icon: Icon }) => (
                               <FormItem key={value} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={value} id={`icon-${value}`} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={`icon-${value}`}
                                  className={`p-3 rounded-full border-2 cursor-pointer ${field.value === value ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'}`}
                                >
                                  <Icon className={`h-5 w-5 ${field.value === value ? 'text-primary' : 'text-muted-foreground'}`} />
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('savePlace')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function EditSavedPlacePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditSavedPlaceForm />
        </Suspense>
    )
}


// =================================================================================================
// FILE: src/app/settings/saved-places/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/language-context';
import { useSavedPlaces } from '@/context/saved-places-context';
import Link from 'next/link';

export default function SavedPlacesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { places, removePlace, isHydrated } = useSavedPlaces();

  const getIcon = (iconName: 'Home' | 'Briefcase' | string) => {
    switch (iconName) {
        case 'Home':
            return Home;
        case 'Briefcase':
            return Briefcase;
        default:
            return MapPin;
    }
  }

  if (!isHydrated) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('savedPlaces')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-4">
            <Card>
                 <CardHeader>
                    <CardTitle>{t('myPlaces')}</CardTitle>
                    <CardDescription>{t('myPlacesDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {places.map((place) => {
                        const Icon = getIcon(place.icon);
                        return (
                        <div key={place.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-muted rounded-full">
                                <Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{place.name}</p>
                                <p className="text-sm text-muted-foreground">{place.address}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/settings/saved-places/edit?id=${place.id}`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>{t('edit')}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                <span className="text-destructive">{t('remove')}</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('removePlaceTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('removePlaceDescription', { placeName: place.name })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => removePlace(place.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    {t('remove')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        )
                    })}
                    <Link href="/settings/saved-places/edit" passHref>
                        <Button variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('addPlace')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/security/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Fingerprint, SmartphoneNfc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSecuritySettings } from '@/context/security-settings-context';
import { useLanguage } from '@/context/language-context';

export default function SecurityPage() {
  const router = useRouter();
  const {
    isPinEnabled,
    setIsPinEnabled,
    is2faEnabled,
    setIs2faEnabled,
  } = useSecuritySettings();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('securitySettings')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-4 space-y-4">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="pin-login" className="flex items-center gap-4 cursor-pointer">
                        <div className="p-2 bg-muted rounded-full">
                            <KeyRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{t('pinLogin')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('pinLoginDescription')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        id="pin-login"
                        checked={isPinEnabled}
                        onCheckedChange={setIsPinEnabled}
                    />
                   </div>
                   {isPinEnabled && (
                     <div className="pl-12">
                       <Button variant="outline" size="sm">{t('changePin')}</Button>
                     </div>
                   )}
                </div>
                
                <div className="flex items-center justify-between p-4">
                   <Label htmlFor="2fa" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <SmartphoneNfc className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('twoFactorAuth')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('twoFactorAuthDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch
                    id="2fa"
                    checked={is2faEnabled}
                    onCheckedChange={setIs2faEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/settings/trip-qrs/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

export default function TripQrsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tripHistory: any[] = [];

  const generateQrCodeUrl = (tripData: any) => {
    const encodedData = encodeURIComponent(JSON.stringify(tripData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('tripQrCodes')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
                <CardTitle>{t('tripQrCodesTitle')}</CardTitle>
                <CardDescription>{t('tripQrCodesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {tripHistory.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                        {tripHistory.map((trip) => {
                            const qrData = {
                                tripId: trip.id,
                                plate: trip.plate,
                                amount: trip.amount,
                                type: trip.type,
                                timestamp: new Date().toISOString() // In a real app, you'd store the trip timestamp
                            };
                            const qrUrl = generateQrCodeUrl(qrData);

                            return (
                                <div key={trip.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <div className="p-2 border rounded-md">
                                        <Image src={qrUrl} alt={`QR Code for trip ${trip.plate}`} width={64} height={64} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{t('tripOnBus', { plate: trip.plate })}</p>
                                        <p className="text-sm text-muted-foreground">{t('journeyDetailsPlaceholder')}</p>
                                        <p className="font-semibold text-sm">GH₵{Math.abs(trip.amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                        <QrCode className="h-12 w-12 mb-4" />
                        <h3 className="font-semibold">{t('noTripQrs')}</h3>
                        <p className="text-sm mt-1">{t('noTripQrsDescription')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/share-trip/page.tsx
// =================================================================================================

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

export default function ShareTripPage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Since useTrip is removed, we just show a message.
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">{t('noActiveTripTitle')}</h1>
            <p className='text-muted-foreground'>{t('noActiveTripDescription')}</p>
            <Button onClick={() => router.push('/home')} className="mt-4">{t('goToHome')}</Button>
        </div>
    );
}

    


// =================================================================================================
// FILE: src/app/top-up/page.tsx
// =================================================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { useWallet } from '@/context/wallet-context';

const mobileMoneyNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: "https://momodeveloper.mtn.com/content/momo_mtnb.png" },
    { id: 'telecel', name: 'Telecel Cash', logo: 'https://play.telecel.com.gh/static/Rede-5f0f780acc6c05a6539d7e3229ac508c.webp' },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: 'https://www.bayfrontgardens.com/assets/img/payment/at.png' },
];

export default function TopUpPage() {
    const [network, setNetwork] = useState('mtn');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const { balance, addTransaction, isHydrated } = useWallet();

    const WALLET_THRESHOLD = 400;

    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isHydrated) return;

        const topUpAmount = parseFloat(amount);
        if (!topUpAmount || topUpAmount <= 0) {
            toast({
                variant: 'destructive',
                title: t('invalidAmountToastTitle'),
                description: t('invalidAmountToastDescription'),
            });
            return;
        }

        if (balance + topUpAmount > WALLET_THRESHOLD) {
             toast({
                variant: 'destructive',
                title: 'Transaction Limit Exceeded',
                description: `You cannot add more than GH₵${(WALLET_THRESHOLD - balance).toFixed(2)} to your wallet.`,
            });
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            addTransaction({
                type: 'top-up',
                amount: topUpAmount,
                description: `Mobile Money Top-up from ${phone}`,
            });
            
            toast({
                title: t('topUpSuccessfulToastTitle'),
                description: t('topUpSuccessfulToastDescription', { amount: topUpAmount.toFixed(2) }),
            });
            
            setIsProcessing(false);
            router.push('/eritas-pay');

        }, 1500);
    };


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
            <div className="max-w-md mx-auto flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold mx-auto">{t('topUpWallet')}</h1>
            </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
            <form onSubmit={handleTopUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('selectMomoNetwork')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={network} onValueChange={setNetwork} className="space-y-4">
                            {mobileMoneyNetworks.map((net) => {
                                return (
                                <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        {net.logo ? (
                                            <Image src={net.logo} alt={`${net.name} logo`} width={80} height={40} className='object-contain h-auto' />
                                        ) : (
                                            <div className='w-10 h-10 flex items-center justify-center'>
                                                <Wallet className='h-6 w-6 text-muted-foreground' />
                                            </div>
                                        )}
                                        <span className="font-medium">{net.name}</span>
                                    </div>
                                    <RadioGroupItem value={net.id} id={net.id} />
                                </Label>
                                )
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t('enterDetails')}</CardTitle>
                        <CardDescription>{t('enterDetailsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+233 24 123 4567" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('amountLabel')}</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder={t('amountExample')}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing || !isHydrated}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                    )}
                    {t('confirmTopUp')}
                </Button>
            </form>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/app/withdraw/page.tsx
// =================================================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { useWallet } from '@/context/wallet-context';

const mobileMoneyNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: "https://momodeveloper.mtn.com/content/momo_mtnb.png" },
    { id: 'telecel', name: 'Telecel Cash', logo: 'https://play.telecel.com.gh/static/Rede-5f0f780acc6c05a6539d7e3229ac508c.webp' },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: 'https://www.bayfrontgardens.com/assets/img/payment/at.png' },
];

export default function WithdrawPage() {
    const [network, setNetwork] = useState('mtn');
    const [phone, setPhone] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const { balance, addTransaction, isHydrated } = useWallet();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only digits and the '+' symbol at the start
        const sanitizedValue = value.replace(/[^0-9+]/g, '');
        setPhone(sanitizedValue);
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);

        if (!isHydrated) return;

        const ghanaPhoneRegex = /^(?:(?:\+233|0)[235][0-9]{8})$/;
        if (!ghanaPhoneRegex.test(phone)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Phone Number',
                description: 'Please enter a valid Ghanaian mobile number (e.g., 0241234567 or +233241234567).',
            });
            return;
        }

        if (!withdrawAmount || withdrawAmount <= 0) {
            toast({
                variant: 'destructive',
                title: t('invalidAmountToastTitle'),
                description: t('invalidAmountToastDescription'),
            });
            return;
        }

        if (withdrawAmount > balance) {
            toast({
                variant: 'destructive',
                title: t('insufficientBalanceToastTitle'),
                description: "You cannot withdraw more than your available balance.",
            });
            return;
        }

        setIsProcessing(true);

        // Simulate API call for withdrawal
        setTimeout(() => {
            addTransaction({
                type: 'payment', // Using 'payment' for withdrawals
                amount: -withdrawAmount,
                description: `Withdrawal to ${phone}`,
            });

            toast({
                title: 'Withdrawal Successful',
                description: `GH₵${withdrawAmount.toFixed(2)} has been sent to ${recipientName}.`,
            });
            
            setIsProcessing(false);
            router.push('/eritas-pay');

        }, 1500);
    };


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
            <div className="max-w-md mx-auto flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold mx-auto">Withdraw Funds</h1>
            </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
            <form onSubmit={handleWithdraw}>
                <Card>
                    <CardHeader>
                        <CardTitle>Select Recipient Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={network} onValueChange={setNetwork} className="space-y-4">
                            {mobileMoneyNetworks.map((net) => {
                                return (
                                <Label key={net.id} htmlFor={net.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <div className="flex items-center gap-4">
                                        {net.logo ? (
                                            <Image src={net.logo} alt={`${net.name} logo`} width={80} height={40} className='object-contain h-auto' />
                                        ) : (
                                            <div className='w-10 h-10 flex items-center justify-center'>
                                                <ArrowUpRight className='h-6 w-6 text-muted-foreground' />
                                            </div>
                                        )}
                                        <span className="font-medium">{net.name}</span>
                                    </div>
                                    <RadioGroupItem value={net.id} id={net.id} />
                                </Label>
                                )
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Enter Recipient Details</CardTitle>
                        <CardDescription>Enter the recipient's phone number and the amount to withdraw.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+233 24 123 4567" 
                                value={phone} 
                                onChange={handlePhoneChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipient-name">Recipient's Name</Label>
                            <Input 
                                id="recipient-name" 
                                type="text" 
                                placeholder="e.g. John Doe" 
                                value={recipientName} 
                                onChange={(e) => setRecipientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('amountLabel')}</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder={`Available: GH₵${isHydrated ? balance.toFixed(2) : '...'}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing || !isHydrated}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <ArrowUpRight className="mr-2 h-5 w-5" />
                    )}
                    Confirm Withdraw
                </Button>
            </form>
        </div>
      </main>
    </div>
  );
}


// =================================================================================================
// FILE: src/client-providers.tsx
// =================================================================================================

'use client';

import { WalletProvider } from "@/context/wallet-context";
import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { SecuritySettingsProvider } from "@/context/security-settings-context";
import { ReactNode } from "react";
import { LanguageProvider } from "@/context/language-context";
import { TripProvider } from "@/context/trip-context";
import { UserProvider } from "@/context/user-context";
import { UserPreferencesProvider } from "@/context/user-preferences-context";
import { NotificationProvider } from "@/context/notification-context";
import { MusicProvider } from "@/context/music-context";
import { SavedSongsProvider } from "@/context/saved-songs-context";
import { SavedPlacesProvider } from "@/context/saved-places-context";


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
                                        <SavedPlacesProvider>
                                            <NotificationSettingsProvider>
                                                <SecuritySettingsProvider>
                                                    {children}
                                                </SecuritySettingsProvider>
                                            </NotificationSettingsProvider>
                                        </SavedPlacesProvider>
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


// =================================================================================================
// FILE: src/components/auth-form.tsx
// =================================================================================================

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon } from './icons/google';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useLanguage } from '@/context/language-context';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signUpSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type AuthFormProps = {
  mode: 'signin' | 'signup';
  onSignInSuccess: () => void;
  onSignUpSuccess: () => void;
};

export function AuthForm({ mode, onSignInSuccess, onSignUpSuccess }: AuthFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google'>(null);

  const form = useForm({
    resolver: zodResolver(mode === 'signin' ? signInSchema : signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof signInSchema> | z.infer<typeof signUpSchema>) => {
    if (mode === 'signin') {
      handleSignIn(values as z.infer<typeof signInSchema>);
    } else {
      handleSignUp(values as z.infer<typeof signUpSchema>);
    }
  };
  
  // Mock sign-in function
  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('signInSuccessfulToastTitle'),
        description: t('signInSuccessfulToastDescription'),
      });
      onSignInSuccess();
    }, 1000);
  };
  
  // Mock sign-up function
  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('signUpSuccessfulToastTitle'),
        description: t('signUpSuccessfulToastDescription'),
      });
      onSignUpSuccess(); 
    }, 1000);
  };
  
  // Mock social sign-in
  const handleSocialSignIn = (provider: 'google') => {
    setIsSocialLoading(provider);
    setTimeout(() => {
        setIsSocialLoading(null);
        toast({
            title: t('socialSignInToastTitle', { provider }),
            description: t('welcome'),
        });
        onSignInSuccess();
    }, 1500);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <div className='grid grid-cols-2 gap-4'>
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('firstNameLabel')}</FormLabel>
                        <FormControl>
                        <Input placeholder={t('firstNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('lastNameLabel')}</FormLabel>
                        <FormControl>
                        <Input placeholder={t('lastNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailAddressLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailAddressPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {mode === 'signup' && (
            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? t('signIn') : t('signUp')}
          </Button>
        </form>
      </Form>
      <div className="relative my-4">
        <Separator />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t('orContinueWith')}
        </div>
      </div>
       <div className="grid grid-cols-1 gap-4">
        <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={!!isSocialLoading}>
          {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
          Google
        </Button>
      </div>
    </>
  );
}


// =================================================================================================
// FILE: src/components/bottom-nav.tsx
// =================================================================================================

'use client';

import { LayoutGrid, Music, Search, Utensils, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/home', icon: LayoutGrid, labelKey: 'home' },
    { href: '/search', icon: Search, labelKey: 'findABus' },
    { href: '/eritas-pay', icon: Wallet, labelKey: 'eritasPay' },
    { href: '/food', icon: Utensils, labelKey: 'food' },
    { href: '/music', icon: Music, labelKey: 'music' },
  ];

  return (
    <div className="bg-background/75 backdrop-blur-sm p-2 max-w-md mx-auto shadow-lg border-t border-border/50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link href={item.href} key={item.labelKey} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-full py-2 transition-colors',
                   isActive
                    ? 'bg-primary text-primary-foreground rounded-lg'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className={cn(
                    "text-xs",
                    isActive && "font-medium"
                )}>{t(item.labelKey)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/components/bus-seating-chart.tsx
// =================================================================================================

'use client';

import * as React from 'react';
import { Armchair, BusFront, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '@/context/language-context';

type Seat = {
    id: string;
    isOccupied: boolean;
} | null;

type BusSeatingChartProps = {
    seating: Seat[];
    selectedSeats: string[];
    onSeatSelect: (seatId: string) => void;
    busPlate: string;
    onConfirm: () => void;
};

export function BusSeatingChart({ seating, selectedSeats, onSeatSelect, busPlate, onConfirm }: BusSeatingChartProps) {
    const { t } = useLanguage();
    const primarySeat = selectedSeats[0];

    const renderSeat = (seat: Seat) => {
        if (!seat) {
            return <div className="col-span-1"></div>;
        }

        const isSelected = selectedSeats.includes(seat.id);
        const isPrimary = primarySeat === seat.id;
        
        return (
            <button
                key={seat.id}
                onClick={() => onSeatSelect(seat.id)}
                disabled={seat.isOccupied}
                className={cn(
                    "flex items-center justify-center rounded-md p-1 transition-colors relative",
                    "aspect-square",
                    seat.isOccupied
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary/20 text-primary hover:bg-primary/30",
                    isSelected && "bg-primary/60 text-primary-foreground",
                    isPrimary && "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary ring-offset-background"
                )}
            >
                {isPrimary ? <User className="w-5 h-5" /> : <Armchair className="w-6 h-6" />}
                <span className="absolute text-[8px] font-bold text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {seat.id}
                </span>
            </button>
        );
    };
    
    const frontSeat = seating[0];
    const rightSeats = seating.slice(1, 4); // 3 seats for the single column
    const leftSeats = seating.slice(4); // 8 seats for the double column

    return (
        <div className="p-4 space-y-6">
            <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center gap-4">
                <Badge variant="secondary" className="font-mono">{busPlate}</Badge>
                <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
                    {/* Driver's Seat */}
                    <div className="col-span-1 flex items-center justify-center">
                        <BusFront className="w-8 h-8 text-foreground" />
                    </div>
                    <div className="col-span-2"></div>
                     {/* Front Passenger Seat (on the right) */}
                     <div className="col-span-1">
                         {renderSeat(frontSeat)}
                    </div>

                    {/* Main Seating Area */}
                    {Array.from({ length: 4 }).map((_, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            {/* Left Columns (8 seats total) */}
                            <div className="col-span-1">
                                {rowIndex * 2 < leftSeats.length && renderSeat(leftSeats[rowIndex * 2])}
                            </div>
                            <div className="col-span-1">
                                {(rowIndex * 2) + 1 < leftSeats.length && renderSeat(leftSeats[(rowIndex * 2) + 1])}
                            </div>

                            {/* Aisle */}
                            <div className="col-span-1"></div>
                            
                            {/* Right Column (3 seats total) */}
                            <div className="col-span-1">
                                {rowIndex < rightSeats.length && renderSeat(rightSeats[rowIndex])}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex justify-around text-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/20 border border-primary flex items-center justify-center"><Armchair className="w-3 h-3 text-primary" /></div>
                    <span>{t('available')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/60 border border-primary flex items-center justify-center"><Armchair className="w-3 h-3 text-primary-foreground" /></div>
                    <span>{t('selected')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary border border-primary flex items-center justify-center"><User className="w-3 h-3 text-primary-foreground" /></div>
                    <span>{t('primary')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted border border-muted-foreground"></div>
                    <span>{t('taken')}</span>
                </div>
            </div>

            <Button className='w-full' disabled={selectedSeats.length === 0} onClick={onConfirm}>
                {selectedSeats.length > 0 ? t('confirmSeats', { count: selectedSeats.length }) : t('confirmSeat')}
            </Button>
        </div>
    );
}


// =================================================================================================
// FILE: src/components/card--background.tsx
// =================================================================================================

'use client';

import { Ticket, Bus, MapPin, Check, Flag, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusTicketIcon } from './icons/bus-ticket-icon';

export const CardIconBackground = () => {
    const icons = [Music, MapPin, Flag, Check, BusTicketIcon, Bus];

    const pattern = Array.from({ length: 30 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const rotation = (i % 12) * 30;
        const scale = 0.8 + ((i % 5) / 10); 

        return (
            <div 
                key={i} 
                className="absolute"
                style={{
                    top: `${(i % 6) * 20}%`,
                    left: `${Math.floor(i / 6) * 20}%`,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                }}
            >
                <Icon 
                    className={cn("h-8 w-8 text-primary/30")} 
                />
            </div>
        );
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-primary/5">
            <div className="relative w-full h-full -rotate-12 scale-150 opacity-80">
                 {pattern}
            </div>
        </div>
    );
};


// =================================================================================================
// FILE: src/components/deletable-item.tsx
// =================================================================================================

'use client';

import { useState, useRef, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeletableItemProps {
  children: ReactNode;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = -80; // How far to swipe to trigger delete

export function DeletableItem({ children, onDelete }: DeletableItemProps) {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (itemRef.current) {
        // Remove transition during drag for immediate feedback
        itemRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // Only allow swiping left
    if (deltaX < 0) {
      setDragX(Math.max(deltaX, SWIPE_THRESHOLD - 20));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (itemRef.current) {
        // Re-apply transition for snap animation
        itemRef.current.style.transition = 'transform 0.2s ease-out';
    }

    if (dragX < SWIPE_THRESHOLD / 2) {
      // Snap to open
      setDragX(SWIPE_THRESHOLD);
    } else {
      // Snap back to closed
      setDragX(0);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Animate out and then delete
    if (itemRef.current) {
        itemRef.current.style.transition = 'all 0.3s ease-out';
        itemRef.current.style.transform = 'translateX(-100%)';
        itemRef.current.style.opacity = '0';
    }
    setTimeout(() => {
        onDelete();
        // Reset state in case component is re-used
        setIsDeleting(false);
        setDragX(0);
    }, 300);
  };
  
  const handleCancel = () => {
    setDragX(0);
  }

  return (
    <div 
        className="relative w-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-full flex items-center bg-destructive">
        <Button
          variant="destructive"
          size="icon"
          className="h-full w-20 rounded-none flex items-center justify-center"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      <div
        ref={itemRef}
        className="relative w-full bg-background transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={dragX < 0 ? handleCancel : undefined}
      >
        {children}
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/components/icon-mosaic-background.tsx
// =================================================================================================

'use client';

import { Ticket, Bus, MapPin, Check, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const IconMosaicBackground = () => {
    const icons = [Ticket, Bus, MapPin, Check, Flag];

    const pattern = Array.from({ length: 150 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const rotation = (i % 12) * 30; // 0, 30, 60...
        const scale = 1 + ((i % 5) / 10); // 1, 1.1, 1.2...

        return (
            <Icon 
                key={i} 
                className={cn("h-8 w-8 text-primary/20")} 
                style={{ 
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                }} 
            />
        );
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center justify-center -rotate-12 scale-150 opacity-20">
                 {pattern}
            </div>
        </div>
    );
};


// =================================================================================================
// FILE: src/components/icons/bus-ticket-icon.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function BusTicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 6V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
      <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6" />
      <path d="M14 12v-2" />
      <path d="M18 12v-2" />
      <path d="M10 12h.01" />
      <path d="M6 12h.01" />
      <path d="m14 18 2 2 4-4" />
      <path d="M4 12h2" />
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/card-pattern.tsx
// =================================================================================================

'use client';

import * as React from "react"
import type { SVGProps } from "react"

export function CardPattern(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <pattern
          id="a"
          width={40}
          height={40}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d="M0 0h20v40H0z"
            fill="currentColor"
            fillOpacity={0.1}
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#a)"
      />
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/cash-icon.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function CashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h-4" />
      <path d="M18 12h4" />
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/google.tsx
// =================================================================================================
import * as React from "react"
import type { SVGProps } from "react"

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path style={{fill: '#FBBB00'}} d="M504.1,256.1c0-17.7-1.5-34.9-4.5-51.4H256v97.9h140.4c-6.1,31.7-24.4,58.6-50,76.6v62.4h80.7C485.4,444.6,504.1,357.8,504.1,256.1z"/>
      <path style={{fill: '#518EF8'}} d="M256,512c75.2,0,138.8-24.9,185.1-67.6l-80.7-62.4c-25,16.8-57.2,26.6-94.4,26.6c-72.3,0-133.4-48.7-155.1-114.9H16.3v64.6C63.2,459.2,152.8,512,256,512z"/>
      <path style={{fill: '#28B446'}} d="M100.9,305.5c-4.9-14.8-7.7-30.5-7.7-46.8s2.8-32,7.7-46.8V147.3H16.3C6.4,175.8,0,214.9,0,258.7c0,43.8,6.4,82.9,16.3,111.4L100.9,305.5z"/>
      <path style={{fill: '#F14336'}} d="M256,102.1c41.2,0,76.5,14,104.4,40.1l69.1-69.1C384.4,25.8,325.2,0,256,0C152.8,0,63.2,52.8,16.3,132.1l84.6,64.6C122.6,150.8,183.7,102.1,256,102.1z"/>
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/mastercard.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function MastercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48px"
      height="48px"
      {...props}
    >
      <path
        fill="#ff9800"
        d="M32 10A14 14 0 10 32 38A14 14 0 10 32 10"
      ></path>
      <path
        fill="#d50000"
        d="M16 10A14 14 0 10 16 38A14 14 0 10 16 10"
      ></path>
      <path
        fill="#ff3d00"
        d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48C20.376,15.05,18,19.245,18,24z"
      ></path>
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/mtn-momo.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function MtnMomoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 41" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M99.636 13.99C104.916 13.99 108.3 16.315 108.3 20.5C108.3 24.685 104.916 27.01 99.636 27.01H91.176V13.99H99.636ZM102.376 40V11.23H99.096C90.366 11.23 85.546 15.695 85.546 20.5C85.546 25.305 90.366 29.77 99.096 29.77H91.176V34.525H102.376V40Z" fill="#282828"/>
      <path d="M128 20.5C128 11.9 123.64 8 116.58 8C109.52 8 105.16 11.9 105.16 20.5C105.16 29.1 109.52 33 116.58 33C123.64 33 128 29.1 128 20.5ZM116.58 10.75C122.28 10.75 125.21 14.275 125.21 20.5C125.21 26.725 122.28 30.25 116.58 30.25C110.88 30.25 107.95 26.725 107.95 20.5C107.95 14.275 110.88 10.75 116.58 10.75Z" fill="#282828"/>
      <path d="M72.288 13.99C77.568 13.99 80.948 16.315 80.948 20.5C80.948 24.685 77.568 27.01 72.288 27.01H63.828V13.99H72.288ZM75.028 40V11.23H71.748C63.018 11.23 58.198 15.695 58.198 20.5C58.198 25.305 63.018 29.77 71.748 29.77H63.828V34.525H75.028V40Z" fill="#282828"/>
      <path d="M99.636 13.99C104.916 13.99 108.3 16.315 108.3 20.5C108.3 24.685 104.916 27.01 99.636 27.01H91.176V13.99H99.636ZM102.376 40V11.23H99.096C90.366 11.23 85.546 15.695 85.546 20.5C85.546 25.305 90.366 29.77 99.096 29.77H91.176V34.525H102.376V40Z" fill="#FFCC00"/>
      <path d="M80.948 20.5C80.948 11.9 76.588 8 69.528 8C62.468 8 58.108 11.9 58.108 20.5C58.108 29.1 62.468 33 69.528 33C76.588 33 80.948 29.1 80.948 20.5ZM69.528 10.75C75.228 10.75 78.158 14.275 78.158 20.5C78.158 26.725 75.228 30.25 69.528 30.25C63.828 30.25 60.898 26.725 60.898 20.5C60.898 14.275 63.828 10.75 69.528 10.75Z" fill="#FFCC00"/>
      <path d="M41 20C41 9.51 33.355 1 23.51 1C13.665 1 6.02 9.51 6.02 20C6.02 30.49 13.665 39 23.51 39C33.355 39 41 30.49 41 20ZM2.56452e-06 20C2.56452e-06 8.955 8.955 0 20 0C31.045 0 40 8.955 40 20C40 31.045 31.045 40 20 40C8.955 40 2.56452e-06 31.045 2.56452e-06 20Z" fill="#FFCC00"/>
      <path d="M20.0001 32.55C13.0651 32.55 7.45013 27.01 7.45013 20.185C7.45013 13.36 13.0651 7.82 20.0001 7.82C26.9351 7.82 32.5501 13.36 32.5501 20.185C32.5501 27.01 26.9351 32.55 20.0001 32.55Z" fill="url(#paint0_linear_1_2)"/>
      <path d="M20 32.55C13.065 32.55 7.45 27.01 7.45 20.185C7.45 13.36 13.065 7.82 20 7.82C26.935 7.82 32.55 13.36 32.55 20.185C32.55 27.01 26.935 32.55 20 32.55Z" fill="url(#paint1_radial_1_2)"/>
      <defs>
        <linearGradient id="paint0_linear_1_2" x1="20" y1="7.82" x2="20" y2="32.55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0067C9"/>
          <stop offset="1" stopColor="#004A93"/>
        </linearGradient>
        <radialGradient id="paint1_radial_1_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20.2541 12.0159) rotate(87.9734) scale(15.9328)">
          <stop stopColor="white" stopOpacity="0.6"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/no-wifi-phone.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function NoWifiPhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Phone Body */}
      <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
      
      {/* Screen area */}
      <path d="M7 3H17" />
      <path d="M7 21H17" />

      {/* Wifi Off Symbol */}
      <line x1="1" y1="1" x2="23" y2="23" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M16.88 12.88a4.95 4.95 0 0 0-8.76 0" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M19.94 9.94a8.5 8.5 0 0 0-14.88 0" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M22 7a12 12 0 0 0-20 0" transform="translate(7.5 7.5) scale(0.4)" />
      <line x1="12" y1="20" x2="12.01" y2="20" transform="translate(7.5 7.5) scale(0.4)" />
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/now-playing-icon.tsx
// =================================================================================================

'use client';

export function NowPlayingIcon() {
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <div className="w-full h-full flex justify-around items-end">
        <span className="w-1 h-2 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-2s' }} />
        <span className="w-1 h-4 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-1.5s' }} />
        <span className="w-1 h-5 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-1s' }} />
        <span className="w-1 h-3 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-0.5s' }} />
        <span className="w-1 h-4 bg-primary rounded-full animate-sound-wave" />
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/components/icons/satellite.tsx
// =================================================================================================
import * as React from "react"
import type { SVGProps } from "react"

export function SatelliteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      {...props}
    >
      <g>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
          d="M141.42 150.36L155 163.94"
        ></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
          d="M155.03 150.39l13.58-13.58"
        ></path>
        <path
          fill="currentColor"
          d="M109.84 81.33l-28.5 28.51c-1.9 1.9-5.08 1.9-6.98 0l-9.1-9.1c-1.9-1.9-1.9-5.08 0-6.98l28.5-28.51c1.9-1.9 5.08-1.9 6.98 0l9.1 9.1c1.9 1.9 1.9 5.08 0 6.98z"
          opacity="0.5"
        ></path>
        <path
          fill="currentColor"
          d="M115.42 58.05L92.5 35.13a6.72 6.72 0 00-9.5 0l-5.65 5.66a6.72 6.72 0 000 9.5l22.92 22.92a6.72 6.72 0 009.5 0l5.65-5.66a6.72 6.72 0 000-9.5z"
        ></path>
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="4"
          d="M93.38 78.43l-9.8-9.8 19.8-19.8 9.8 9.8-19.8 19.8z"
          opacity="0.8"
        ></path>
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="4"
          d="M128.69 93.81l-14.15 14.14-9.8-9.8 14.15-14.14 9.8 9.8z"
          opacity="0.8"
        ></path>
        <path
          fill="currentColor"
          d="M124.6 123.01l34.6-10-8.9-30.8-34.6 10 8.9 30.8z"
        ></path>
        <path
          fill="currentColor"
          d="M128.8 126.91l34.6-10-8.9-30.8-34.6 10 8.9 30.8z"
          opacity="0.5"
        ></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          d="M152.9 104.01l-24 9.6"
        ></path>
        <path
          fill="currentColor"
          d="M75.3 76.91l-34.6 10 8.9 30.8 34.6-10-8.9-30.8z"
        ></path>
        <path
          fill="currentColor"
          d="M71.1 73.01l-34.6 10 8.9 30.8 34.6-10-8.9-30.8z"
          opacity="0.5"
        ></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          d="M47 95.91l24-9.6"
        ></path>
      </g>
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/visa.tsx
// =================================================================================================

'use client';

import * as React from "react"
import type { SVGProps } from "react"

export function VisaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 16"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_104_2)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37.69 15.42H33.52l-2.7-10.7h2.7l1.35 5.35c.2.8.35 1.55.45 2.1h.05c.1-.55.25-1.3.45-2.1l1.35-5.35h2.6L37.69 15.42zM28.44 4.72h-3.2c-.6 0-1 .2-1.2.65-.2.45-.3 1.1-.3 2v5.05h3.7v-2.8h-1.5v-1.6h1.5v-3.3zM15.49 15.42l2.8-10.7h-2.6L13.59 13c-.1.4-.2.8-.25 1h-.05c-.05-.2-.1-.6-.2-1L10.84 4.72H8.29l2.8 10.7h2.4zm18.3-10.7L31.69 12l-.4-1.8-2.6-5.48h2.85l1.6 3.7.8-3.7h2.25z"
          fill="#142688"
        ></path>
        <path
          d="M6.59 4.72l-2.5 7.4-2.5-7.4H0l3.9 10.7h2.8L10.6 4.72H6.59z"
          fill="#142688"
        ></path>
        <path
          d="M48 4.32c0-1.5-1.1-2.2-2.8-2.2-1.6 0-2.8.6-2.8 1.5 0 .7.8 1.1 1.4 1.4.6.2 2 .7 2 1.3 0 .8-1 1.2-2.2 1.2-1.5 0-2.3-.5-2.4-1.2h-2.5c.1.9 1 2.3 3.8 2.3 1.5 0 2.9-.6 3.8-1.5.8-.8 1.1-1.9 1.1-3.2v-.1z"
          fill="#142688"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_104_2">
          <path fill="#fff" d="M0 0h48v16H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/icons/whatsapp-icon.tsx
// =================================================================================================

import * as React from "react"
import type { SVGProps } from "react"

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M16.75 13.96c.25.13.43.2.5.33.08.13.15.48.11.83-.04.35-.2.68-.43.9-.23.23-.58.4-1.13.48-.55.08-1.13.08-1.58-.08s-1.88-.6-2.9-1.23c-1.03-.63-1.9-1.4-2.6-2.28s-1.28-1.9-1.8-3.08c-.5-1.18-.83-2.43-.9-3.48s.16-1.4.5-1.8c.34-.4.8-.63 1.28-.63.2 0 .4.04.58.08.18.04.3.08.38.08s.25.04.4.25c.14.2.2.45.28.68.08.23.13.48.15.65.03.18.03.35.03.45s-.05.28-.13.45c-.08.18-.2.33-.3.45l-.3.28c-.08.08-.18.15-.23.23-.05.08-.08.13-.08.15s0 .05.03.08c.03.03.05.05.08.08l.38.38c.25.25.5.5.8.78.3.28.58.5.8.73l.25.25c.08.08.13.13.15.15s.05.03.08.03c.03 0 .05-.03.08-.05.03-.03.1-.13.15-.23.05-.1.13-.18.23-.28l.2-.2c.1-.1.2-.18.33-.25.13-.08.28-.13.4-.13h.15c.18 0 .35.04.5.13zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
    </svg>
  )
}


// =================================================================================================
// FILE: src/components/map.tsx
// =================================================================================================

'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map as GoogleMap, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

type Position = {
  lat: number;
  lng: number;
};

function MapComponent() {
  const [position, setPosition] = useState<Position | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Check if the maps library loaded correctly
  const coreLib = useMapsLibrary('core');

  useEffect(() => {
    // This is a global listener for Google Maps authentication errors.
    const handleAuthError = () => {
        setMapError(t('mapBillingError'));
    };

    window.gm_authFailure = handleAuthError;

    return () => {
        window.gm_authFailure = () => {}; // Clean up the global listener
    };
  }, [t]);


  useEffect(() => {
    if (!coreLib) {
      setMapError(t('mapLoadError'));
    } else {
      setMapError(null);
    }
  }, [coreLib, t]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to a location in Accra if permission is denied
          setPosition({ lat: 5.6037, lng: -0.1870 });
        }
      );
    } else {
      // Default to a location in Accra if geolocation is not supported
      setPosition({ lat: 5.6037, lng: -0.1870 });
    }
  }, []);

  if (mapError) {
    return (
       <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-destructive-foreground p-4 text-center bg-destructive rounded-md max-w-sm">
            <h3 className="font-bold mb-2">{t('mapErrorTitle')}</h3>
            <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">{t('findingYourLocation')}</p>
      </div>
    );
  }

  return (
      <GoogleMap
        defaultCenter={position}
        defaultZoom={15}
        mapId="eritas-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className='w-full h-full'
      >
        <Marker position={position} />
      </GoogleMap>
  );
}


export function Map() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const { t } = useLanguage();

  if (!API_KEY) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-destructive-foreground p-4 text-center bg-destructive rounded-md">
            <h3 className="font-bold mb-2">{t('mapConfigErrorTitle')}</h3>
            <p className="text-sm">{t('mapConfigErrorDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
        <MapComponent />
    </APIProvider>
  );
}


// =================================================================================================
// FILE: src/components/offline-indicator.tsx
// =================================================================================================

'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { SatelliteIcon } from './icons/satellite';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background/95 p-8 text-center backdrop-blur-sm',
        'animate-in fade-in duration-500'
      )}
    >
      <div className="relative h-48 w-48 flex items-center justify-center">
        <div className="absolute inset-0 animate-satellite-orbit-outer">
          <div className="absolute h-full w-full animate-satellite-orbit-inner">
            <SatelliteIcon className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-primary" />
          </div>
        </div>
         <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/20"></div>
         </div>
      </div>

      <div className="max-w-xs space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('noConnection')}
        </h1>
        <p className="text-muted-foreground">
          {t('noConnectionDescription')}
        </p>
      </div>
    </div>
  );
}


// =================================================================================================
// FILE: src/components/profile-sidebar.tsx
// =================================================================================================

'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    User,
    History,
    Percent,
    Award,
    LogOut,
    Settings,
    QrCode,
    MapPin,
    Home,
    Briefcase,
    Plus,
    Trash2,
    Ticket,
    Globe,
    Share2,
    UserCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { ThemeSwitcher } from './theme-switcher';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '@/context/language-context';
import { useState } from 'react';

const menuItems = [
    { id: 'settings', icon: Settings, labelKey: 'profileSettings', href: '/settings' },
    { id: 'trips', icon: History, labelKey: 'recentTrips', href: '/settings/recent-trips' },
    { id: 'places', icon: MapPin, labelKey: 'savedPlaces', href: '/settings/saved-places' },
    { id: 'share', icon: Share2, labelKey: 'shareMyTrip' },
    { id: 'qr', icon: QrCode, labelKey: 'tripQrCodes', href: '/settings/trip-qrs' },
    { id: 'loyalty', icon: Award, labelKey: 'loyaltyPoints', href: '/loyalty' },
];

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export function ProfileSidebar() {
    const router = useRouter();
    const { toast } = useToast();
    const { language, setLanguage, t } = useLanguage();

    const handleLogout = () => {
        router.push('/');
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        localStorage.clear();
    };

    const handleDeleteAccount = async () => {
        toast({
            title: t('accountDeletedToastTitle'),
            description: t('accountDeletedToastDescription')
        });
        router.push('/');
        localStorage.clear();
    };
    
    const handleNavigate = (href?: string) => {
        if (href) {
            router.push(href);
        }
    };

    const handleShareTrip = () => {
        // Since active trip is removed, we show a toast
        toast({
            variant: 'destructive',
            title: t('noActiveTripTitle'),
            description: t('noActiveTripDescription'),
        });
    };

    const handleMenuClick = (item: (typeof menuItems)[0]) => {
        if (item.id === 'share') {
            handleShareTrip();
        } else if (item.href) {
            handleNavigate(item.href);
        }
    }
    
    const user = mockUser; // Use the mock user

    return (
        <>
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                >
                    <UserCircle className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="text-left">
                    <SheetTitle>{t('myProfile')}</SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col h-full">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                <AvatarFallback>
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{user.displayName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{t('guest')}</p>
                                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/')}>
                                    {t('signIn')}
                                </Button>
                            </div>
                        </div>
                    )}


                    <Separator className="my-6" />

                    {/* Menu Items */}
                    <div className="flex flex-col gap-1 flex-grow overflow-y-auto">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className="justify-start gap-3 text-md"
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    {t(item.labelKey)}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 space-y-4">
                        {/* Language Switcher */}
                        <div className="flex items-center justify-between">
                            <div className='flex items-center gap-3 text-md'>
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('language')}</span>
                            </div>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-us">English (US)</SelectItem>
                                    <SelectItem value="en-gb">English (UK)</SelectItem>
                                    <SelectItem value="tw">Twi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Theme Switcher */}
                        <div className="flex items-center justify-between">
                        <ThemeSwitcher showLabel />
                        </div>

                        <div className="space-y-2">
                            {/* Logout Button */}
                            <Button variant="outline" className="w-full" onClick={handleLogout}>
                                <LogOut className="mr-2 h-5 w-5" />
                                {t('logout')}
                            </Button>

                            {/* Delete Account Button */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-5 w-5" />
                                        {t('deleteAccount')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('deleteAccountConfirmationTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('deleteAccountConfirmationDescription')}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount}>{t('continue')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
        </>
    );
}


// =================================================================================================
// FILE: src/components/signup-slideshow.tsx
// =================================================================================================

'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useLanguage } from '@/context/language-context';
import { IconMosaicBackground } from './icon-mosaic-background';

export function SignupSlideshow({ onFinish }: { onFinish: () => void }) {
    const { t } = useLanguage();

    const slideContent = [
        {
            id: 'smart-routing',
            titleKey: 'smartRoutingTitle',
            descriptionKey: 'smartRoutingDescription',
        },
        {
            id: 'gps-tracking',
            titleKey: 'gpsTrackingTitle',
            descriptionKey: 'gpsTrackingDescription',
        },
        {
            id: 'personal-music',
            titleKey: 'personalMusicTitle',
            descriptionKey: 'personalMusicDescription',
        },
        {
            id: 'real-time-availability',
            titleKey: 'realTimeAvailabilityTitle',
            descriptionKey: 'realTimeAvailabilityDescription',
        },
        {
            id: 'frosted-glass-ui',
            titleKey: 'frostedGlassUiTitle',
            descriptionKey: 'frostedGlassUiDescription',
        },
    ];

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 overflow-hidden">
        <IconMosaicBackground />
        
      <div className="w-full max-w-sm sm:max-w-md mx-auto z-10">
        <Carousel className="w-full">
          <CarouselContent>
            {slideContent.map((slide) => {
              const image = PlaceHolderImages.find((p) => p.id === slide.id);
              return (
                <CarouselItem key={slide.id}>
                  <div className="p-1">
                    <Card className="bg-background/80 backdrop-blur-sm">
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 aspect-[9/10] sm:aspect-square">
                        {image && (
                          <div className="relative w-full h-40 sm:h-48">
                            <Image
                              src={image.imageUrl}
                              alt={image.description}
                              fill
                              data-ai-hint={image.imageHint}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-xl sm:text-2xl font-semibold text-center">{t(slide.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground text-center">{t(slide.descriptionKey)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <Button onClick={onFinish} className="w-full mt-6">
          {t('getStarted')}
        </Button>
      </div>
    </div>
  );
}

    


// =================================================================================================
// FILE: src/components/theme-switcher.tsx
// =================================================================================================

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher({ showLabel = false }: { showLabel?: boolean }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
            setTheme(localTheme);
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', isDark);
    };

    if (showLabel) {
        return (
            <>
                <Label htmlFor="theme-switch" className="flex items-center gap-3">
                    <Sun className="h-5 w-5" /> Light / <Moon className="h-5 w-5" /> Dark
                </Label>
                <Switch
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                />
            </>
        )
    }

    return (
        <Switch
            id="theme-switch-settings"
            checked={theme === 'dark'}
            onCheckedChange={handleThemeChange}
        />
    );
}


// =================================================================================================
// FILE: src/components/trip-rating.tsx
// =================================================================================================

'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ActiveTrip } from '@/context/trip-context';
import Confetti from 'react-confetti';

type TripRatingProps = {
  trip: ActiveTrip;
  onSubmit: (rating: number, complaint?: string) => void;
};

export function TripRating({ trip, onSubmit }: TripRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // This is a simple way to get window dimensions on the client.
    // For more complex layouts, you might use a ref on the parent card.
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // After the confetti runs for a bit, call the original submit handler
    setTimeout(() => {
        onSubmit(rating, complaintText);
    }, 4000);
  };

  if (isSubmitted) {
    return (
        <Card className="w-full max-w-md mx-auto relative overflow-hidden">
             <Confetti
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
                numberOfPieces={200}
             />
             <CardHeader className="text-center">
                <CardTitle className="flex flex-col items-center justify-center gap-2">
                    <PartyPopper className="h-10 w-10 text-primary"/>
                    Thanks for your review!
                </CardTitle>
             </CardHeader>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-in fade-in-50 slide-in-from-bottom-5">
      <CardHeader className="text-center">
        <CardTitle>How was your trip?</CardTitle>
        <CardDescription>Rate your experience with {trip.bus.driver}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-20 h-20">
            {trip.bus.driverImage && <AvatarImage src={trip.bus.driverImage} alt={trip.bus.driver} />}
            <AvatarFallback>{trip.bus.driver.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{trip.bus.driver}</p>
          <p className="text-sm text-muted-foreground font-mono">{trip.bus.plate}</p>
        </div>
        
        <div 
            className="flex justify-center gap-2"
            onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-8 h-8 cursor-pointer transition-colors",
                (hoverRating >= star || rating >= star)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/50"
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
            />
          ))}
        </div>

        {showComplaint && (
          <div className="space-y-2 animate-in fade-in-20">
            <Textarea
              placeholder="Please describe your issue..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button onClick={handleSubmit} className="w-full" disabled={rating === 0}>
            Submit Rating
        </Button>
        {!showComplaint && (
          <Button variant="ghost" size="sm" onClick={() => setShowComplaint(true)}>
            <MessageSquare className="mr-2 h-4 w-4"/>
            File a Complaint
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}


// =================================================================================================
// FILE: src/components/ui/accordion.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }


// =================================================================================================
// FILE: src/components/ui/alert-dialog.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}


// =================================================================================================
// FILE: src/components/ui/alert.tsx
// =================================================================================================
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }


// =================================================================================================
// FILE: src/components/ui/avatar.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }


// =================================================================================================
// FILE: src/components/ui/badge.tsx
// =================================================================================================
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }


// =================================================================================================
// FILE: src/components/ui/button.tsx
// =================================================================================================

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


// =================================================================================================
// FILE: src/components/ui/calendar.tsx
// =================================================================================================
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }


// =================================================================================================
// FILE: src/components/ui/card.tsx
// =================================================================================================

import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }


// =================================================================================================
// FILE: src/components/ui/carousel.tsx
// =================================================================================================
"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}


// =================================================================================================
// FILE: src/components/ui/chart.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}


// =================================================================================================
// FILE: src/components/ui/checkbox.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }


// =================================================================================================
// FILE: src/components/ui/collapsible.tsx
// =================================================================================================
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }


// =================================================================================================
// FILE: src/components/ui/dialog.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}


// =================================================================================================
// FILE: src/components/ui/dropdown-menu.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}


// =================================================================================================
// FILE: src/components/ui/form.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}


// =================================================================================================
// FILE: src/components/ui/input.tsx
// =================================================================================================
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


// =================================================================================================
// FILE: src/components/ui/label.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }


// =================================================================================================
// FILE: src/components/ui/menubar.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}


// =================================================================================================
// FILE: src/components/ui/popover.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }


// =================================================================================================
// FILE: src/components/ui/progress.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }


// =================================================================================================
// FILE: src/components/ui/radio-group.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }


// =================================================================================================
// FILE: src/components/ui/scroll-area.tsx
// =================================================================================================

"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }


// =================================================================================================
// FILE: src/components/ui/select.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}


// =================================================================================================
// FILE: src/components/ui/separator.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }


// =================================================================================================
// FILE: src/components/ui/sheet.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}


// =================================================================================================
// FILE: src/components/ui/skeleton.tsx
// =================================================================================================
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }


// =================================================================================================
// FILE: src/components/ui/slider.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }


// =================================================================================================
// FILE: src/components/ui/switch.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }


// =================================================================================================
// FILE: src/components/ui/table.tsx
// =================================================================================================
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}


// =================================================================================================
// FILE: src/components/ui/tabs.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }


// =================================================================================================
// FILE: src/components/ui/textarea.tsx
// =================================================================================================
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};


// =================================================================================================
// FILE: src/components/ui/toast.tsx
// =================================================================================================

"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-auto sm:top-0 sm:flex-col md:max-w-[420px] left-1/2 -translate-x-1/2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

    


// =================================================================================================
// FILE: src/components/ui/toaster.tsx
// =================================================================================================
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}


// =================================================================================================
// FILE: src/components/ui/tooltip.tsx
// =================================================================================================
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }


// =================================================================================================
// FILE: src/components/user-preferences.tsx
// =================================================================================================

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { savePreferencesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

const initialState = {
  message: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {t('savePreferences')}
    </Button>
  );
}

export function UserPreferences() {
  const [state, formAction] = useActionState(
    savePreferencesAction,
    initialState
  );
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (state.message) {
      if (state.data) {
        toast({
          title: t('preferencesSavedToastTitle'),
          description: state.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: t('uhOhSomethingWentWrong'),
          description: state.message,
        });
      }
    }
  }, [state, toast, t]);

  return (
    <Card className="w-full max-w-md bg-card/75 backdrop-blur-sm border-white/20 text-card-foreground lg:bg-card/75 lg:text-card-foreground lg:border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white lg:text-white">
          <Save />
          {t('tellUsMoreTitle')}
        </CardTitle>
        <CardDescription className="text-white/80 lg:text-white/80">
          {t('tellUsMoreDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food" className="text-white/90 lg:text-white/90">
              {t('favouriteFoodLabel')}
            </Label>
            <Input
              id="food"
              name="food"
              placeholder={t('favouriteFoodPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="music" className="text-white/90 lg:text-white/90">
              {t('favouriteMusicLabel')}
            </Label>
            <Input
              id="music"
              name="music"
              placeholder={t('favouriteMusicPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-white/90 lg:text-white/90">
              {t('favouriteDestinationLabel')}
            </Label>
            <Input
              id="destination"
              name="destination"
              placeholder={t('favouriteDestinationPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/80 lg:text-white/80">
              {state.data.confirmationMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// =================================================================================================
// FILE: src/context/language-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import tw from '@/locales/tw.json';

const translations: Record<string, Record<string, string>> = {
  'en-us': en,
  'en-gb': en, // Using same as US for now
  'tw': tw,
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  isHydrated: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en-us');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    let translation = translations[language]?.[key] || translations['en-us'][key] || key;
    
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  }, [language]);
  
  const value = { language, setLanguage, t, isHydrated };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/music-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useTrip } from './trip-context';

export type Track = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // in ms
  artistId?: string;
};

type PlaylistEntry = {
    track: Track;
    addedBy: string; // e.g., user ID
};

type MusicContextType = {
  playlist: Track[];
  playedSongs: Track[]; // Keep track of songs that have finished
  nowPlaying: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  addSong: (song: Track, userId: string) => void;
  removeSong: (songId: string, userId: string) => boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const { activeTrip } = useTrip();
    const [playlist, setPlaylist] = useState<PlaylistEntry[]>([]);
    const [playedSongs, setPlayedSongs] = useState<PlaylistEntry[]>([]);
    const [nowPlaying, setNowPlaying] = useState<PlaylistEntry | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const playNextSong = useCallback(() => {
        if (nowPlaying) {
            setPlayedSongs(prev => [nowPlaying, ...prev]);
        }

        if (playlist.length > 0) {
            const nextSong = playlist[0];
            setNowPlaying(nextSong);
            setPlaylist(prev => prev.slice(1));
            setProgress(0);
            setIsPlaying(true);
        } else {
            setNowPlaying(null);
            setIsPlaying(false);
            setProgress(0);
        }
    }, [playlist, nowPlaying]);


    useEffect(() => {
        if (!activeTrip) {
            setPlaylist([]);
            setPlayedSongs([]);
            setNowPlaying(null);
            setIsPlaying(false);
            setProgress(0);
        }
    }, [activeTrip]);

    useEffect(() => {
        if (!activeTrip) return;

        if (!nowPlaying && playlist.length > 0) {
           playNextSong();
        }

        if (nowPlaying && isPlaying) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + (100 / (nowPlaying.track.duration / 1000));
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        playNextSong();
                        return 0;
                    }
                    return newProgress;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

    }, [nowPlaying, isPlaying, activeTrip, playNextSong, playlist.length]);
    

    const addSong = useCallback((track: Track, userId: string) => {
        if (!activeTrip) return;
        const newEntry: PlaylistEntry = { track, addedBy: userId };
        setPlaylist(prev => [...prev, newEntry]);
    }, [activeTrip]);

    const removeSong = useCallback((trackId: string, userId: string): boolean => {
        let canRemove = true; // For demo, anyone can remove
        if(canRemove) {
            setPlaylist(prev => prev.filter(entry => entry.track.id !== trackId));
        }
        return canRemove;
    }, []);

    const togglePlay = useCallback(() => {
        if (nowPlaying) {
            setIsPlaying(prev => !prev);
        }
    }, [nowPlaying]);

    const playNext = useCallback(() => {
        playNextSong();
    }, [playNextSong]);
    
    const playPrevious = useCallback(() => {
        if (playedSongs.length > 0) {
            const lastPlayedSong = playedSongs[0];
            setPlayedSongs(prev => prev.slice(1));
            if (nowPlaying) {
                setPlaylist(prev => [nowPlaying, ...prev]);
            }
            setNowPlaying(lastPlayedSong);
            setProgress(0);
            setIsPlaying(true);
        }
    }, [playedSongs, nowPlaying]);

    const value = {
        playlist: playlist.map(p => p.track),
        playedSongs: playedSongs.map(p => p.track),
        nowPlaying: nowPlaying?.track || null,
        isPlaying,
        progress,
        addSong,
        removeSong,
        togglePlay,
        playNext,
        playPrevious,
    };

    return (
        <MusicContext.Provider value={value}>
        {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/notification-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

export type Notification = {
    id: string; // Changed to string to accommodate more complex unique IDs
    title: string;
    description: string;
    tripId?: string;
    action?: React.ReactNode;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  clearNotifications: () => void;
  isHydrated: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        // We only load the non-component data. Actions will be lost on reload, which is acceptable.
        const loadedNotifications = JSON.parse(storedNotifications).map((n: any) => ({...n, action: undefined}));
        setNotifications(loadedNotifications);
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistNotifications = (notificationsToPersist: Notification[]) => {
    try {
      // Create a version of notifications for storage without React components
      const storableNotifications = notificationsToPersist.map(({ action, ...rest }) => rest);
      localStorage.setItem('notifications', JSON.stringify(storableNotifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage", error);
    }
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    // Generate a more unique key to prevent collisions
    const newNotification = { ...notification, id: `${Date.now()}-${Math.random()}` };
    setNotifications(prev => {
        const newNotifications = [newNotification, ...prev];
        persistNotifications(newNotifications);
        return newNotifications;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    persistNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    clearNotifications,
    isHydrated,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/notification-settings-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

type NotificationSettingsContextType = {
  routeAlerts: boolean;
  setRouteAlerts: (value: boolean) => void;
  bookingAlerts: boolean;
  setBookingAlerts: (value: boolean) => void;
  systemAlerts: boolean;
  setSystemAlerts: (value: boolean) => void;
  isHydrated: boolean;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [routeAlerts, setRouteAlertsState] = useState(true);
  const [bookingAlerts, setBookingAlertsState] = useState(true);
  const [systemAlerts, setSystemAlertsState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        const { routeAlerts, bookingAlerts, systemAlerts } = JSON.parse(storedSettings);
        setRouteAlertsState(routeAlerts ?? true);
        setBookingAlertsState(bookingAlerts ?? true);
        setSystemAlertsState(systemAlerts ?? true);
      }
    } catch (error) {
      console.error("Failed to load notification settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistSettings = (settings: object) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save notification settings to localStorage", error);
    }
  };

  const setRouteAlerts = useCallback((value: boolean) => {
    setRouteAlertsState(value);
    persistSettings({ routeAlerts: value, bookingAlerts, systemAlerts });
  }, [bookingAlerts, systemAlerts]);

  const setBookingAlerts = useCallback((value: boolean) => {
    setBookingAlertsState(value);
    persistSettings({ routeAlerts, bookingAlerts: value, systemAlerts });
  }, [routeAlerts, systemAlerts]);

  const setSystemAlerts = useCallback((value: boolean) => {
    setSystemAlertsState(value);
    persistSettings({ routeAlerts, bookingAlerts, systemAlerts: value });
  }, [routeAlerts, bookingAlerts]);

  const value = {
    routeAlerts,
    setRouteAlerts,
    bookingAlerts,
    setBookingAlerts,
    systemAlerts,
    setSystemAlerts,
    isHydrated,
  };

  return (
    <NotificationSettingsContext.Provider value={value}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);
  if (context === undefined) {
    throw new Error('useNotificationSettings must be used within a NotificationSettingsProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/saved-places-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Home, Briefcase, MapPin } from 'lucide-react';

export type Place = {
  id: string;
  name: string;
  address: string;
  icon: 'Home' | 'Briefcase' | 'MapPin' | string;
};

type SavedPlacesContextType = {
  places: Place[];
  addPlace: (place: Omit<Place, 'id'>) => void;
  removePlace: (placeId: string) => void;
  updatePlace: (placeId: string, newPlaceData: Omit<Place, 'id'>) => void;
  isHydrated: boolean;
};

const SavedPlacesContext = createContext<SavedPlacesContextType | undefined>(undefined);

const initialSavedPlaces: Place[] = [
    { id: '1', name: 'Home', address: '123 Adenta Street, Accra', icon: 'Home' },
    { id: '2', name: 'Work', address: '456 Circle Avenue, Accra', icon: 'Briefcase' },
];


export function SavedPlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            setPlaces(JSON.parse(storedPlaces));
        } else {
            setPlaces(initialSavedPlaces);
            localStorage.setItem('savedPlaces', JSON.stringify(initialSavedPlaces));
        }
    } catch (error) {
        console.error("Failed to load places from localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  const updateLocalStorage = (newPlaces: Place[]) => {
      try {
          localStorage.setItem('savedPlaces', JSON.stringify(newPlaces));
      } catch (error) {
          console.error("Failed to save places to localStorage", error);
      }
  };

  const addPlace = useCallback((place: Omit<Place, 'id'>) => {
    setPlaces(prev => {
        const newPlace = { ...place, id: uuidv4() };
        const newPlaces = [...prev, newPlace];
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const removePlace = useCallback((placeId: string) => {
    setPlaces(prev => {
        const newPlaces = prev.filter(p => p.id !== placeId);
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const updatePlace = useCallback((placeId: string, newPlaceData: Omit<Place, 'id'>) => {
    setPlaces(prev => {
        const newPlaces = prev.map(p => p.id === placeId ? { ...newPlaceData, id: placeId } : p);
        updateLocalStorage(newPlaces);
        return newPlaces;
    });
  }, []);

  const value = { places, addPlace, removePlace, updatePlace, isHydrated };

  return (
    <SavedPlacesContext.Provider value={value}>
      {children}
    </SavedPlacesContext.Provider>
  );
}

export function useSavedPlaces() {
  const context = useContext(SavedPlacesContext);
  if (context === undefined) {
    throw new Error('useSavedPlaces must be used within a SavedPlacesProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/saved-songs-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Track } from './music-context';
import { useToast } from '@/hooks/use-toast';

type SavedSongsContextType = {
  savedSongs: Track[];
  saveSong: (song: Track) => void;
  unsaveSong: (songId: string) => void;
  isSongSaved: (songId: string) => boolean;
  isHydrated: boolean;
};

const SavedSongsContext = createContext<SavedSongsContextType | undefined>(undefined);

export function SavedSongsProvider({ children }: { children: ReactNode }) {
  const [savedSongs, setSavedSongs] = useState<Track[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedSongs = localStorage.getItem('savedSongs');
        if (storedSongs) {
            setSavedSongs(JSON.parse(storedSongs));
        }
    } catch (error) {
        console.error("Failed to load saved songs from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const updateLocalStorage = (songs: Track[]) => {
      try {
          localStorage.setItem('savedSongs', JSON.stringify(songs));
      } catch (error) {
          console.error("Failed to save songs to localStorage", error);
      }
  };

  const saveSong = useCallback((song: Track) => {
    if (savedSongs.some(s => s.id === song.id)) {
        return; // Already saved
    }
    const newSongs = [song, ...savedSongs];
    setSavedSongs(newSongs);
    updateLocalStorage(newSongs);
    toast({ title: "Song Saved", description: `${song.title} has been added to your saved songs.` });
  }, [savedSongs, toast]);

  const unsaveSong = useCallback((songId: string) => {
    const songToRemove = savedSongs.find(s => s.id === songId);
    if (!songToRemove) return;

    const newSongs = savedSongs.filter(s => s.id !== songId);
    setSavedSongs(newSongs);
    updateLocalStorage(newSongs);
    toast({ title: "Song Unsaved", description: `${songToRemove.title} has been removed.` });
  }, [savedSongs, toast]);

  const isSongSaved = useCallback((songId: string) => {
    return savedSongs.some(s => s.id === songId);
  }, [savedSongs]);

  const value = { savedSongs, saveSong, unsaveSong, isSongSaved, isHydrated };

  return (
    <SavedSongsContext.Provider value={value}>
      {children}
    </SavedSongsContext.Provider>
  );
}

export function useSavedSongs() {
  const context = useContext(SavedSongsContext);
  if (context === undefined) {
    throw new Error('useSavedSongs must be used within a SavedSongsProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/security-settings-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

type SecuritySettingsContextType = {
  isPinEnabled: boolean;
  setIsPinEnabled: (value: boolean) => void;
  is2faEnabled: boolean;
  setIs2faEnabled: (value: boolean) => void;
  isHydrated: boolean;
};

const SecuritySettingsContext = createContext<SecuritySettingsContextType | undefined>(undefined);

export function SecuritySettingsProvider({ children }: { children: ReactNode }) {
  const [isPinEnabled, setIsPinEnabledState] = useState(false);
  const [is2faEnabled, setIs2faEnabledState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('securitySettings');
      if (storedSettings) {
        const { isPinEnabled, is2faEnabled } = JSON.parse(storedSettings);
        setIsPinEnabledState(isPinEnabled ?? false);
        setIs2faEnabledState(is2faEnabled ?? false);
      }
    } catch (error) {
      console.error("Failed to load security settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistSettings = (settings: object) => {
    try {
      localStorage.setItem('securitySettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save security settings to localStorage", error);
    }
  };

  const setIsPinEnabled = useCallback((value: boolean) => {
    setIsPinEnabledState(value);
    persistSettings({ isPinEnabled: value, is2faEnabled });
  }, [is2faEnabled]);

  const setIs2faEnabled = useCallback((value: boolean) => {
    setIs2faEnabledState(value);
    persistSettings({ isPinEnabled, is2faEnabled: value });
  }, [isPinEnabled]);

  const value = {
    isPinEnabled,
    setIsPinEnabled,
    is2faEnabled,
    setIs2faEnabled,
    isHydrated,
  };

  return (
    <SecuritySettingsContext.Provider value={value}>
      {children}
    </SecuritySettingsContext.Provider>
  );
}

export function useSecuritySettings() {
  const context = useContext(SecuritySettingsContext);
  if (context === undefined) {
    throw new Error('useSecuritySettings must be used within a SecuritySettingsProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/trip-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// This mirrors the BusData type but is defined here to avoid circular dependencies.
type BusInfo = {
  id: string;
  driver: string;
  plate: string;
  eta: number;
  capacity: { current: number; max: number; };
  stops: { name: string; fare: number; eta: number; }[];
  finalDestination: { name: string; fare: number; eta: number; };
  driverImage?: string;
};

export type ActiveTrip = {
    bus: BusInfo;
    boardingStop: { name: string; fare: number; eta: number; };
    seats: string[];
    tripId: string;
};

type TripStatus = 'idle' | 'en_route_to_pickup' | 'bus_arrived' | 'en_route_to_destination' | 'trip_ended' | 'rating';

type TripContextType = {
  activeTrip: ActiveTrip | null;
  tripStatus: TripStatus;
  currentEta: number;
  startTrip: (trip: ActiveTrip) => void;
  endTrip: () => void;
  submitRating: () => void;
  cancelTrip: () => { fare: number, seats: number };
  isHydrated: boolean;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [currentEta, setCurrentEta] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedTrip = localStorage.getItem('activeTrip');
      const storedStatus = localStorage.getItem('tripStatus') as TripStatus;
      const storedEta = localStorage.getItem('currentEta');

      if (storedTrip) setActiveTrip(JSON.parse(storedTrip));
      if (storedStatus) setTripStatus(storedStatus);
      if (storedEta) setCurrentEta(JSON.parse(storedEta));

    } catch (error) {
        console.error("Failed to load trip data from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return; // Don't save initial unhydrated state
    try {
        if (activeTrip) localStorage.setItem('activeTrip', JSON.stringify(activeTrip));
        else localStorage.removeItem('activeTrip');
        
        localStorage.setItem('tripStatus', tripStatus);
        localStorage.setItem('currentEta', JSON.stringify(currentEta));
    } catch (error) {
        console.error("Failed to save trip data to localStorage", error);
    }
  }, [activeTrip, tripStatus, currentEta, isHydrated]);


  const startTrip = useCallback((trip: ActiveTrip) => {
    setActiveTrip(trip);
    setTripStatus('en_route_to_pickup');
    setCurrentEta(trip.boardingStop.eta);
  }, []);

  const endTrip = useCallback(() => {
    setTripStatus('rating');
  }, []);

  const submitRating = useCallback(() => {
    setActiveTrip(null);
    setTripStatus('idle');
    setCurrentEta(0);
  }, []);

  const cancelTrip = useCallback(() => {
    if (!activeTrip) return { fare: 0, seats: 0 };
    const fareToRefund = activeTrip.boardingStop.fare * activeTrip.seats.length;
    const seatsFreed = activeTrip.seats.length;
    
    setActiveTrip(null);
    setTripStatus('idle');
    setCurrentEta(0);
    
    return { fare: fareToRefund, seats: seatsFreed };

  }, [activeTrip]);

  // Simulate ETA countdown
  useEffect(() => {
    if ((tripStatus === 'en_route_to_pickup' || tripStatus === 'en_route_to_destination') && currentEta > 0) {
      const timer = setInterval(() => {
        setCurrentEta(prevEta => {
          const newEta = prevEta - 1;
          if (newEta <= 0) {
            if (tripStatus === 'en_route_to_pickup') {
              setTripStatus('bus_arrived');
            } else if (tripStatus === 'en_route_to_destination') {
              setTripStatus('trip_ended');
            }
            clearInterval(timer);
            return 0;
          }
          return newEta;
        });
      }, 1000); // Update every second for testing

      return () => clearInterval(timer);
    }
  }, [tripStatus, currentEta]);

  // Transition from 'bus_arrived' to 'en_route_to_destination'
  useEffect(() => {
    if (tripStatus === 'bus_arrived' && activeTrip) {
      // Simulate boarding time
      const timer = setTimeout(() => {
        setTripStatus('en_route_to_destination');
        const destinationEta = activeTrip.bus.finalDestination.eta;
        const boardingStopEta = activeTrip.boardingStop.eta;
        // Calculate remaining trip time
        const remainingTime = destinationEta > boardingStopEta ? destinationEta - boardingStopEta : destinationEta;
        setCurrentEta(remainingTime);
      }, 10 * 1000); // 10-second boarding time
      return () => clearTimeout(timer);
    }
  }, [tripStatus, activeTrip]);

  // Transition from 'trip_ended' to 'rating'
  useEffect(() => {
      if (tripStatus === 'trip_ended') {
          const timer = setTimeout(() => {
              setTripStatus('rating');
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [tripStatus]);

  const value = {
    activeTrip,
    tripStatus,
    currentEta,
    startTrip,
    endTrip,
    submitRating,
    cancelTrip,
    isHydrated,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

    


// =================================================================================================
// FILE: src/context/user-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

// This is a simplified user object for a DB-less experience
type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string;
};

type UserContextType = {
  user: User | null;
  // In a real app, you'd have functions like login, logout, etc.
  // For this mock, we'll just have a static user.
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for a DB-less experience
const mockUser: User = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export function UserProvider({ children }: { children: ReactNode }) {
  // In this mock setup, the user is always "logged in".
  const [user] = useState<User | null>(mockUser);

  const value = { user };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/user-preferences-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const PREFERENCES_DOC_ID = 'userPreferences';

type Preferences = {
  language?: string;
  food?: string;
  music?: string;
  destination?: string;
};

type UserPreferencesContextType = {
  preferences: Preferences | null;
  setPreference: (key: keyof Preferences, value: string) => void;
  isHydrated: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const initialPreferences: Preferences = {
  language: 'en-us',
  food: '',
  music: '',
  destination: '',
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a DB-less app, we can load from localStorage
    try {
        const storedPrefs = localStorage.getItem('userPreferences');
        if (storedPrefs) {
            setPreferences(JSON.parse(storedPrefs));
        } else {
            setPreferences(initialPreferences);
        }
    } catch (error) {
        console.error("Failed to load preferences from localStorage", error);
        setPreferences(initialPreferences);
    }
    setIsHydrated(true);
  }, []);

  const setPreference = useCallback((key: keyof Preferences, value: string) => {
    setPreferences(prev => {
        const newPrefs = { ...(prev || initialPreferences), [key]: value };
        try {
            localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
        } catch (error) {
             console.error("Failed to save preferences to localStorage", error);
             toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not save your preferences.',
             });
        }
        return newPrefs;
    });
  }, [toast]);
  
  const value = { preferences, setPreference, isHydrated };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/context/wallet-context.tsx
// =================================================================================================

'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export type Transaction = {
  id: string;
  type: 'top-up' | 'payment';
  amount: number;
  description: string;
  timestamp: string;
  plate?: string;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  clearTransactions: () => void;
  isHydrated: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialBalance = 200.00;

export function WalletProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState(initialBalance);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedBalance = localStorage.getItem('walletBalance');
            const storedTransactions = localStorage.getItem('walletTransactions');

            if (storedBalance) {
                setBalance(JSON.parse(storedBalance));
            } else {
                localStorage.setItem('walletBalance', JSON.stringify(initialBalance));
            }

            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
            } else {
                localStorage.setItem('walletTransactions', JSON.stringify([]));
            }
        } catch (error) {
            console.error("Failed to load wallet data from localStorage", error);
            setBalance(initialBalance);
            setTransactions([]);
        }
        setIsHydrated(true);
    }, []);

    const updateLocalStorage = (newBalance: number, newTransactions: Transaction[]) => {
        try {
            localStorage.setItem('walletBalance', JSON.stringify(newBalance));
            localStorage.setItem('walletTransactions', JSON.stringify(newTransactions));
        } catch (error) {
            console.error("Failed to save wallet data to localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not save wallet data.',
            });
        }
    };

    const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
        };

        setTransactions(prevTransactions => {
            const newBalance = balance + newTransaction.amount;
            const newTransactions = [newTransaction, ...prevTransactions];
            
            updateLocalStorage(newBalance, newTransactions);
            setBalance(newBalance);

            if (newBalance < 20 && newBalance > 0) {
                toast({
                    variant: 'destructive',
                    title: "Low Balance Warning",
                    description: 'Your wallet balance is getting low. Please top-up.',
                });
            }

            return newTransactions;
        });
    }, [balance, toast]);


    const clearTransactions = useCallback(() => {
        setTransactions([]);
        updateLocalStorage(balance, []);
        toast({
            title: "History Cleared",
            description: "Your transaction history has been cleared.",
        });
    }, [balance, toast]);

    const value = { balance, transactions, addTransaction, clearTransactions, isHydrated };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}


// =================================================================================================
// FILE: src/genkit-env.d.ts
// =================================================================================================
/// <reference types="genkit" />


// =================================================================================================
// FILE: src/hooks/use-bus-arrival-notification.ts
// =================================================================================================

'use client';

import { useEffect, useCallback } from 'react';

// This function creates and plays a simple tone.
// It's self-contained and doesn't require any external audio files.
const playNotificationSound = () => {
    // Check if window and AudioContext are available
    if (typeof window === 'undefined' || !window.AudioContext) {
        console.log("AudioContext not supported on this browser.");
        return;
    }

    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sound parameters
    oscillator.type = 'sine'; // A smooth, clean tone
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Set volume

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3); // Play for 0.3 seconds
};


export function useBusArrivalNotification(hasArrived: boolean) {
    const playSound = useCallback(() => {
        playNotificationSound();
    }, []);

    useEffect(() => {
        if (hasArrived) {
            playSound();
        }
    }, [hasArrived, playSound]);
}


// =================================================================================================
// FILE: src/hooks/use-debounce.ts
// =================================================================================================

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

    


// =================================================================================================
// FILE: src/hooks/use-mobile.tsx
// =================================================================================================
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}


// =================================================================================================
// FILE: src/hooks/use-online-status.ts
// =================================================================================================

'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial status
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      setIsOnline(window.navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}


// =================================================================================================
// FILE: src/hooks/use-toast.ts
// =================================================================================================

"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 7000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }


// =================================================================================================
// FILE: src/lib/placeholder-images.json
// =================================================================================================
{
  "placeholderImages": [
    {
      "id": "bus-side-view",
      "description": "A green bus on a road through mountains",
      "imageUrl": "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxidXMlMjB0cmF2ZWx8ZW58MHx8fHwxNzYyNjI3NTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "bus travel"
    },
    {
      "id": "smart-routing",
      "description": "A winding road through a forest, representing smart routing.",
      "imageUrl": "https://images.unsplash.com/photo-1489641024260-20e5cb3ee4aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx3aW5kaW5nJTIwcm9hZHxlbnwwfHx8fDE3NjI2NTE1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "winding road"
    },
    {
      "id": "gps-tracking",
      "description": "A map with a pin on it, representing GPS tracking.",
      "imageUrl": "https://images.unsplash.com/photo-1532154066703-3973764c81fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxtYXAlMjBsb2NhdGlvbnxlbnwwfHx8fDE3NjI1ODc4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "map location"
    },
    {
      "id": "personal-music",
      "description": "A person wearing headphones and enjoying music.",
      "imageUrl": "https://images.unsplash.com/photo-1617714313606-283484c136be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwZXJzb24lMjBoZWFkcGhvbmVzfGVufDB8fHx8MTc2MjY0MTUyMXww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "person headphones"
    },
    {
      "id": "real-time-availability",
      "description": "A digital display showing bus schedules.",
      "imageUrl": "https://images.unsplash.com/photo-1759661937582-0ccd5dacf20f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxiKaWdpdGFsJTIwc2NoZWR1bGV8ZW58MHx8fHwxNzYyNjA2ODYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "digital schedule"
    },
    {
      "id": "frosted-glass-ui",
      "description": "An abstract image with a frosted glass effect.",
      "imageUrl": "https://img.freepik.com/premium-vector/template-glass-morphism-style-frosted-glass-screen-with-blurry-floating-green-spheres_206325-2919.jpg",
      "imageHint": "abstract frosted"
    },
    {
      "id": "accra-map",
      "description": "A stylized map of Accra, Ghana, showing a bus route.",
      "imageUrl": "https://images.unsplash.com/photo-1622372738946-62e025315332?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYXAlMjBvZiUyMGFjY3JhJTIwZ2hhbmF8ZW58MHx8fHwxNzYyODExNzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "accra ghana map"
    },
    {
      "id": "map-route",
      "description": "A map showing a route from one point to another.",
      "imageUrl": "https://images.unsplash.com/photo-1613943343362-d7b3ae55c170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtYXAlMjByb3V0ZXxlbnwwfHx8fDE3NjM0NTUwMDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "map route"
    },
    {
      "id": "user-avatar",
      "description": "An avatar of a person.",
      "imageUrl": "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "user avatar"
    },
    {
      "id": "eritas-logo",
      "description": "The Eritas company logo.",
      "imageUrl": "/eritas-logo.png",
      "imageHint": "company logo"
    },
    {
      "id": "music-art-1",
      "description": "A highlife guitarist on a Ghanaian beach.",
      "imageUrl": "https://img.freepik.com/premium-psd/highlife-guitarist-ghanaian-beach-with-fishing-boats-vector-illustration-music-poster-idea_1020495-438011.jpg",
      "imageHint": "highlife guitarist"
    },
    {
      "id": "music-art-2",
      "description": "Hiphop street style dancers.",
      "imageUrl": "https://img.freepik.com/premium-photo/dynamic-hiphop-street-style-with-fashionable-young-dancers_151355-90820.jpg?semt=ais_se_enriched&w=740&q=80",
      "imageHint": "hiphop dancers"
    },
    {
      "id": "music-art-3",
      "description": "Vibrant afrobeat fusion artwork.",
      "imageUrl": "https://img.freepik.com/premium-photo/vibrant-afrobeat-fusion-colorful-silhouette-tshirt-design_931866-39048.jpg",
      "imageHint": "vibrant afrobeat"
    },
    {
      "id": "music-art-4",
      "description": "A singer performing at a concert with lights.",
      "imageUrl": "https://img.freepik.com/free-photo/dancing-concert-while-singer-is-performing-surrounded-with-lights_181624-22022.jpg?semt=ais_hybrid&w=740&q=80",
      "imageHint": "gospel concert"
    },
    {
      "id": "artist-sarkodie",
      "description": "Image of the artist Sarkodie.",
      "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb8b809ac2ea8b54869eb9b977",
      "imageHint": "male artist"
    },
    {
      "id": "artist-stonebwoy",
      "description": "Image of the artist Stonebwoy.",
      "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebf8541a4f3743c79c88a5563c",
      "imageHint": "male artist"
    },
    {
      "id": "artist-shatta-wale",
      "description": "Image of the artist Shatta Wale.",
      "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb6c433367b6604a3e2646c243",
      "imageHint": "male artist"
    },
    {
      "id": "artist-el",
      "description": "Image of the artist E.L.",
      "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe6b8026d246c4349da8b6151",
      "imageHint": "male artist"
    }
  ]
}

// =================================================================================================
// FILE: src/lib/placeholder-images.ts
// =================================================================================================
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;


// =================================================================================================
// FILE: src/lib/spotify.ts
// =================================================================================================

/**
 * @fileOverview A service for interacting with the Spotify Web API.
 */

// A simple in-memory cache for the Spotify access token
let accessToken: {
    value: string;
    expiresAt: number;
} | null = null;

let tokenPromise: Promise<string> | null = null;

/**
 * Gets a Spotify API access token using the Client Credentials Flow.
 * It caches the token in memory to avoid requesting a new one on every call.
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
async function getAccessToken(): Promise<string> {
    if (accessToken && accessToken.expiresAt > Date.now()) {
        return accessToken.value;
    }
    
    // If a token request is already in flight, wait for it to complete
    if (tokenPromise) {
        return tokenPromise;
    }

    tokenPromise = (async () => {
        const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

        if (!client_id || !client_secret) {
            throw new Error("Spotify client ID or secret not configured in .env file");
        }

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            tokenPromise = null; // Clear the promise on failure
            throw new Error(`Failed to fetch Spotify access token: ${response.statusText}`);
        }

        const data = await response.json();
        const expiresIn = data.expires_in * 1000; // Convert to milliseconds

        accessToken = {
            value: data.access_token,
            expiresAt: Date.now() + expiresIn,
        };
        
        tokenPromise = null; // Clear the promise on success
        return accessToken.value;
    })();

    return tokenPromise;
}


/**
 * Searches for tracks on Spotify.
 * @param {string} query The search query.
 * @param {number} [limit=10] The maximum number of results to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of track items.
 */
export async function searchTracks(query: string, limit: number = 10): Promise<any[]> {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to search Spotify tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.items;
}

/**
 * Searches for artists on Spotify.
 * @param {string} query The search query for the artist.
 * @param {number} [limit=1] The maximum number of results to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of artist items.
 */
export async function searchArtists(query: string, limit: number = 1): Promise<any[]> {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to search Spotify artists: ${response.statusText}`);
    }

    const data = await response.json();
    return data.artists.items;
}

/**
 * Gets details for a single artist from Spotify.
 * @param {string} artistId The Spotify ID of the artist.
 * @returns {Promise<any>} A promise that resolves to the artist object.
 */
export async function getArtist(artistId: string): Promise<any> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch artist: ${response.statusText}`);
    return await response.json();
}

/**
 * Gets an artist's albums from Spotify.
 * @param {string} artistId The Spotify ID of the artist.
 * @param {number} [limit=20] The maximum number of albums to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of album items.
 */
export async function getArtistAlbums(artistId: string, limit: number = 20): Promise<any[]> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch artist albums: ${response.statusText}`);
    const data = await response.json();
    return data.items;
}

/**
 * Gets tracks for a specific album from Spotify.
 * @param {string} albumId The Spotify ID of the album.
 * @param {number} [limit=50] The maximum number of tracks to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of track items.
 */
export async function getAlbumTracks(albumId: string, limit: number = 50): Promise<any[]> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch album tracks: ${response.statusText}`);
    const data = await response.json();
    return data.items;
}


// =================================================================================================
// FILE: src/lib/utils.ts
// =================================================================================================
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// =================================================================================================
// FILE: src/locales/en.json
// =================================================================================================

{
    "myProfile": "My Profile",
    "guest": "Guest",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "profileSettings": "Profile Settings",
    "recentTrips": "Recent Trips",
    "tripQrCodes": "Trip QR Codes",
    "savedPlaces": "Saved Places",
    "addHomeAddress": "Add home address",
    "addWorkAddress": "Add work address",
    "addPlace": "Add a new place",
    "userDiscounts": "User Discounts",
    "loyaltyPoints": "Loyalty Points",
    "language": "Language",
    "logout": "Logout",
    "deleteAccount": "Delete Account",
    "deleteAccountConfirmationTitle": "Are you absolutely sure?",
    "deleteAccountConfirmationDescription": "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    "cancel": "Cancel",
    "continue": "Continue",
    "accountDeletedToastTitle": "Account Deleted",
    "accountDeletedToastDescription": "Your account and all local data have been removed.",
    "deactivateDiscountTitle": "Deactivate Current Discount?",
    "deactivateDiscountDescription": "You have an active discount of {{percentage}}%. Deactivating it is permanent and cannot be undone.",
    "deactivate": "Deactivate",
    "discountEligibilityTitle": "Discount Eligibility",
    "discountEligibilityDescription": "Congratulations! You are eligible for a {{percentage}}% discount on your next 3 trips. Activate the code below to apply it to your account.",
    "close": "Close",
    "activate": "Activate",
    "discountActivatedToastTitle": "Discount Activated!",
    "discountActivatedToastDescription": "Your {{percentage}}% discount has been applied to your account.",
    "discountDeactivatedToastTitle": "Discount Deactivated",
    "discountDeactivatedToastDescription": "Your active discount has been removed.",
    "notifications": "Notifications",
    "clearAll": "Clear All",
    "noNewNotifications": "You have no new notifications.",
    "eritasPayBalance": "ERITAS Pay Balance",
    "cashBackOnBusTickets": "5% cash back on bus tickets",
    "walletThreshold": "Wallet Threshold",
    "increaseLimitByVerifying": "Increase your limit by verifying your identity.",
    "topUp": "Top-up",
    "synchronizeWithVisa": "Synchronize with VISA",
    "recentActivity": "Recent Activity",
    "seeAll": "See all",
    "hide": "Hide",
    "busTicketPayment": "Bus Ticket Payment",
    "mobileMoneyTopUp": "Mobile Money Top-up",
    "yourBoardingPass": "Your Boarding Pass",
    "boardingQrCode": "Boarding QR Code",
    "showQrToDriver": "Show this QR code to the driver for verification.",
    "seat": "Seat",
    "foodTitle": "FOOD",
    "foodDescription": "This is where the Food feature will live.",
    "there": "there",
    "onTheBusToastTitle": "You're on the bus!",
    "onTheBusToastDescription": "You can now add songs to the bus playlist.",
    "insufficientBalanceToastTitle": "Insufficient Balance",
    "insufficientBalanceToastDescription": "Your ERITAS Pay balance is too low to book this trip. Please top-up.",
    "seatBookedNotificationTitle": "Seat Booked Successfully!",
    "seatBookedNotificationDescription": "Your seat {{seat}} on bus {{plate}} is confirmed.",
    "viewQrCode": "View QR Code",
    "fareDeductedToastDescription": "The fare of GH₵{{fare}} has been deducted.",
    "discountAppliedToast": "({{percentage}}% discount applied!)",
    "seatBookedToastTitle": "Seat Booked!",
    "discountActivatedTitle": "{{percentage}}% Discount Activated!",
    "viewSeats": "View Seats",
    "seatSelected": "Seat {{seat}} Selected",
    "selectYourSeat": "Select Your Seat(s)",
    "busCapacity": "Bus Capacity",
    "seats": "Seats",
    "busFares": "Bus Fares:",
    "final": "Final",
    "arrivingIn": "Arriving in <strong>{{minutes}} min</strong>",
    "busHasArrived": "Bus has arrived!",
    "selectBusSeatFirst": "Select a seat first",
    "board": "BOARD",
    "busIsFull": "This bus is full.",
    "homeGreeting": "Hi {{name}}, ready for your next trip?",
    "homeSubGreeting": "Find the perfect bus for your journey",
    "from": "From",
    "to": "To",
    "searchBuses": "Search Buses",
    "friend": "Friend",
    "welcomeMessage": "Your journey starts here. Access your account or create a new one.",
    "topUpFromCardTitle": "Top-up from Card",
    "linkVisaCardTitle": "Link VISA Card",
    "cardBalance": "Card Balance",
    "cardholderNamePlaceholder": "CARDHOLDER NAME",
    "enterCardDetailsTitle": "Enter Card Details",
    "enterCardDetailsDescription": "Enter your VISA card credentials to link it.",
    "cardNumberLabel": "Card Number",
    "cardHolderNameLabel": "Card Holder Name",
    "cardHolderNameExample": "e.g., Jane Doe",
    "expiryDateLabel": "Expiry Date",
    "linkCardButton": "Link Card",
    "topUpEritasPayWalletTitle": "Top-up ERITAS Pay Wallet",
    "topUpEritasPayWalletDescription": "Enter the amount you want to transfer from your linked VISA card.",
    "amountLabel": "Amount (GH₵)",
    "amountExample": "e.g., 100.00",
    "topUpFromCardButton": "Top-up from Card",
    "cardLinkedToastTitle": "Card Linked Successfully",
    "cardLinkedToastDescription": "Your VISA card has been synchronized with your ERITAS Pay account.",
    "invalidAmountToastTitle": "Invalid Amount",
    "invalidAmountToastDescription": "Please enter a valid amount to top up.",
    "visaCardTopUp": "VISA Card Top-up",
    "topUpSuccessfulToastTitle": "Top-up Successful",
    "topUpSuccessfulToastDescription": "GH₵{{amount}} has been added to your ERITAS Pay balance.",
    "browse": "Browse",
    "busPlaylist": "Bus Playlist",
    "nowPlaying": "Now Playing",
    "upNext": "Up next",
    "noSongsAdded": "No songs added yet.",
    "browseAndAddSongs": "Browse and add songs to the playlist.",
    "boardBusToSeePlaylist": "Board a bus to see the playlist",
    "playlistOnlyOnTrip": "The bus playlist is only available during your trip.",
    "searchSongsPlaceholder": "Search for songs or artists",
    "moods": "Moods",
    "genres": "Genres",
    "artists": "Artists",
    "moodsComingSoon": "Moods feature coming soon!",
    "artistsComingSoon": "Artists feature coming soon!",
    "newTracks": "New Tracks",
    "searchResultsFor": "Results for \"{{query}}\"",
    "noTracksFound": "No tracks found.",
    "searchForBuses": "Search For Buses",
    "showingResultsFor": "Showing results for:",
    "minutesAbbr": "{{minutes}} min",
    "eta": "ETA",
    "noBusesFound": "No buses found for this route.",
    "findYourBus": "Find Your Bus",
    "enterDestinationToSeeBuses": "Enter a destination to see available buses.",
    "notLoggedIn": "You're not logged in",
    "signInToEditProfile": "Please sign in to edit your profile.",
    "goToSignIn": "Go to Sign In",
    "editProfile": "Edit Profile",
    "fullNameLabel": "Full Name",
    "fullNamePlaceholder": "e.g., Jane Doe",
    "emailAddressLabel": "Email Address",
    "emailAddressPlaceholder": "e.g., jane.doe@example.com",
    "newPasswordLabel": "New Password",
    "newPasswordPlaceholder": "Enter new password",
    "confirmNewPasswordLabel": "Confirm New Password",
    "confirmNewPasswordPlaceholder": "Confirm new password",
    "saveChanges": "Save Changes",
    "profileUpdatedToastTitle": "Profile Updated",
    "profileUpdatedToastDescription": "Your profile changes have been saved successfully.",
    "passwordUpdatedToastDescription": "Your password has also been updated.",
    "linkedDevices": "Linked Devices",
    "linkedDevicesDescription": "These are the devices that are currently signed in to your account.",
    "currentDevice": "Current device",
    "unlinkDeviceTitle": "Unlink this device?",
    "unlinkDeviceDescription": "Are you sure you want to unlink the {{deviceName}}? It will be signed out of your account.",
    "unlink": "Unlink",
    "routeAlerts": "Route Alerts",
    "routeAlertsDescription": "Real-time updates about your bus route.",
    "bookingAlerts": "Booking Alerts",
    "bookingAlertsDescription": "Confirmations and reminders for your bookings.",
    "systemAlerts": "System Alerts",
    "systemAlertsDescription": "Important updates about the app and services.",
    "linkedDevicesDescriptionSettings": "See other phones using this account",
    "paymentMethods": "Payment Methods",
    "paymentMethodsDescription": "Add/remove MoMo, cards, Eritas Pay wallet",
    "notificationsDescription": "Enable/disable route or booking alerts",
    "securitySettings": "Security Settings",
    "securitySettingsDescription": "PIN, biometric login, 2FA toggle",
    "appTheme": "App Theme",
    "appThemeDescription": "Light / Dark / Auto",
    "eritasPayDescription": "Your primary wallet for all in-app payments.",
    "currentBalance": "Current Balance",
    "linkedCards": "Linked Cards",
    "linkedCardsDescription": "Manage your connected credit and debit cards.",
    "cardEndingIn": "{{type}} ending in {{last4}}",
    "expires": "Expires",
    "removeCardTitle": "Remove this card?",
    "removeCardDescription": "Are you sure you want to remove the card ending in {{last44}}?",
    "remove": "Remove",
    "addNewCard": "Add New Card",
    "mobileMoney": "Mobile Money",
    "mobileMoneyDescription": "Manage your connected Mobile Money accounts.",
    "removeAccountTitle": "Remove this account?",
    "removeMomoAccountDescription": "Are you sure you want to remove this Mobile Money account?",
    "addMobileMoney": "Add Mobile Money",
    "yourTripHistory": "Your Trip History",
    "yourTripHistoryDescription": "A log of all your completed bus journeys.",
    "tripOnBus": "Trip on bus {{plate}}",
    "journeyDetailsPlaceholder": "Journey details would appear here",
    "fare": "Fare",
    "noTripHistory": "No Trip History",
    "noTripHistoryDescription": "You haven't completed any trips yet.",
    "pinLogin": "PIN Login",
    "pinLoginDescription": "Secure your app with a 4-digit PIN.",
    "changePin": "Change PIN",
    "biometricLogin": "Biometric Login",
    "biometricLoginDescription": "Use Face ID or fingerprint to log in.",
    "twoFactorAuth": "Two-Factor Authentication",
    "twoFactorAuthDescription": "Add an extra layer of security to your account.",
    "topUpWallet": "Top-up Wallet",
    "selectMomoNetwork": "Select Mobile Money Network",
    "enterDetails": "Enter Details",
    "enterDetailsDescription": "Enter the phone number and amount for the top-up.",
    "phoneNumberLabel": "Phone Number",
    "confirmTopUp": "Confirm Top-up",
    "signInSuccessfulToastTitle": "Sign In Successful",
    "signInSuccessfulToastDescription": "Welcome back!",
    "signUpSuccessfulToastTitle": "Sign Up Successful",
    "signUpSuccessfulToastDescription": "Your account has been created. Welcome to Eritas Gateway!",
    "socialSignInToastTitle": "Signed in with {{provider}}",
    "welcome": "Welcome!",
    "orContinueWith": "Or continue with",
    "firstNameLabel": "First Name",
    "firstNamePlaceholder": "Jane",
    "lastNameLabel": "Last Name",
    "lastNamePlaceholder": "Doe",
    "emailOptionalLabel": "Email (Optional)",
    "passwordLabel": "Password",
    "confirmPasswordLabel": "Confirm Password",
    "home": "Home",
    "eritasPay": "ERITAS Pay",
    "findABus": "Find A Bus",
    "food": "Food",
    "music": "MUSIC",
    "available": "Available",
    "selected": "Selected",
    "taken": "Taken",
    "confirmSeat": "Confirm Seat",
    "mapBillingError": "Google Maps has been disabled for this app because billing is not enabled on the associated Google Cloud project. The project owner should enable billing to restore map functionality.",
    "mapLoadError": "Google Maps failed to load. This might be due to a missing API key or other configuration issue. Please check the browser console for more details.",
    "mapErrorTitle": "Map Error",
    "findingYourLocation": "Finding your location...",
    "mapConfigErrorDescription": "Google Maps API Key is missing from your environment variables.",
    "noConnection": "No Connection",
    "noConnectionDescription": "Please check your internet connection and try again. The app will automatically reconnect when it's back online.",
    "smartRoutingTitle": "Smart Routing",
    "smartRoutingDescription": "Our intelligent algorithms find the fastest and most efficient routes, so you get to your destination sooner.",
    "gpsTrackingTitle": "Intelligent GPS Tracking",
    "gpsTrackingDescription": "Track your bus in real-time on the map. Know exactly when it will arrive and plan your time better.",
    "personalMusicTitle": "Your Music, Your Ride",
    "personalMusicDescription": "Enjoy a personalized playlist based on your favorite music. Your journey, your soundtrack.",
    "realTimeAvailabilityTitle": "Real-time Availability",
    "realTimeAvailabilityDescription": "Check seat availability and book your ticket instantly. No more waiting or uncertainty.",
    "frostedGlassUiTitle": "Frosted Glass UI",
    "frostedGlassUiDescription": "Experience ERITAS' unique frosted glass UI on another level.",
    "getStarted": "Get Started",
    "savePreferences": "Save Preferences",
    "preferencesSavedToastTitle": "Preferences Saved!",
    "uhOhSomethingWentWrong": "Uh oh! Something went wrong.",
    "tellUsMoreTitle": "Tell Us More About You",
    "tellUsMoreDescription": "Help us personalize your experience by sharing your favorites.",
    "favouriteFoodLabel": "Favourite Food",
    "favouriteFoodPlaceholder": "e.g., Waakye, Jollof Rice",
    "favouriteMusicLabel": "Favourite Music",
    "favouriteMusicPlaceholder": "e.g., Highlife, Afrobeats",
    "favouriteDestinationLabel": "Favourite Ghanaian Destination",
    "favouriteDestinationPlaceholder": "e.g., Cape Coast Castle, Kakum National Park",
    "lowBalanceWarningToastTitle": "Low Balance Warning",
    "lowBalanceWarningToastDescription": "Your wallet balance is running low. Top-Up now to avoid any trip-related issues.",
    "notOnBusToastTitle": "Not on Bus",
    "notOnBusToastDescription": "You must be on a bus to add songs to the playlist.",
    "alreadyInPlaylistToastTitle": "Already in Playlist",
    "alreadyInPlaylistToastDescription": "'{{title}}' is already in the bus playlist.",
    "addedToPlaylistToastTitle": "Added to Playlist",
    "addedToPlaylistToastDescription": "'{{title}}' by {{artist}} has been added to the bus playlist.",
    "cannotRemoveSongToastTitle": "Cannot Remove",
    "cannotRemoveSongToastDescription": "You can only remove songs you have added.",
    "songRemovedToastTitle": "Song Removed",
    "songRemovedToastDescription": "The song has been removed from the playlist.",
    "totalPoints": "Total Points",
    "redeemForDiscounts": "Redeem for discounts on future trips",
    "pointsHistory": "Points History",
    "pointsHistoryDescription": "A log of all loyalty points earned from your trips.",
    "points": "Points",
    "noPointsHistory": "No Points History",
    "noPointsHistoryDescription": "Take a trip to start earning loyalty points.",
    "loyaltyPointsAwarded": "Loyalty Points Awarded!",
    "loyaltyPointsAwardedDescription": "You earned {{points}} points from your last trip!",
    "shareMyTrip": "Share My Trip",
    "noActiveTripTitle": "No Active Trip",
    "noActiveTripDescription": "You can only share your trip details when you are on a bus.",
    "shareNotSupportedTitle": "Share Not Supported",
    "shareNotSupportedDescription": "Your browser does not support the Web Share API.",
    "shareTripText": "I'm on my way! My bus ({{plate}}, driven by {{driver}}) is heading to {{destination}} and will arrive in about {{eta}} minutes.",
    "trackMyTrip": "Track my trip",
    "shareFailedTitle": "Share Failed",
    "shareFailedDescription": "An error occurred while trying to share your trip.",
    "shareCancelledTitle": "Share Cancelled",
    "shareCancelledDescription": "Your trip details were not shared.",
    "tripEndedTitle": "Trip Ended",
    "tripEndedDescription": "You have arrived at your destination. Hope you had a pleasant journey!",
    "shareTripPageTitle": "Share Your Trip",
    "tripDetails": "Trip Details",
    "bus": "Bus",
    "driver": "Driver",
    "destination": "Destination",
    "shareVia": "Share via...",
    "phoneNumberForSharing": "Recipient's Phone Number",
    "send": "Send",
    "shareViaSms": "SMS",
    "copyLink": "Copy Link",
    "linkCopied": "Trip link copied to clipboard!",
    "goToHome": "Go to Home",
    "tripInProgress": "Trip in progress. View ETA above.",
    "arrivingAt": "Arriving at",
    "busArrivingAtYourLocation": "Bus arriving at your location",
    "signInToContinue": "Sign In to Continue",
    "signInToAccessFeatures": "Please sign in to access all app features.",
    "youHaveArrived": "You have arrived!",
    "editSavedPlace": "Edit Saved Place",
    "addANewPlace": "Add a New Place",
    "saveAddressForQuickAccess": "Save this address for quick access in the future.",
    "address": "Address",
    "enterAddressPlaceholder": "e.g., 123 Main St, Accra",
    "savePlace": "Save Place",
    "placeSaved": "Place Saved",
    "addressSavedSuccessfully": "The address has been successfully saved.",
    "placeRemoved": "Place Removed",
    "tripCancelled": "Trip Cancelled",
    "tripCancelledDescription": "Your trip has been cancelled and GH₵{{fare}} has been refunded to your wallet.",
    "cancelTripConfirmationTitle": "Are you sure you want to cancel?",
    "cancelTripConfirmationDescription": "Your seat will be released and the fare will be refunded to your ERITAS Pay wallet.",
    "goBack": "Go Back",
    "confirmCancellation": "Yes, Cancel Trip",
    "seatsSelected": "{{count}} seats selected",
    "farePerSeat": "GH₵{{fare}} / seat",
    "notEnoughSeats": "Not enough seats available for your selection.",
    "primary": "Primary",
    "reserved": "Reserved",
    "confirmSeats": "Confirm {{count}} Seats",
    "seatCount": "Seat(s)",
    "yourSeat": "Your Seat",
    "reservedSeats": "Reserved Seats",
    "shareTripReservedSeatsText": "I've reserved {{count}} seat(s) for you: {{seats}}.",
    "shareTripPickupText": "Please be at any of these official ERITAS checkpoints for pickup: {{stops}}.",
    "seatsReservedForOthers": "Seats Reserved",
    "seatsReservedForOthersDescription": "You have reserved multiple seats. You can share the trip details with the recipients.",
    "sendToRecipient": "Send to Recipient",
    "tripQrCodesTitle": "Your Trip QR Codes",
    "tripQrCodesDescription": "A history of your recent trips and their QR codes.",
    "noTripQrs": "No QR Codes Found",
    "noTripQrsDescription": "You haven't completed any trips yet to see QR codes.",
    "nextStop": "Next Stop",
    "finalDestination": "Final Destination",
    "clearNotificationsTitle": "Clear all notifications?",
    "clearNotificationsDescription": "Are you sure you want to clear all your notifications? This action cannot be undone.",
    "confirmClear": "Clear",
    "noRecentActivity": "No recent activity to show.",
    "myPlaces": "My Places",
    "myPlacesDescription": "Quickly access your frequent destinations.",
    "edit": "Edit",
    "removePlaceTitle": "Remove Place?",
    "removePlaceDescription": "Are you sure you want to remove {{placeName}} from your saved places?",
    "cashPayment": "Cash",
    "cashPaymentDescription": "Select cash as your preferred payment method.",
    "payWithCash": "Pay with Cash"
}


// =================================================================================================
// FILE: src/locales/tw.json
// =================================================================================================

{
    "myProfile": "Me Din",
    "guest": "Ɔhɔhoɔ",
    "signIn": "Kɔ mu",
    "signUp": "Yɛ Rejista",
    "profileSettings": "Profail Nsiesiee",
    "recentTrips": "Akwan a Atwam Nsɛm",
    "tripQrCodes": "Akwan QR Mfonin",
    "savedPlaces": "Mmea a Wɔakora",
    "addHomeAddress": "Fa fie adrɛs ka ho",
    "addWorkAddress": "Fa adwuma adrɛs ka ho",
    "addPlace": "Fa beae foforo ka ho",
    "userDiscounts": "Ntawntawdo a Wɔde Ma",
    "loyaltyPoints": "Nneɛma a Wɔde Kyɛ",
    "language": "Kasa",
    "logout": "Pue",
    "deleteAccount": "Popa Akawnt",
    "deleteAccountConfirmationTitle": "Woawie pɛyɛ?",
    "deleteAccountConfirmationDescription": "Saa adeyɛ yi rentumi nsan. Eyi bɛpopa wo akawnt no afebɔɔ na ayi wo data afi yɛn server so.",
    "cancel": "Mma Ennyɛ Yie",
    "continue": "Toa So",
    "accountDeletedToastTitle": "Akawnt no Apopa",
    "accountDeletedToastDescription": "Wo akawnt ne wo data a ɛwɔ mpɔtam ha nyinaa apopa.",
    "deactivateDiscountTitle": "Wo Ntawntawdo a ɛwɔ hɔ yi, wopɛ sɛ wuyi fi so anaa?",
    "deactivateDiscountDescription": "Wowɔ ntawntawdo a ɛyɛ {{percentage}}% a ɛwɔ hɔ. Sɛ wuyi fi so a, ɛyɛ daa na worentumi nsan nnya bio.",
    "deactivate": "Yi fi so",
    "discountEligibilityTitle": "Ntawntawdo Hokwan",
    "discountEligibilityDescription": "Amansuon! Wowɔ hokwan sɛ wunya ntawntawdo a ɛyɛ {{percentage}}% wɔ w’akwantu a edi hɔ 3 no so. Fa koodu a ɛwɔ ase hɔ no yɛ adwuma na fa ka w’akawnt ho.",
    "close": "To mu",
    "activate": "Fa yɛ adwuma",
    "discountActivatedToastTitle": "Ntawntawdo no Ayɛ Adwuma!",
    "discountActivatedToastDescription": "Wɔde wo {{percentage}}% ntawntawdo no aka w’akawnt ho.",
    "discountDeactivatedToastTitle": "Ntawntawdo no Ayi Firi So",
    "discountDeactivatedToastDescription": "Wɔayi wo ntawntawdo a na ɛwɔ hɔ no afi so.",
    "notifications": "Nkaebɔ",
    "clearAll": "Popa Nyinaa",
    "noNewNotifications": "Wonni nkaebɔ foforo biara.",
    "eritasPayBalance": "ERITAS Pay Sika a Aka",
    "cashBackOnBusTickets": "Wɔde sika 5% san ma wo wɔ bɔs tekiti so",
    "walletThreshold": "Bɔtɔm Sika a ɛwɔ mu",
    "increaseLimitByVerifying": "Ma w'ahoɔden so denam wo ho a wode bɛkyerɛ so.",
    "topUp": "Fa Sika Gu mu",
    "synchronizeWithVisa": "Fa ka VISA ho",
    "recentActivity": "Nneɛma a Asisi Nkyɛree",
    "seeAll": "Hwɛ ne nyinaa",
    "hide": "Fa sie",
    "busTicketPayment": "Bɔs Tekiti Tɔ",
    "mobileMoneyTopUp": "Mobile Money a Wɔde Gu mu",
    "yourBoardingPass": "Wo Bɔs Tekiti",
    "boardingQrCode": "Bɔs QR Koodu",
    "showQrToDriver": "Kyerɛ bɔs karkafoɔ no QR koodu yi na ɔnhwɛ mu.",
    "seat": "Akonnwa",
    "foodTitle": "ADUANE",
    "foodDescription": "Hɔ na aduane gyinabea no bɛyɛ adwuma.",
    "there": "hɔ",
    "onTheBusToastTitle": "Wo wɔ bɔs no mu!",
    "onTheBusToastDescription": "Afei de, wubetumi de nnwom aka bɔs no playlist ho.",
    "insufficientBalanceToastTitle": "Sika Nni Bɔtɔm",
    "insufficientBalanceToastDescription": "Wo ERITAS Pay sika a aka no nnuru sɛ wobɛtɔ saa akwantu yi. Yɛsrɛ wo, fa sika gu mu.",
    "seatBookedNotificationTitle": "Akonnwa no Atɔ Yie!",
    "seatBookedNotificationDescription": "Wɔagye w'akonnwa {{seat}} a ɛwɔ bɔs {{plate}} mu no atom.",
    "viewQrCode": "Hwɛ QR Koodu",
    "fareDeductedToastDescription": "Wɔayi akwantu ka GH₵{{fare}} afi wo sika so.",
    "discountAppliedToast": "({{percentage}}% aniammɔnho ayɛ adwuma!)",
    "seatBookedToastTitle": "Akonnwa Atɔ!",
    "discountActivatedTitle": "{{percentage}}% Aniammɔnho Ayɛ Adwuma!",
    "viewSeats": "Hwɛ Akonnwa",
    "seatSelected": "Woapaw Akonnwa {{seat}}",
    "selectYourSeat": "Paw W'akonnwa",
    "busCapacity": "Bɔs no Mu Dodo",
    "seats": "Akonnwa",
    "busFares": "Bɔs Ka:",
    "final": "Awiei",
    "arrivingIn": "Ɔredu simma <strong>{{minutes}}</strong> mu",
    "busHasArrived": "Bɔs no adu!",
    "selectBusSeatFirst": "Di kan paw bɔs akonnwa ansa",
    "board": "FORO",
    "busIsFull": "Saa bɔs yi ayɛ ma.",
    "homeGreeting": "Hi {{name}}, woasiesie wo ho ama w'akwantu a edi hɔ no?",
    "homeSubGreeting": "Hwehwɛ bɔs a ɛfata ma w'akwantu no",
    "from": "Efi",
    "to": "Kɔ",
    "searchBuses": "Hwehwɛ Bɔs",
    "friend": "Adamfo",
    "welcomeMessage": "W'akwantu no fi ase wɔ ha. Kɔ w'akawnt mu anaasɛ yɛ foforo.",
    "topUpFromCardTitle": "Fa Sika Gu mu fi Kaad so",
    "linkVisaCardTitle": "Fa VISA Kaad Bata ho",
    "cardBalance": "Kaad Sika a Aka",
    "cardholderNamePlaceholder": "KAAD WURA DIN",
    "enterCardDetailsTitle": "Hyɛ Wo Kaad Nsɛm no mu",
    "enterCardDetailsDescription": "Hyɛ wo VISA kaad nsɛm no mu na fa bata ho.",
    "cardNumberLabel": "Kaad Nɔma",
    "cardHolderNameLabel": "Kaad Wura Din",
    "cardHolderNameExample": "nhwɛso, Abena Amponsah",
    "expiryDateLabel": "Da a Ɛbɛba Awiei",
    "linkCardButton": "Fa Kaad Bata ho",
    "topUpEritasPayWalletTitle": "Fa Sika Gu ERITAS Pay Bɔtɔm mu",
    "topUpEritasPayWalletDescription": "Hyɛ sika dodow a wopɛ sɛ wode fi wo VISA kaad a woabata ho no so.",
    "amountLabel": "Sika (GH₵)",
    "amountExample": "nhwɛso, 100.00",
    "topUpFromCardButton": "Fa Sika Gu mu fi Kaad so",
    "cardLinkedToastTitle": "Kaad no Abata ho Yie",
    "cardLinkedToastDescription": "Wɔde wo VISA kaad no abata wo ERITAS Pay akawnt ho.",
    "invalidAmountToastTitle": "Sika no Nnyɛ",
    "invalidAmountToastDescription": "Yɛsrɛ wo, hyɛ sika dodow a ɛfata na fa gu mu.",
    "visaCardTopUp": "VISA Kaad a Wɔde Gu mu",
    "topUpSuccessfulToastTitle": "Wɔde Sika no Agu mu Yie",
    "topUpSuccessfulToastDescription": "Wɔde GH₵{{amount}} aka wo ERITAS Pay sika a aka no ho.",
    "browse": "Hwehwɛ",
    "busPlaylist": "Bɔs Nnwom a Wɔbɔ",
    "nowPlaying": "Seesei ara yi",
    "upNext": "Nea ɛdi hɔ",
    "noSongsAdded": "Wɔmfa nnwom biara nkaa ho.",
    "browseAndAddSongs": "Hwehwɛ na fa nnwom ka playlist no ho.",
    "boardBusToSeePlaylist": "Foro bɔs na hwɛ playlist no",
    "playlistOnlyOnTrip": "Bɔs no playlist no wɔ hɔ bere a woreyɛ akwantu no nkutoo.",
    "searchSongsPlaceholder": "Hwehwɛ nnwom anaa nnwomtofoɔ",
    "moods": "Tebea",
    "genres": "Su",
    "artists": "Nnwomtofoɔ",
    "moodsComingSoon": "Tebea afa horo bɛba nkyɛ!",
    "artistsComingSoon": "Nnwomtofoɔ afa horo bɛba nkyɛ!",
    "newTracks": "Nnwom Foforo",
    "searchResultsFor": "Nea efiri mu aba ama \"{{query}}\"",
    "noTracksFound": "Yɛnhunu nnwom biara.",
    "searchForBuses": "Hwehwɛ Bɔs",
    "showingResultsFor": "Yɛrekyerɛ nea efiri mu aba ama:",
    "minutesAbbr": "simma {{minutes}}",
    "eta": "ETA",
    "noBusesFound": "Yɛnhunu bɔs biara wɔ saa kwan yi so.",
    "findYourBus": "Hwehwɛ Wo Bɔs",
    "enterDestinationToSeeBuses": "Hyɛ beae a worekɔ na hwɛ bɔs a ɛwɔ hɔ.",
    "notLoggedIn": "Wɔnkɔɔ mu",
    "signInToEditProfile": "Yɛsrɛ wo, kɔ mu na siesie wo profail.",
    "goToSignIn": "Kɔ Sign In",
    "editProfile": "Siesie Profail",
    "fullNameLabel": "Din a Wɔde Wo Nyinaa",
    "fullNamePlaceholder": "nhwɛso, Abena Amponsah",
    "emailAddressLabel": "Email Adrɛs",
    "emailAddressPlaceholder": "nhwɛso, abena.amponsah@example.com",
    "newPasswordLabel": "Ahintasɛm Foforo",
    "newPasswordPlaceholder": "Hyɛ ahintasɛm foforo mu",
    "confirmNewPasswordLabel": "Hyɛ Ahintasɛm Foforo no Mu Bio",
    "confirmNewPasswordPlaceholder": "Hyɛ ahintasɛm foforo no mu bio",
    "saveChanges": "Sie Nsakrae no",
    "profileUpdatedToastTitle": "Profail no Asakra",
    "profileUpdatedToastDescription": "Wɔasie wo profail nsakrae no yie.",
    "passwordUpdatedToastDescription": "Wɔasan nso asakra w’ahintasɛm.",
    "linkedDevices": "Mfiri a Wɔde Abata ho",
    "linkedDevicesDescription": "Yei ne mfiri a wɔde akɔ w’akawnt mu seesei ara.",
    "currentDevice": "Mfiri a ɛwɔ hɔ seesei",
    "unlinkDeviceTitle": "Wopɛ sɛ wuyi saa mfiri yi fi ho anaa?",
    "unlinkDeviceDescription": "Woawie pɛyɛ sɛ wopɛ sɛ wuyi {{deviceName}} no fi ho? Wɔbɛyi no afi w’akawnt mu.",
    "unlink": "Yi fi ho",
    "routeAlerts": "Kwan Ho Nkaebɔ",
    "routeAlertsDescription": "Nneɛma foforo a ɛfa wo bɔs kwan ho wɔ bere ankasa mu.",
    "bookingAlerts": "Tekiti Tɔ Ho Nkaebɔ",
    "bookingAlertsDescription": "Wo tekiti a woatɔ ho nkaebɔ ne nkaehyɛ.",
    "systemAlerts": "System Ho Nkaebɔ",
    "systemAlertsDescription": "App no ne dwumadie foforo ho nkaebɔ a ɛho hia.",
    "linkedDevicesDescriptionSettings": "Hwɛ fon afoforo a wɔde saa akawnt yi redi dwuma",
    "paymentMethods": "Sika Tua Kwan",
    "paymentMethodsDescription": "Fa MoMo, kaad, Eritas Pay bɔtɔm ka ho/yi fi so",
    "notificationsDescription": "Ma kwan anaa si kwan ho anaa tekiti tɔ ho nkaebɔ ano",
    "securitySettings": "Ahobammɔ Nsiesiee",
    "securitySettingsDescription": "PIN, biometric login, 2FA toggle",
    "appTheme": "App no Ahosuo",
    "appThemeDescription": "Hann / Esum / Automatic",
    "eritasPayDescription": "Wo bɔtɔm titiriw ma sika tua biara wɔ app no mu.",
    "currentBalance": "Sika a Aka Seesei",
    "linkedCards": "Kaad a Wɔde Abata ho",
    "linkedCardsDescription": "Hwɛ wo credit ne debit kaad a woabata ho no so.",
    "cardEndingIn": "{{type}} a ɛba awiei wɔ {{last4}}",
    "expires": "Ɛbɛba awiei",
    "removeCardTitle": "Wopɛ sɛ wuyi saa kaad yi fi ho anaa?",
    "removeCardDescription": "Woawie pɛyɛ sɛ wopɛ sɛ wuyi kaad a ɛba awiei wɔ {{last4}} no fi ho?",
    "remove": "Yi fi ho",
    "addNewCard": "Fa Kaad Foforo Ka ho",
    "mobileMoney": "Mobile Money",
    "mobileMoneyDescription": "Hwɛ wo Mobile Money akawnt a woabata ho no so.",
    "removeAccountTitle": "Wopɛ sɛ wuyi saa akawnt yi fi ho anaa?",
    "removeMomoAccountDescription": "Woawie pɛyɛ sɛ wopɛ sɛ wuyi saa Mobile Money akawnt yi fi ho?",
    "addMobileMoney": "Fa Mobile Money Ka ho",
    "yourTripHistory": "W'akwantu a Atwam Nsɛm",
    "yourTripHistoryDescription": "Wo bɔs akwantu a woawie no nyinaa ho kyerɛwtohɔ.",
    "tripOnBus": "Akwantu wɔ bɔs {{plate}} so",
    "journeyDetailsPlaceholder": "Akwantu no ho nsɛm bɛba ha",
    "fare": "Ka",
    "noTripHistory": "Akwantu a Atwam Nsɛm Nni hɔ",
    "noTripHistoryDescription": "Wo nwiee akwantu biara.",
    "pinLogin": "PIN Login",
    "pinLoginDescription": "Fa PIN nɔma 4 bɔ wo app no ho ban.",
    "changePin": "Sesa PIN",
    "biometricLogin": "Biometric Login",
    "biometricLoginDescription": "Fa w’anim anaa wo nsa-nsateaa kɔ mu.",
    "twoFactorAuth": "Two-Factor Authentication",
    "twoFactorAuthDescription": "Fa ahobammɔ foforo ka w’akawnt ho.",
    "topUpWallet": "Fa Sika Gu Bɔtɔm mu",
    "selectMomoNetwork": "Paw Mobile Money Network",
    "enterDetails": "Hyɛ Nsɛm no mu",
    "enterDetailsDescription": "Hyɛ fon nɔma ne sika dodow a wopɛ sɛ wode gu mu no mu.",
    "phoneNumberLabel": "Phone Number",
    "confirmTopUp": "Hyɛ Sika a Wode Regu mu no mu Den",
    "signInSuccessfulToastTitle": "Woakɔ mu Yie",
    "signInSuccessfulToastDescription": "Akwaaba san bra!",
    "signUpSuccessfulToastTitle": "Woayɛ Rejista Yie",
    "signUpSuccessfulToastDescription": "Wɔayɛ w’akawnt. Akwaaba wɔ Eritas Gateway!",
    "socialSignInToastTitle": "Wɔde {{provider}} akɔ mu",
    "welcome": "Akwaaba!",
    "orContinueWith": "Anaasɛ toa so wɔ",
    "favouriteMusicPlaceholder": "nhwɛso, Highlife, Afrobeats",
    "firstNameLabel": "First Name",
    "firstNamePlaceholder": "Abena",
    "lastNameLabel": "Last Name",
    "lastNamePlaceholder": "Amponsah",
    "emailOptionalLabel": "Email (Sɛ wopɛ a)",
    "passwordLabel": "Ahintasɛm",
    "confirmPasswordLabel": "Hyɛ Ahintasɛm no Mu Bio",
    "home": "Fie",
    "eritasPay": "ERITAS Pay",
    "findABus": "Hwehwɛ Bɔs",
    "food": "Aduane",
    "music": "Nnwom",
    "available": "Ɛwɔ hɔ",
    "selected": "Wɔapaw",
    "taken": "Wɔafa",
    "confirmSeat": "Paw Akonnwa",
    "mapBillingError": "Wɔasiw Google Maps kwan wɔ app yi so efisɛ wɔntuaa sika wɔ Google Cloud project a ɛbata ho no so. Ɛsɛ sɛ project wura no ma sika tua kwan na asan de asase mfonini no ayɛ adwuma.",
    "mapLoadError": "Google Maps antumi anyɛ adwuma. Ebia API key no ayera anaasɛ nsiesiei foforo bi nti. Yɛsrɛ wo, hwɛ browser console no mu na hwɛ nsɛm pii.",
    "mapErrorTitle": "Asase mfonini mu mfomso",
    "findingYourLocation": "Yɛrehwehwɛ wo baabi a wowɔ...",
    "mapConfigErrorDescription": "Google Maps API Key nni wo nneɛma a atwa yɛn ho ahyia no mu.",
    "noConnection": "Intanɛt Nni hɔ",
    "noConnectionDescription": "Yɛsrɛ wo, hwɛ w’intanɛt so na san bɔ mmɔden. App no bɛsan abata ho bio sɛ ɛba a.",
    "smartRoutingTitle": "Akwan a Wɔfa so Kyerɛ Kwan",
    "smartRoutingDescription": "Yɛn nimdeɛ a ɛyɛ nwonwa no hwehwɛ akwan a ɛyɛ hare na ɛyɛ mmerɛw sen biara, sɛnea ɛbɛyɛ a wubedu beae a worekɔ no ntɛm.",
    "gpsTrackingTitle": "GPS a Wɔde Di Akyi",
    "gpsTrackingDescription": "Di wo bɔs akyi wɔ asase mfonini so bere ankasa mu. Hu bere pɔtee a ɛbɛba na siesie wo bere yiye.",
    "personalMusicTitle": "Wo Nnwom, W'akwantu",
    "personalMusicDescription": "Tie nnwom a wɔayɛ ama wo titiriw a egyina nnwom a wopɛ so. W’akwantu, wo nnwom a wɔbɔ.",
    "realTimeAvailabilityTitle": "Bere Ankasa mu a Ɛwɔ Hɔ",
    "realTimeAvailabilityDescription": "Hwɛ akonnwa a aka na tɔ wo tekiti prɛko pɛ. Wontwɛn bio anaasɛ wonnya adwen-nsonsonee.",
    "frostedGlassUiTitle": "Frosted Glass UI",
    "frostedGlassUiDescription": "Hu ERITAS frosted glass UI a ɛyɛ nwonwa no wɔ ɔkwan foforo so.",
    "getStarted": "Fi Ase",
    "savePreferences": "Sie Nneɛma a Wopɛ",
    "preferencesSavedToastTitle": "Wɔasie Nneɛma a Wopɛ no!",
    "uhOhSomethingWentWrong": "Uh oh! Biribi ankɔ yie.",
    "tellUsMoreTitle": "Ka Wo Ho Nsɛm Pii Kyerɛ Yɛn",
    "tellUsMoreDescription": "Boa yɛn ma yɛnyɛ nneɛma mmerɛw mma wo denam nneɛma a wopɛ a wobɛkyerɛ yɛn so.",
    "favouriteFoodLabel": "Aduane a Wopɛ",
    "favouriteFoodPlaceholder": "nhwɛso, Waakye, Jollof Rice",
    "favouriteMusicLabel": "Nnwom a Wopɛ",
    "favouriteDestinationLabel": "Ghana Beae a Wopɛ",
    "favouriteDestinationPlaceholder": "nhwɛso, Cape Coast Abankɛse, Kakum National Park",
    "lowBalanceWarningToastTitle": "Sika a Aka Sua",
    "lowBalanceWarningToastDescription": "Wo bɔtɔm mu sika sua. Fa gu mu ntɛm na w’akwantu anyɛ basaa.",
    "notOnBusToastTitle": "Wɔnni Bɔs no mu",
    "notOnBusToastDescription": "Ɛsɛ sɛ wowɔ bɔs mu ansa na wode nnwom aka playlist no ho.",
    "alreadyInPlaylistToastTitle": "Ɛwɔ Playlist no mu dedaw",
    "alreadyInPlaylistToastDescription": "'{{title}}' wɔ bɔs no playlist no mu dedaw.",
    "addedToPlaylistToastTitle": "Wɔde Aka Playlist no ho",
    "addedToPlaylistToastDescription": "'{{title}}' a {{artist}} na ɔtoo no, wɔde aka bɔs no playlist no ho.",
    "cannotRemoveSongToastTitle": "Worentumi Nyi",
    "cannotRemoveSongToastDescription": "Nnwom a wo ara wode aka ho no nkutoo na wubetumi ayi.",
    "songRemovedToastTitle": "Wɔayi Nnwom no",
    "songRemovedToastDescription": "Wɔayi nnwom no afi playlist no so.",
    "totalPoints": "Nkontabuo nyinaa",
    "redeemForDiscounts": "Sesa ma aniammɔnho wɔ akwantu a ɛbɛba no so",
    "pointsHistory": "Nkontabuo Abakɔsɛm",
    "pointsHistoryDescription": "Nkontabuo a woanya afi w’akwantu ahorow mu no nyinaa ho kyerɛwtohɔ.",
    "points": "Nkontabuo",
    "noPointsHistory": "Nkontabuo Abakɔsɛm Nni hɔ",
    "noPointsHistoryDescription": "Fa akwantu na fi ase nya nkontabuo a wode bɛkyɛ.",
    "loyaltyPointsAwarded": "Nkontabuo a Wɔde Kyɛ no Ayɛ Adwuma!",
    "loyaltyPointsAwardedDescription": "Woanya nkontabuo {{points}} afi w’akwantu a etwaam no mu!",
    "shareMyTrip": "Kyɛ M'akwantu",
    "noActiveTripTitle": "Akwantu Biara Nni Hɔ",
    "noActiveTripDescription": "Wubetumi akyɛ w’akwantu ho nsɛm bere a wowɔ bɔs mu nkutoo.",
    "shareNotSupportedTitle": "Wɔnnye Nkyɛmu Ntom",
    "shareNotSupportedDescription": "Wo browser no nnye Web Share API no ntom.",
    "shareTripText": "Mewɔ kwan so! Me bɔs ({{plate}}, a {{driver}} na ɔreka) rekɔ {{destination}} na ɛbɛduru bɛyɛ simma {{eta}} mu.",
    "trackMyTrip": "Di m’akwantu akyi",
    "shareFailedTitle": "Nkyɛmu no Annyɛ Yie",
    "shareFailedDescription": "Mfomso bi asisi bere a yɛrebɔ mmɔden sɛ yɛbɛkyɛ w’akwantu no.",
    "shareCancelledTitle": "Nkyɛmu no Awiei",
    "shareCancelledDescription": "Wɔankyɛ w’akwantu no ho nsɛm.",
    "tripEndedTitle": "Akwantu no Aba Awiei",
    "tripEndedDescription": "Woadu beae a worekɔ no. Yɛwɔ anidaso sɛ w’akwantu no yɛɛ anigye!",
    "shareTripPageTitle": "Kyɛ W'akwantu",
    "tripDetails": "Akwantu Ho Nsɛm",
    "bus": "Bɔs",
    "driver": "Karkafoɔ",
    "destination": "Beae a Worekɔ",
    "shareVia": "Fa kyɛ wɔ...",
    "phoneNumberForSharing": "Onipa a ɔregye no fon nɔma",
    "send": "Mena",
    "shareViaSms": "SMS",
    "copyLink": "Kɔpi Link no",
    "linkCopied": "Wɔakɔpi akwantu link no agu clipboard so!",
    "goToHome": "Kɔ Fie",
    "tripInProgress": "Akwantu rekɔ so. Hwɛ ETA wɔ soro hɔ.",
    "arrivingAt": "Yɛrebedu",
    "busArrivingAtYourLocation": "Bɔs redu wo baabi",
    "signInToContinue": "Kɔ mu na Toa so",
    "signInToAccessFeatures": "Yɛsrɛ wo, kɔ mu na nya hokwan kɔ app no afa horow nyinaa.",
    "youHaveArrived": "Woadu!",
    "editSavedPlace": "Siesie Beae a Wɔakora",
    "addANewPlace": "Fa Beae Foforo Ka ho",
    "saveAddressForQuickAccess": "Sie adrɛs yi na wode adi dwuma ntɛmntɛm daakye.",
    "address": "Adrɛs",
    "enterAddressPlaceholder": "nhwɛso, 123 Main St, Accra",
    "savePlace": "Sie Beae",
    "placeSaved": "Beae a Wɔasie",
    "addressSavedSuccessfully": "Wɔasie adrɛs no yiye.",
    "placeRemoved": "Wɔayi Beae no",
    "tripCancelled": "Akwantu no Atwa",
    "tripCancelledDescription": "Wɔatwa w’akwantu no na wɔde GH₵{{fare}} asan agu wo bɔtɔm.",
    "cancelTripConfirmationTitle": "Woawie pɛyɛ sɛ wopɛ sɛ wotwa mu?",
    "cancelTripConfirmationDescription": "Wɔbɛyi w’akonnwa no na wɔde ka no asan agu wo ERITAS Pay bɔtɔm.",
    "goBack": "San W'akyi",
    "confirmCancellation": "Yiw, twa mu",
    "seatsSelected": "{{count}} akonnwa a wɔapaw",
    "farePerSeat": "GH₵{{fare}} / akonnwa",
    "notEnoughSeats": "Akonnwa a aka no nnuru sɛnea wopɛ no.",
    "primary": "Titiriw",
    "reserved": "Wɔakora",
    "confirmSeats": "Paw Akonnwa {{count}}",
    "seatCount": "Akonnwa dodow",
    "yourSeat": "W'akonnwa",
    "reservedSeats": "Akonnwa a Wɔakora",
    "shareTripReservedSeatsText": "Mayɛ krado ama wo akonnwa {{count}}: {{seats}}.",
    "shareTripPickupText": "Yɛsrɛ wo, kɔ ERITAS gyinabea biara a ɛwɔ hɔ na wɔmmɛfa wo: {{stops}}.",
    "seatsReservedForOthers": "Akonnwa a Wɔakora",
    "seatsReservedForOthersDescription": "Woakora akonnwa pii. Wubetumi akyɛ akwantu no ho nsɛm akyerɛ wɔn a wɔbɛgye no.",
    "sendToRecipient": "Mena kɔma nea ɔbɛgye no",
    "tripQrCodesTitle": "W'akwantu QR Mfonini Ahorow",
    "tripQrCodesDescription": "W'akwantu a atwam ne ne QR mfonini ahorow ho abakɔsɛm.",
    "noTripQrs": "Yɛnhunu QR Mfonini Biara",
    "noTripQrsDescription": "Wo nwiee akwantu biara a wobɛhwɛ QR mfonini ahorow.",
    "nextStop": "Gyinabea a Edi Hɔ",
    "finalDestination": "Awiei Gyinabea",
    "clearNotificationsTitle": "Popa nkaebɔ nyinaa anaa?",
    "clearNotificationsDescription": "Wopɛ sɛ wopopa wo nkaebɔ nyinaa? Wei deɛ worentumi nsan anyɛ.",
    "confirmClear": "Popa",
    "myPlaces": "Me Mmeaɛ",
    "myPlacesDescription": "Kɔ mmeaɛ a wokɔ hɔ daa no ntɛm.",
    "edit": "Siesie",
    "removePlaceTitle": "Yi Beae no?",
    "removePlaceDescription": "Woawie pɛyɛ sɛ wopɛ sɛ wuyi {{placeName}} fi wo mmea a woakora no mu?",
    "cashPayment": "Sika",
    "cashPaymentDescription": "Paw sika sɛ wo sika tua kwan a wopɛ.",
    "payWithCash": "Tua ne Sika"
}


// =================================================================================================
// FILE: tailwind.config.ts
// =================================================================================================

import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'bus-move': {
          '0%': { transform: 'translateX(-200px)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tw-rotate))' },
          '50%': { transform: 'translateY(-15px) rotate(var(--tw-rotate))' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tw-rotate))' },
          '50%': { transform: 'translateY(-8px) rotate(var(--tw-rotate))' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
            '0%, 100%': { boxShadow: '0 0 5px -2px hsl(var(--primary))' },
            '50%': { boxShadow: '0 0 10px 2px hsl(var(--primary))' },
        },
        'sound-wave': {
          '0%, 100%': { height: '0.5rem' },
          '50%': { height: '1.25rem' },
        },
        'satellite-orbit-outer': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'satellite-orbit-inner': {
          '0%': { transform: 'rotate(0deg) translateY(-8px) rotate(0deg)' },
          '50%': { transform: 'rotate(180deg) translateY(8px) rotate(-180deg)' },
          '100%': { transform: 'rotate(360deg) translateY(-8px) rotate(-360deg)' },
        },
        'slide-across': {
          '0%': { transform: 'translateX(-2rem) translateY(-50%)', opacity: '1' },
          '100%': { transform: 'translateX(120%) translateY(-50%)', opacity: '1' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bus-move': 'bus-move 25s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-slower': 'float-slower 8s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s ease-out forwards',
        'glow': 'glow 2.5s ease-in-out infinite',
        'sound-wave': 'sound-wave 2s ease-in-out infinite',
        'satellite-orbit-outer': 'satellite-orbit-outer 15s linear infinite',
        'satellite-orbit-inner': 'satellite-orbit-inner 15s ease-in-out infinite',
        'slide-across': 'slide-across 2s ease-in-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;


// =================================================================================================
// FILE: tsconfig.json
// =================================================================================================
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

