
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

type SignupSlideshowProps = {
    onFinish: () => void;
};

const slideContent = [
    {
        id: 'smart-routing',
        title: 'Smart Routing',
        description: 'Our intelligent algorithms find the fastest and most efficient routes, so you get to your destination sooner.',
    },
    {
        id: 'gps-tracking',
        title: 'Intelligent GPS Tracking',
        description: 'Track your bus in real-time on the map. Know exactly when it will arrive and plan your time better.',
    },
    {
        id: 'personal-music',
        title: 'Your Music, Your Ride',
        description: 'Enjoy a personalized playlist based on your favorite music. Your journey, your soundtrack.',
    },
    {
        id: 'real-time-availability',
        title: 'Real-time Availability',
        description: 'Check seat availability and book your ticket instantly. No more waiting or uncertainty.',
    },
];

export function SignupSlideshow({ onFinish }: SignupSlideshowProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <Carousel className="w-full">
          <CarouselContent>
            {slideContent.map((slide) => {
              const image = PlaceHolderImages.find((p) => p.id === slide.id);
              return (
                <CarouselItem key={slide.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6 aspect-square">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={600}
                            height={400}
                            data-ai-hint={image.imageHint}
                            className="rounded-lg object-cover mb-4 w-full h-48"
                          />
                        )}
                        <h3 className="text-2xl font-semibold text-center">{slide.title}</h3>
                        <p className="text-sm text-muted-foreground text-center mt-2">{slide.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <Button onClick={onFinish} className="w-full mt-6">
          Get Started
        </Button>
      </div>
    </div>
  );
}
