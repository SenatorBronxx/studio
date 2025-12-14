
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, LogOut, Wifi, WifiOff, SteeringWheel, Bus, UserCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { redeemDriverCode } from '@/ai/flows/redeem-driver-code';

// Mock data for the driver's bus. In a real app, this might come from a driver's profile.
const MOCK_BUS_DATA = {
  driver: 'Yaw Baah',
  plate: 'GE-2024-24',
  eta: 12,
  capacity: { current: 0, max: 52 },
  stops: [
    { name: 'Adenta', fare: 5.00, eta: 5 },
    { name: 'Madina', fare: 7.50, eta: 15 },
  ],
  finalDestination: { name: 'Atomic Junction', fare: 10.00, eta: 25 },
  position: { top: '40%', left: '30%' }, // Example position
  driverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  seating: [
    { id: '1A', isOccupied: false }, { id: '1B', isOccupied: false }, null, { id: '1C', isOccupied: false }, { id: '1D', isOccupied: false },
    { id: '2A', isOccupied: false }, { id: '2B', isOccupied: false }, null, { id: '2C', isOccupied: false }, { id: '2D', isOccupied: false },
    { id: '3A', isOccupied: false }, { id: '3B', isOccupied: false }, null, { id: '3C', isOccupied: false }, { id: '3D', isOccupied: false },
    { id: '4A', isOccupied: false }, { id: '4B', isOccupied: false }, null, { id: '4C', isOccupied: false }, { id: '4D', isOccupied: false },
    { id: '5A', isOccupied: false }, { id: '5B', isOccupied: false }, null, { id: '5C', isOccupied: false }, { id: '5D', isOccupied: false },
  ],
  playlist: []
};

const codeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters.'),
});

type CodeFormValues = z.infer<typeof codeSchema>;

export default function DriverPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // The bus document reference is memoized to prevent re-renders
  const busRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'buses', user.uid);
  }, [user, firestore]);
  
  // This hook listens to the bus document in real-time
  const { data: busData } = useDoc(busRef);
  
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });


  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Check for the custom driver claim
        user.getIdTokenResult(true).then((idTokenResult) => { // Force refresh
          if (idTokenResult.claims.driver) {
            setIsDriver(true);
          } else {
            setIsDriver(false);
          }
        });
      } else {
        // Not logged in
        setIsDriver(false);
      }
    }
  }, [user, isUserLoading]);

  // Sync broadcasting state with Firestore data
  useEffect(() => {
    setIsBroadcasting(!!busData);
  }, [busData]);

  const handleRedeemCode = async (data: CodeFormValues) => {
    if (!user) return;
    setIsRedeeming(true);

    try {
        const result = await redeemDriverCode({ code: data.code, uid: user.uid });
        if (result.success) {
            toast({
                title: "Registration Complete!",
                description: result.message,
            });
            // Force a refresh of the user's token to get the new 'driver' claim
            await user.getIdToken(true);
            // Manually update state to re-render the component as a driver
            setIsDriver(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Registration Failed",
                description: result.message,
            });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: error.message || "An unknown error occurred."
        });
    } finally {
        setIsRedeeming(false);
    }
  };


  const goOnline = async () => {
    if (!busRef || !user) return;
    setIsLoading(true);

    const busDocData = {
        id: user.uid,
        ...MOCK_BUS_DATA,
        updatedAt: serverTimestamp(),
    };
    
    // Non-blocking write to Firestore. The local state will update via useDoc.
    setDoc(busRef, busDocData).then(() => {
        toast({
            title: "You are now online!",
            description: "Your bus is visible to passengers.",
        });
    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: busRef.path,
            operation: 'create',
            requestResourceData: busDocData,
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsLoading(false);
    });
  };

  const goOffline = async () => {
    if (!busRef) return;
    setIsLoading(true);

    // Non-blocking delete. The local state will update via useDoc.
    deleteDoc(busRef).then(() => {
        toast({
            title: "You are offline.",
            description: "Your bus is no longer visible.",
            variant: "destructive"
        });
    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: busRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsLoading(false);
    });
  };

  if (isUserLoading || isDriver === null) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">Driver Portal</h1>
            <p className='text-muted-foreground'>Please sign in to access the driver dashboard.</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
        </div>
    );
  }
  
  if (!isDriver) {
      return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <Card className='max-w-md w-full'>
                <CardHeader>
                    <CardTitle>Become a Driver</CardTitle>
                    <CardDescription>Enter the 6-digit registration code provided by your administrator to activate your driver profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...codeForm}>
                        <form onSubmit={codeForm.handleSubmit(handleRedeemCode)} className="space-y-4">
                            <FormField
                            control={codeForm.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Registration Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="XXXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isRedeeming}>
                                {isRedeeming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                Redeem Code
                            </Button>
                        </form>
                    </Form>
                     <Button variant="link" size="sm" className="mt-4" onClick={() => auth.signOut().then(() => router.push('/'))}>
                        Not a driver? Sign out.
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full mb-8">
            <div className="flex justify-between items-center">
                <div className='flex items-center gap-3'>
                    <SteeringWheel className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Driver Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className='text-right'>
                        <p className="font-semibold">{user.displayName}</p>
                        <Badge variant={isBroadcasting ? 'default' : 'destructive'}>{isBroadcasting ? 'Online' : 'Offline'}</Badge>
                    </div>
                    <Button variant="ghost" onClick={() => auth.signOut()}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
        
        <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Broadcast Status</CardTitle>
                        <CardDescription>Go online to make your bus visible to passengers and receive trip requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isBroadcasting ? (
                             <Button onClick={goOffline} variant="destructive" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WifiOff className="mr-2 h-5 w-5" />}
                                Go Offline
                            </Button>
                        ) : (
                            <Button onClick={goOnline} className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wifi className="mr-2 h-5 w-5" />}
                                Go Online
                            </Button>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Current Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver</span>
                            <span className="font-medium">{MOCK_BUS_DATA.driver}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bus Plate</span>
                            <span className="font-mono font-medium">{MOCK_BUS_DATA.plate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Capacity</span>
                            <span className="font-medium">{MOCK_BUS_DATA.capacity.max} Seats</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Trip Requests */}
            <div className="md:col-span-2">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Incoming Trip Requests</CardTitle>
                        <CardDescription>New passenger requests will appear here in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-muted rounded-lg p-12 h-64">
                            <Bus className="h-12 w-12 mb-4" />
                            <p className="font-semibold">Waiting for trip requests...</p>
                            <p className="text-sm">Ensure you are online to receive requests.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
