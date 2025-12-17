
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
import { useLanguage } from "@/context/language-context";
import Image from "next/image";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// Schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
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
  const { t } = useLanguage();
  const { auth, firestore } = useFirebase();

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleError = (error: any) => {
    console.error("Authentication error:", error);
    let message = "An unexpected error occurred. Please try again.";
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password.';
                break;
            case 'auth/email-already-in-use':
                message = 'This email address is already in use.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
             case 'auth/popup-closed-by-user':
                message = 'Sign-in process was cancelled.';
                break;
            default:
                message = error.message;
        }
    }
    toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: message,
    });
    setIsSubmitting(false);
  };
  
  const createUserProfileDocument = (user: import("firebase/auth").User, firstName: string, lastName: string) => {
      const userRef = doc(firestore, "users", user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        signUpDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profilePicture: user.photoURL || '',
      };
      
      setDoc(userRef, userData, { merge: true }).catch(err => {
          const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'create',
              requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(firestore, "users", user.uid);
        setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(err => {
            console.warn("Could not update last login time for user:", err);
        });
        toast({
          title: t('signInSuccessfulToastTitle'),
          description: t('signInSuccessfulToastDescription'),
        });
        onSignInSuccess();
      })
      .catch(handleError)
      .finally(() => setIsSubmitting(false));
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;
        createUserProfileDocument(user, values.firstName, values.lastName);
        toast({
          title: t('signUpSuccessfulToastTitle'),
          description: t('signUpSuccessfulToastDescription'),
        });
        onSignUpSuccess(values.firstName);
      })
      .catch(handleError)
      .finally(() => setIsSubmitting(false));
  };
  
  const handleSocialLogin = async (providerName: 'Google') => {
    setIsSubmitting(true);
    
    let provider;
    if (providerName === 'Google') {
        provider = new GoogleAuthProvider();
    } else {
        setIsSubmitting(false);
        return;
    }

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        // Check if the user document already exists in Firestore
        if (!userDoc.exists()) {
          // This is a new user signing up with social auth
          const nameParts = user.displayName?.split(' ') || ['New', 'User'];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || ' ';
          
          createUserProfileDocument(user, firstName, lastName);
          onSignUpSuccess(firstName);
        } else {
          // Existing user signing in
          setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(err => {
            console.warn("Could not update last login time for user:", err);
          });
          onSignInSuccess();
        }
        toast({
            title: t('socialSignInToastTitle', { provider: providerName }),
            description: t('welcome'),
        });
      })
      .catch(handleError)
      .finally(() => setIsSubmitting(false));
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailAddressLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 mt-4">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailAddressLabel')}</FormLabel>
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
      <div className="mt-6">
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('Google')}>
          <Image src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="Google" width={16} height={16} className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>
    </Tabs>
  );
}
