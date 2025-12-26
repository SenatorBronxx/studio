
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Save, User as UserIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/language-context';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine(data => {
    if(data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Current password is required to set a new one.",
    path: ["currentPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  useEffect(() => {
    form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
    });
  }, [user, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    
    // Simulate upload and get a local URL
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newPhotoURL = URL.createObjectURL(file);
    setUser(prev => ({...prev, photoURL: newPhotoURL})); // Update local mock user state

    toast({
        title: "Profile Picture Updated",
        description: "Your new profile picture has been saved.",
    });

    setIsUploading(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);

        const updatedUser = {...user, displayName: data.displayName };
        setUser(updatedUser);

        toast({
            title: t('profileUpdatedToastTitle'),
            description: t('profileUpdatedToastDescription'),
        });

        if (data.newPassword) {
             toast({
                title: t('passwordUpdatedToastDescription'),
            });
        }
        
        router.back();

    }, 1500);
  };

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
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                <AvatarFallback>
                  <UserIcon className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <Button 
                size="icon" 
                className='absolute bottom-0 right-0 rounded-full h-8 w-8'
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Camera className='h-4 w-4' />}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
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
                          <Input type="email" placeholder={t('emailAddressPlaceholder')} {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password to change it" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="newPassword"
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
