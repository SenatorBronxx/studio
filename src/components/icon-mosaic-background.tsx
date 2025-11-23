
'use client';

import { Ticket, Bus, MapPin, Check, Flag } from 'lucide-react';

export const IconMosaicBackground = () => {
    const icons = [Ticket, Bus, MapPin, Check, Flag];
    const pattern = Array.from({ length: 150 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const rotation = (i % 12) * 30; // 0, 30, 60...
        const scale = 1 + ((i % 5) / 10); // 1, 1.1, 1.2...
        return <Icon key={i} className="h-8 w-8 text-primary/20" style={{ transform: `rotate(${rotation}deg) scale(${scale})` }} />;
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center justify-center -rotate-12 scale-150 opacity-80">
                 {pattern}
            </div>
        </div>
    );
};

    