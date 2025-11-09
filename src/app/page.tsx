import Image from 'next/image';
import { Bus, MapPin } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { UserPreferences } from '@/components/user-preferences';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const busImage = PlaceHolderImages.find(p => p.id === 'bus-side-view');

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center">
              <Image
                src="/eritas-logo.png"
                alt="Eritas Transport Company Logo"
                width={200}
                height={100}
              />
            </div>
            <p className="text-balance text-muted-foreground">
              Your journey starts here. Access your account or create a new one.
            </p>
          </div>
          <AuthForm />
        </div>
        <div className="mt-8 w-full max-w-md lg:hidden">
          <UserPreferences />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
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
        <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex h-full items-end justify-center">
                <UserPreferences />
            </div>
        </div>
        <div className="absolute top-1/4 left-0 w-full overflow-hidden">
            <Bus className="absolute animate-bus-move h-12 w-12 text-white/50" />
        </div>
         <div className="absolute top-1/3 right-1/4 animate-float">
            <MapPin className="h-16 w-16 text-white/30" />
        </div>
      </div>
    </div>
  );
}
