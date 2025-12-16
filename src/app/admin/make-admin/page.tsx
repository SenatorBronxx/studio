'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { makeAdmin } from '@/ai/flows/admin/make-admin';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const makeAdminSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type MakeAdminFormValues = z.infer<typeof makeAdminSchema>;

export default function MakeAdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<MakeAdminFormValues>({
    resolver: zodResolver(makeAdminSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: MakeAdminFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await makeAdmin(values);
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
    } catch (error: any) {
      console.error('Make admin error:', error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // This is a simple check. In a real app, you'd use custom claims.
  // For now, we allow access but the flow itself is what's truly secure.
  if (!user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-4 top-4"
        >
            <ArrowLeft className="h-5 w-5" />
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Grant Admin Privileges
          </CardTitle>
          <CardDescription>
            Enter the email of a registered user to make them an administrator. This action is irreversible through the UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User's Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Make Admin
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
