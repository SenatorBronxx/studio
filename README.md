# Eritas Gateway - Pseudocode Overview

This document provides a high-level pseudocode overview of the Eritas Gateway application's architecture and core functionality.

---

## 1. Core Structure & Providers

The application is a Next.js-based Progressive Web App (PWA) built with React and TypeScript. Global state and context are managed through a series of React Context Providers wrapped around the main application layout.

```
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
```

## 2. Authentication Flow (`/app/page.tsx`)

Handles user sign-in and sign-up.

```pseudocode
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
```

## 3. Home & Bus Search (`/app/home/page.tsx`, `/app/search/page.tsx`)

The core user experience for finding and boarding a bus.

```pseudocode
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
```

## 4. Wallet & Payments (`/app/eritas-pay/page.tsx`, `/app/top-up/page.tsx`)

Manages the user's balance and transaction history.

```pseudocode
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
```

## 5. Music Integration (`/app/music/page.tsx`, `/context/music-context.tsx`)

Allows users on an active trip to manage a shared bus playlist.

```pseudocode
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
```

## 6. Settings & Profile Management (`/app/settings/*.tsx`)

A collection of pages for managing user-specific settings.

```pseudocode
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
```

## 7. State Management & Data Persistence

- **React Context**: Used for global state that needs to be accessed by many components (e.g., `wallet`, `trip`, `language`).
- **`useState`**: Used for component-level, non-persistent state (e.g., `isLoading`, `selectedBus`).
- **`localStorage`**: Used to persist state across page reloads and browser sessions. This provides a "database-less" experience. Context providers read from `localStorage` on initial mount and write to it whenever the state changes. This is handled within each respective context file (e.g., `wallet-context.tsx`).
- **Genkit/AI**: The `get-recommendations-flow.ts` file defines a Genkit flow that uses an AI model and a custom tool (`getMusicRecommendations`) to fetch song suggestions from the Spotify API based on user preferences. This flow is called from the `MusicPage` component.
