
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { IconMosaicBackground } from '@/components/icon-mosaic-background';

export default function LoginPage() {
  const router = useRouter();
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
        <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm">
            <AuthForm onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
        </div>
      </div>
    </div>
  );
}
