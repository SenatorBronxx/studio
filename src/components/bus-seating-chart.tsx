
'use client';

import { Armchair, BusFront, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '@/context/language-context';

type Seat = {
    id: string;
    isOccupied: boolean;
} | null;

type BusSeatingChartProps = {
    seating: Seat[];
    selectedSeats: string[];
    onSeatSelect: (seatId: string) => void;
    busPlate: string;
    onConfirm: () => void;
};

export function BusSeatingChart({ seating, selectedSeats, onSeatSelect, busPlate, onConfirm }: BusSeatingChartProps) {
    const { t } = useLanguage();
    const primarySeat = selectedSeats[0];
    
    return (
        <div className="p-4 space-y-6">
            <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center gap-4">
                <Badge variant="secondary" className="font-mono">{busPlate}</Badge>
                <div className="grid grid-cols-5 gap-2 w-full max-w-xs">
                    {/* Driver's Seat */}
                    <div className="col-span-1 flex items-center justify-center">
                        <BusFront className="w-8 h-8 text-foreground" />
                    </div>
                    <div className="col-span-4"></div>

                    {/* Seats */}
                    {seating.map((seat, index) => {
                        if (!seat) {
                            return <div key={`aisle-${index}`} className="col-span-1"></div>;
                        }

                        const isSelected = selectedSeats.includes(seat.id);
                        const isPrimary = primarySeat === seat.id;
                        
                        return (
                            <button
                                key={seat.id}
                                onClick={() => onSeatSelect(seat.id)}
                                disabled={seat.isOccupied}
                                className={cn(
                                    "flex items-center justify-center rounded-md p-1 transition-colors relative",
                                    "aspect-square",
                                    seat.isOccupied
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-primary/20 text-primary hover:bg-primary/30",
                                    isSelected && "bg-primary/60 text-primary-foreground",
                                    isPrimary && "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary ring-offset-background"
                                )}
                            >
                                {isPrimary ? <User className="w-5 h-5" /> : <Armchair className="w-6 h-6" />}
                                <span className="absolute text-[8px] font-bold text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    {seat.id}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-around text-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/20 border border-primary flex items-center justify-center"><Armchair className="w-3 h-3 text-primary" /></div>
                    <span>{t('available')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/60 border border-primary flex items-center justify-center"><Armchair className="w-3 h-3 text-primary-foreground" /></div>
                    <span>{t('selected')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary border border-primary flex items-center justify-center"><User className="w-3 h-3 text-primary-foreground" /></div>
                    <span>{t('primary')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted border border-muted-foreground"></div>
                    <span>{t('taken')}</span>
                </div>
            </div>

            <Button className='w-full' disabled={selectedSeats.length === 0} onClick={onConfirm}>
                {selectedSeats.length > 0 ? t('confirmSeats', { count: selectedSeats.length }) : t('confirmSeat')}
            </Button>
        </div>
    );
}
