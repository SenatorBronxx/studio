
'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { AlertTriangle, LogOut } from "lucide-react";

export default function AccessDeniedPage() {
    const auth = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <div className="bg-destructive/10 border border-destructive/50 p-6 rounded-lg max-w-md">
                <div className='flex items-center justify-center gap-3'>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <h1 className="text-xl font-bold text-destructive">Access Denied</h1>
                </div>
                <p className='text-muted-foreground mt-2'>
                    You do not have the necessary permissions to access the admin portal. Please contact a system administrator if you believe this is an error.
                </p>
                <Button onClick={() => auth.signOut()} className="mt-6" variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
            </div>
        </div>
    );
}
