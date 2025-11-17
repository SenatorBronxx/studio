
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useLanguage } from '@/context/language-context';
import { Ticket, Bus, MapPin, Check } from 'lucide-react';

type SignupSlideshowProps = {
    onFinish: () => void;
};

export function SignupSlideshow({ onFinish }: SignupSlideshowProps) {
    const { t } = useLanguage();

    const slideContent = [
        {
            id: 'smart-routing',
            titleKey: 'smartRoutingTitle',
            descriptionKey: 'smartRoutingDescription',
        },
        {
            id: 'gps-tracking',
            titleKey: 'gpsTrackingTitle',
            descriptionKey: 'gpsTrackingDescription',
        },
        {
            id: 'personal-music',
            titleKey: 'personalMusicTitle',
            descriptionKey: 'personalMusicDescription',
        },
        {
            id: 'real-time-availability',
            titleKey: 'realTimeAvailabilityTitle',
            descriptionKey: 'realTimeAvailabilityDescription',
        },
        {
            id: 'frosted-glass-ui',
            titleKey: 'frostedGlassUiTitle',
            descriptionKey: 'frostedGlassUiDescription',
        },
    ];

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 overflow-hidden">
        {/* Floating Icons */}
        <Ticket className="absolute -top-4 -left-5 h-20 w-20 text-primary/10 rotate-12 animate-float-slow" />
        <Bus className="absolute bottom-10 -right-10 h-24 w-24 text-primary/10 animate-float-slower -rotate-12" />
        <MapPin className="absolute top-1/2 -right-2 h-16 w-16 text-accent/10 -rotate-12 animate-float" />
        <Bus className="absolute top-10 right-12 h-12 w-12 text-muted-foreground/10 animate-float-slow" />
        <Ticket className="absolute bottom-4 left-4 h-16 w-16 text-accent/10 rotate-6 animate-float" />
        <MapPin className="absolute bottom-1/3 -left-4 h-12 w-12 text-primary/10 animate-float-slower" />
        <Check className="absolute top-1/4 left-1/4 h-12 w-12 text-primary/10 animate-float" />
        <Ticket className="absolute top-1/4 right-1/4 h-12 w-12 text-accent/10 animate-float-slow" />
        <Bus className="absolute bottom-1/4 left-1/4 h-12 w-12 text-muted-foreground/10 animate-float" />

      <div className="w-full max-w-sm sm:max-w-md mx-auto z-10">
        <Carousel className="w-full">
          <CarouselContent>
            {slideContent.map((slide) => {
              const image = PlaceHolderImages.find((p) => p.id === slide.id);
              return (
                <CarouselItem key={slide.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 aspect-[9/10] sm:aspect-square">
                        {image && (
                          <div className="relative w-full h-40 sm:h-48">
                            <Image
                              src={image.imageUrl}
                              alt={image.description}
                              fill
                              data-ai-hint={image.imageHint}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-xl sm:text-2xl font-semibold text-center">{t(slide.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground text-center">{t(slide.descriptionKey)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <Button onClick={onFinish} className="w-full mt-6">
          {t('getStarted')}
        </Button>
      </div>
    </div>
  );
}
