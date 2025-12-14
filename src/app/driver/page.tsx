
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Bus } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { redeemDriverCode } from '@/ai/flows/redeem-driver-code';

const redeemCodeSchema = z.object({
  code: z.string().length(6, { message: 'Registration code must be 6 characters.' }),
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  phoneNumber: z.string().min(10, { message: 'A valid phone number is required.' }),
  licenseNumber: z.string().min(5, { message: 'A valid driver\'s license number is required.' }),
  busPlateNumber: z.string().min(4, { message: 'Bus plate number is required.' }),
});

export default function DriverPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof redeemCodeSchema>>({
    resolver: zodResolver(redeemCodeSchema),
    defaultValues: {
      code: '',
      fullName: '',
      phoneNumber: '',
      licenseNumber: '',
      busPlateNumber: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof redeemCodeSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to register as a driver.' });
        return;
    }
    setIsSubmitting(true);
    
    try {
        const result = await redeemDriverCode({ ...values, uid: user.uid });
        if (result.success) {
            toast({
                title: 'Registration Successful!',
                description: result.message,
            });
            // Redirect to a driver-specific dashboard or back home
            router.push('/home'); 
        } else {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: result.message,
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: 'Please try again later.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
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
                <h1 className="text-2xl font-bold mt-4">Driver Registration</h1>
                <p className="text-muted-foreground">
                    Complete the form below to become a registered driver.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Details</CardTitle>
                    <CardDescription>
                       Enter the 6-digit code provided by your administrator and fill in your details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Registration Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Kofi Mensah" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+233 24 123 4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="licenseNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>License No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder="B12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="busPlateNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Bus Plate No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GT 1234-24" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Bus className="mr-2 h-4 w-4" />
                                )}
                                Complete Registration
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
