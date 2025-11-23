
'use client';

import { useLanguage } from '@/context/language-context';
import { Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function WithdrawPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Landmark className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-foreground">Withdraw</h1>
      <p className="text-muted-foreground mt-2">
        This is where the Withdraw feature will live.
      </p>
      <Button onClick={() => router.back()} className="mt-4">
        Go Back
      </Button>
    </div>
  );
}

    