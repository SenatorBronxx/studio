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
