
'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ActiveTrip } from '@/context/trip-context';
import Confetti from 'react-confetti';

type TripRatingProps = {
  trip: ActiveTrip;
  onSubmit: (rating: number, complaint?: string) => void;
};

export function TripRating({ trip, onSubmit }: TripRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // This is a simple way to get window dimensions on the client.
    // For more complex layouts, you might use a ref on the parent card.
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // After the confetti runs for a bit, call the original submit handler
    setTimeout(() => {
        onSubmit(rating, complaintText);
    }, 4000);
  };

  if (isSubmitted) {
    return (
        <Card className="w-full max-w-md mx-auto relative overflow-hidden">
             <Confetti
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
                numberOfPieces={200}
             />
             <CardHeader className="text-center">
                <CardTitle className="flex flex-col items-center justify-center gap-2">
                    <PartyPopper className="h-10 w-10 text-primary"/>
                    Thanks for your review!
                </CardTitle>
             </CardHeader>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-in fade-in-50 slide-in-from-bottom-5">
      <CardHeader className="text-center">
        <CardTitle>How was your trip?</CardTitle>
        <CardDescription>Rate your experience with {trip.bus.driver}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-20 h-20">
            {trip.bus.driverImage && <AvatarImage src={trip.bus.driverImage} alt={trip.bus.driver} />}
            <AvatarFallback>{trip.bus.driver.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{trip.bus.driver}</p>
          <p className="text-sm text-muted-foreground font-mono">{trip.bus.plate}</p>
        </div>
        
        <div 
            className="flex justify-center gap-2"
            onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-8 h-8 cursor-pointer transition-colors",
                (hoverRating >= star || rating >= star)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/50"
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
            />
          ))}
        </div>

        {showComplaint && (
          <div className="space-y-2 animate-in fade-in-20">
            <Textarea
              placeholder="Please describe your issue..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button onClick={handleSubmit} className="w-full" disabled={rating === 0}>
            Submit Rating
        </Button>
        {!showComplaint && (
          <Button variant="ghost" size="sm" onClick={() => setShowComplaint(true)}>
            <MessageSquare className="mr-2 h-4 w-4"/>
            File a Complaint
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
