
'use client';

import { Ticket, Bus, MapPin, Check, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const IconMosaicBackground = () => {
    const icons = [Ticket, Bus, MapPin, Check, Flag];
    const animations = ['animate-float', 'animate-float-slow', 'animate-float-slower'];

    const pattern = Array.from({ length: 150 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const rotation = (i % 12) * 30; // 0, 30, 60...
        const scale = 1 + ((i % 5) / 10); // 1, 1.1, 1.2...
        const animationClass = animations[i % animations.length];
        const animationDelay = `-${(i % 10)}s`;

        return (
            <Icon 
                key={i} 
                className={cn("h-8 w-8 text-primary/10", animationClass)} 
                style={{ 
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    animationDelay: animationDelay,
                }} 
            />
        );
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center justify-center -rotate-12 scale-150 opacity-50">
                 {pattern}
            </div>
        </div>
    );
};
