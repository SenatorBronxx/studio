
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeAdmin } from '@/ai/flows/admin/make-admin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft } from 'lucide-react';

const makeAdminSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type MakeAdminFormValues = z.infer<typeof makeAdminSchema>;

export default function MakeAdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MakeAdminFormValues>({
    resolver: zodResolver(makeAdminSchema),
  });

  const onSubmit: SubmitHandler<MakeAdminFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await makeAdmin({ email: data.email });
      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to make user an admin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Enter the email address of a registered user to grant them admin
                privileges. This action is irreversible through the UI. The first user is automatically an admin.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Grant Admin Privileges
                </Button>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    