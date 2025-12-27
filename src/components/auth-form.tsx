
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { AppleIcon } from './icons/apple';
import { GoogleIcon } from './icons/google';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useLanguage } from '@/context/language-context';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type AuthFormProps = {
  mode: 'signin' | 'signup';
  onSignInSuccess: () => void;
  onSignUpSuccess: () => void;
};

export function AuthForm({ mode, onSignInSuccess, onSignUpSuccess }: AuthFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'apple'>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (mode === 'signin') {
      handleSignIn(values);
    } else {
      handleSignUp(values);
    }
  };
  
  // Mock sign-in function
  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('signInSuccessfulToastTitle'),
        description: t('signInSuccessfulToastDescription'),
      });
      onSignInSuccess();
    }, 1000);
  };
  
  // Mock sign-up function
  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('signUpSuccessfulToastTitle'),
        description: t('signUpSuccessfulToastDescription'),
      });
      onSignUpSuccess(); 
    }, 1000);
  };
  
  // Mock social sign-in
  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    setTimeout(() => {
        setIsSocialLoading(null);
        toast({
            title: t('socialSignInToastTitle', { provider }),
            description: t('welcome'),
        });
        onSignInSuccess();
    }, 1500);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={!!isSocialLoading}>
          {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
          Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialSignIn('apple')} disabled={!!isSocialLoading}>
          {isSocialLoading === 'apple' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon className="mr-2 h-4 w-4" />}
          Apple
        </Button>
      </div>
      <div className="relative my-4">
        <Separator />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t('orContinueWith')}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailAddressLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailAddressPlaceholder')} {...field} />
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
                <FormLabel>{t('passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? t('signIn') : t('signUp')}
          </Button>
        </form>
      </Form>
    </>
  );
}
