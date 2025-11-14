
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Save, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser, isHydrated } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userImage = PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  useEffect(() => {
    if (isHydrated && user) {
        form.reset({
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: '',
            confirmPassword: '',
        });
    }
  }, [isHydrated, user, form]);

  const onSubmit = (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setUser({
        name: data.name,
        email: data.email || '',
        phone: data.phone,
      });

      let description = t('profileUpdatedToastDescription');
      if (data.password) {
        console.log("Password change requested. In a real app, this would be a secure backend call.");
        description += ` ${t('passwordUpdatedToastDescription')}`;
      }
      
      toast({
        title: t('profileUpdatedToastTitle'),
        description: description,
      });
      setIsSubmitting(false);
      router.back();
    }, 1000);
  };
  
  if (!isHydrated) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!user) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">{t('notLoggedIn')}</h1>
            <p className='text-muted-foreground'>{t('signInToEditProfile')}</p>
            <Button onClick={() => router.push('/')} className="mt-4">{t('goToSignIn')}</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('editProfile')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className='relative'>
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                {userImage && <AvatarImage src={userImage} alt={user.name} />}
                <AvatarFallback>
                  <UserIcon className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className='absolute bottom-0 right-0 rounded-full h-8 w-8'>
                <Save className='h-4 w-4' />
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('fullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailAddressLabel')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('emailAddressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+233 24 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newPasswordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('newPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirmNewPasswordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('confirmNewPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('saveChanges')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
