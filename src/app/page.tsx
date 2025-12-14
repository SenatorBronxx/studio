
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { useUserPreferences } from '@/context/user-preferences-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { preferences, isHydrated } = useUserPreferences();

  useEffect(() => {
    if (!isUserLoading && user && isHydrated) {
        // If it's a first time user (no preferences set yet), show slideshow
        // This is a simple check; a more robust one might be a specific 'hasCompletedOnboarding' flag
        if (preferences && Object.keys(preferences).length <= 2) { // id and language
            setShowSlideshow(true);
        } else {
            router.push('/home');
        }
    }
  }, [user, isUserLoading, router, preferences, isHydrated]);
  
  const handleAuthSuccess = () => {
    // The useEffect will handle logic after user state is updated
  }

  const handleFinishSlideshow = () => {
      router.push('/home');
  }

  if (showSlideshow) {
      return <SignupSlideshow onFinish={handleFinishSlideshow} />;
  }
  
  if (isUserLoading || (user && !isHydrated)) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (user && isHydrated) {
     // This is a temporary state while the useEffect hook decides where to redirect.
     // A loading spinner is appropriate here as well.
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-6">
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
        <div className="rounded-lg border bg-background p-6 shadow-sm">
            <AuthForm onSignInSuccess={handleAuthSuccess} onSignUpSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
}
