
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus, Bus, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const driverRegistrationSchema = z.object({
  driverName: z.string().min(2, 'Driver name is required.'),
  driverEmail: z.string().email('Invalid email address.'),
  driverPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  busPlate: z.string().min(4, 'Bus plate is required.'),
  driverImage: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof driverRegistrationSchema>;

// This would be a server action in a real application.
// For demonstration, we'll simulate the process on the client.
async function registerDriver(data: FormValues) {
    console.log("Registering driver with data:", data);
    // 1. Create user in Firebase Auth
    // 2. Set custom claim `driver: true`
    // 3. Create document in `/drivers/{uid}` with assignedBusPlate etc.
    // 4. Create document in `/users/{uid}` with name, email etc.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would get the new user's UID back from the server.
    const mockUid = `driver-${Date.now()}`;
    
    console.log(`Driver ${data.driverName} registered with UID: ${mockUid}`);

    return { success: true, message: `${data.driverName} has been registered successfully.` };
}


export default function RegisterDriverPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(driverRegistrationSchema),
        defaultValues: {
            driverName: '',
            driverEmail: '',
            driverPassword: '',
            busPlate: '',
            driverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const result = await registerDriver(data);
            if (result.success) {
                toast({
                    title: 'Driver Registered',
                    description: result.message,
                });
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // NOTE: This page should be protected by an admin-only role in a real app.
    // For now, it's publicly accessible for demonstration.

    return (
        <div className="flex flex-col min-h-screen bg-muted p-4 sm:p-8 items-center">
            <main className="w-full max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <UserPlus />
                            Driver Onboarding
                        </CardTitle>
                        <CardDescription>
                            Create a new driver account, assign them a bus, and grant them driver permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <section>
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><ShieldCheck /> Account Credentials</h3>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="driverEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Driver's Login Email</FormLabel>
                                                    <FormControl><Input placeholder="e.g., driver@eritas.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="driverPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Temporary Password</FormLabel>
                                                    <FormControl><Input type="password" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>

                                <Separator />

                                <section>
                                     <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Bus /> Driver & Bus Details</h3>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="driverName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Driver's Full Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g., Kofi Mensah" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="busPlate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned Bus Plate Number</FormLabel>
                                                    <FormControl><Input placeholder="e.g., GE-2024-24" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="driverImage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Driver Profile Image URL</FormLabel>
                                                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                                    Register Driver
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
