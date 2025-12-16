'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/'); // Redirect unauthenticated users to the main login page
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Once the user is loaded, check for admin custom claim
  if (user) {
    // Firebase automatically refreshes the token, but for immediate effect after
    // making admin, a manual refresh might be needed or waiting for propagation.
    // Here we check the token that the useUser hook provides.
    if (user.customClaims?.admin === true) {
      return <>{children}</>;
    }
  }

  // If user is not an admin, show an access denied message
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <div className="flex items-center gap-4 p-6 bg-destructive/10 border-2 border-dashed border-destructive/20 rounded-lg">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <div className="text-left">
                <h1 className="text-2xl font-bold text-destructive-foreground">Access Denied</h1>
                <p className="text-destructive-foreground/80">
                    You do not have permission to view this page.
                </p>
                <Button variant="secondary" size="sm" onClick={() => router.push('/home')} className="mt-4">
                    Go to Home Page
                </Button>
            </div>
        </div>
    </div>
  );
}
