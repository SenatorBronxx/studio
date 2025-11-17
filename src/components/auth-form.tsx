
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useLanguage } from "@/context/language-context";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Schemas
const signInSchema = z.object({
  phone: z.string().min(10, { message: "Invalid phone number." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormProps = {
  onSignUpSuccess: (name: string) => void;
  onSignInSuccess: () => void;
};

export function AuthForm({ onSignUpSuccess, onSignInSuccess }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  
  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    console.log("Sign in with:", values);
    
    setTimeout(() => {
        const storedUser = localStorage.getItem('eritas-last-signup');
        const lastSignedUpUser = storedUser ? JSON.parse(storedUser) : { name: 'John Doe', email: 'john.d@email.com' };

        const mockUserData = {
            name: lastSignedUpUser.name,
            email: lastSignedUpUser.email,
            phone: values.phone
        };
        setUser(mockUserData);

        toast({
        title: t('signInSuccessfulToastTitle'),
        description: t('signInSuccessfulToastDescription'),
        });
        setIsSubmitting(false);
        onSignInSuccess();
    }, 1500);
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    console.log("Sign up with:", values);
    
    setTimeout(() => {
        const newUser = {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email || '',
            phone: values.phone
        };
        
        localStorage.setItem('eritas-last-signup', JSON.stringify(newUser));
        setUser(newUser);

        toast({
        title: t('signUpSuccessfulToastTitle'),
        description: t('signUpSuccessfulToastDescription'),
        });
        setIsSubmitting(false);
        onSignUpSuccess(values.firstName);
    }, 1500);
  };
  
  const handleSocialLogin = async (provider: 'Apple' | 'Google') => {
    setIsSubmitting(true);
    
    setTimeout(() => {
        console.log(`Signing in with ${provider}`);
        const mockSocialUser = {
            name: 'Jane Smith',
            email: 'jane.s@email.com',
            phone: '+233 55 555 5555'
        };
        setUser(mockSocialUser);
        
        toast({
            title: t('socialSignInToastTitle', { provider }),
            description: t('welcome'),
        });
        
        setIsSubmitting(false);
        onSignInSuccess();
    }, 1500);
  }

  return (
    <Tabs defaultValue="sign-in" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sign-in">{t('signIn')}</TabsTrigger>
        <TabsTrigger value="sign-up">{t('signUp')}</TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in">
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 mt-4">
            <FormField
              control={signInForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+233 24 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signIn')}
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="sign-up">
        <Form {...signUpForm}>
          <form onSubmit={signUpForm. handleSubmit(handleSignUp)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={signUpForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('firstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={signUpForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+233 24 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailOptionalLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={signUpForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signUp')}
            </Button>
          </form>
        </Form>
      </TabsContent>
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('orContinueWith')}
          </span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => handleSocialLogin('Google')} disabled={isSubmitting}>
          <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" width={16} height={16} className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialLogin('Apple')} disabled={isSubmitting}>
          <Image src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" width={16} height={16} className="mr-2 h-4 w-4" />
          Apple
        </Button>
      </div>
    </Tabs>
  );
}
