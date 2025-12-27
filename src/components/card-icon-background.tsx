
'use client';

import { Ticket, Bus, MapPin, Check, Flag, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusTicketIcon } from './icons/bus-ticket-icon';

export const CardIconBackground = () => {
    const icons = [Music, MapPin, Flag, Check, BusTicketIcon, Bus];

    const pattern = Array.from({ length: 50 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const rotation = (i % 12) * 30;
        const scale = 0.8 + ((i % 5) / 10); 

        return (
            <div 
                key={i} 
                className="absolute"
                style={{
                    top: `${(i % 9) * 12}%`,
                    left: `${Math.floor(i / 9) * 12}%`,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                }}
            >
                <Icon 
                    className={cn("h-8 w-8 text-primary-foreground/10")} 
                />
            </div>
        );
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="relative w-full h-full -rotate-12 scale-150 opacity-50">
                 {pattern}
            </div>
        </div>
    );
};
