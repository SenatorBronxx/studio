
'use client';

import Image from 'next/image';
import { Bus, MapPin, Ticket, Check } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { UserPreferences } from '@/components/user-preferences';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

export default function Home() {
  const busImage = PlaceHolderImages.find(p => p.id === 'bus-side-view');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSignUpSuccess = (name: string) => {
    setUserName(name);
    setShowSlideshow(true);
  };
  
  const handleSignInSuccess = () => {
    // For sign-in, we don't have the name immediately, so we'll pass a default.
    // In a real app, you'd fetch the user's name from your backend.
    router.push(`/home?name=${encodeURIComponent(t('friend'))}`);
  };

  const handleSlideshowFinish = () => {
    router.push(`/home?name=${encodeURIComponent(userName)}`);
  };

  if (showSlideshow) {
    return <SignupSlideshow onFinish={handleSlideshowFinish} />;
  }

  return (
    <div className="w-full">
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
            {/* Floating Icons */}
            <Ticket className="absolute -top-4 -left-5 h-20 w-20 text-primary/20 rotate-12 animate-float-slow" />
            <Bus className="absolute bottom-10 -right-10 h-24 w-24 text-primary/15 animate-float-slower -rotate-12" />
            <MapPin className="absolute top-1/2 -right-2 h-16 w-16 text-accent/20 -rotate-12 animate-float" />
            <Bus className="absolute top-10 right-12 h-12 w-12 text-muted-foreground/20 animate-float-slow" />
            <Ticket className="absolute bottom-4 left-4 h-16 w-16 text-accent/15 rotate-6 animate-float" />
            <MapPin className="absolute bottom-1/3 -left-4 h-12 w-12 text-primary/20 animate-float-slower" />
            <Check className="absolute top-1/4 left-1/4 h-12 w-12 text-primary/20 animate-float" />


          <div className="mx-auto grid w-[380px] gap-6 z-10">
            <div className="grid gap-2 text-center">
              <div className="flex justify-center">
                <Image
                  src="https://jklylnqjwfrmjrsqfzys.supabase.co/storage/v1/object/public/images/eritas-logo-1763267730211.png"
                  alt="Eritas Transport Company Logo"
                  width={200}
                  height={100}
                  priority
                  className="object-contain"
                />
              </div>
              <p className="text-balance text-muted-foreground">
                {t('welcomeMessage')}
              </p>
            </div>
            <AuthForm onSignUpSuccess={handleSignUpSuccess} onSignInSuccess={handleSignInSuccess} />
          </div>
        </div>
        <div className="bg-muted lg:h-full">
            <div className="relative h-full min-h-[400px] lg:min-h-0 flex flex-col justify-end">
                {busImage && (
                    <Image
                        alt={busImage.description}
                        src={busImage.imageUrl}
                        data-ai-hint={busImage.imageHint}
                        fill
                        className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-1/4 left-0 w-full overflow-hidden">
                    <Bus className="absolute animate-bus-move h-12 w-12 text-white/50" />
                </div>
                <div className="absolute top-1/3 right-1/4 animate-float">
                    <MapPin className="h-16 w-16 text-white/30" />
                </div>
                <div className="relative p-8 w-full">
                    <UserPreferences />
                </div>
                 <footer className="relative p-4 text-center text-xs text-white/70">
                    © 2026 Eritas Transport Company. All rights reserved. Secure and fast bus booking for your journey
                </footer>
            </div>
        </div>
      </div>
    </div>
  );
}
