
'use client';

import { Wallet } from 'lucide-react';

export default function EritasPayPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Wallet className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-foreground">ERITAS Pay</h1>
      <p className="text-muted-foreground mt-2">
        This is where the ERITAS Pay functionality will live.
      </p>
    </div>
  );
}
