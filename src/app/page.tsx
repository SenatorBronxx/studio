import Image from 'next/image';
import { Bus, MapPin } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { AnimationTool } from '@/components/animation-tool';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const busImage = PlaceHolderImages.find(p => p.id === 'bus-side-view');

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold font-headline">
              <Bus className="h-8 w-8 text-primary" />
              Eritas Gateway
            </h1>
            <p className="text-balance text-muted-foreground">
              Your journey starts here. Access your account or create a new one.
            </p>
          </div>
          <AuthForm />
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
                <AnimationTool />
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
