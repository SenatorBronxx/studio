
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { useUserPreferences } from '@/context/user-preferences-context';
import { IconMosaicBackground } from '@/components/icon-mosaic-background';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { PREFERENCES_DOC_ID } from '@/context/user-preferences-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { isHydrated } = useUserPreferences();

  useEffect(() => {
    // Redirect existing users who land on this page
    if (!isUserLoading && user && isHydrated) {
        router.push('/home');
    }
  }, [user, isUserLoading, router, isHydrated]);
  
  const handleSignInSuccess = () => {
    // The useEffect hook will handle the redirect for existing users.
  }
  
  const handleSignUpSuccess = async (userId: string) => {
    // For a new user, check if they have any preferences set up.
    // If not (which they won't), show the slideshow.
    const prefsRef = doc(firestore, 'users', userId, 'preferences', PREFERENCES_DOC_ID);
    const docSnap = await getDoc(prefsRef);
    if (!docSnap.exists()) {
        setShowSlideshow(true);
    } else {
        router.push('/home');
    }
  }

  const handleFinishSlideshow = () => {
      router.push('/home');
  }

  if (showSlideshow) {
      return <SignupSlideshow onFinish={handleFinishSlideshow} />;
  }
  
  // This more robust check ensures we wait for both Firebase Auth and our custom preferences to be loaded.
  if (isUserLoading || (user && !isHydrated && !showSlideshow)) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  // If user is loaded but we are supposed to show the slideshow, don't show the loader
  if (user && isHydrated && !showSlideshow) {
      // This is a transitional state, showing a loader is fine.
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
        <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm">
            <AuthForm onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
        </div>
      </div>
    </div>
  );
}
