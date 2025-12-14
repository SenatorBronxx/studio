
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isUserLoading && user) {
      // User is logged in, check for admin claim and redirect
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          router.push('/dashboard');
        } else {
          // If not an admin, keep them on a page that says "access denied"
          // For now, we can just push them to a generic error page or show a message.
          // A dedicated dashboard layout will handle the definitive check.
          router.push('/access-denied');
        }
      });
    }
  }, [user, isUserLoading, router]);

  const handleAuthSuccess = () => {
    // The useEffect will handle the redirect after state update
  };
  
  if (isUserLoading || user) {
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
          <h1 className="text-2xl font-bold mt-4">Admin Portal</h1>
          <p className="text-muted-foreground">
            Sign in to manage the Eritas Gateway platform.
          </p>
        </div>
        <div className="rounded-lg border bg-background p-6 shadow-sm">
            {/* We can reuse the same AuthForm, but we will ignore the onSignUpSuccess callback */}
            <AuthForm onSignInSuccess={handleAuthSuccess} onSignUpSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
}
