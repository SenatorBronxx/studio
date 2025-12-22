
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function MakeAdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        variant: 'destructive',
        title: 'Feature Not Implemented',
        description: 'The ability to make other users admin is not available in this version.'
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
       <div className="w-full max-w-lg">
         <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
         </Button>
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Make User an Admin
            </CardTitle>
            <CardDescription>
                This feature is currently disabled. Admin role management will be available in a future update.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    disabled
                />
                </div>
                <Button type="submit" className="w-full" disabled>
                  Grant Admin Privileges
                </Button>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
