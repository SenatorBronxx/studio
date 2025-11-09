
'use client';

import { useState, useRef, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeletableItemProps {
  children: ReactNode;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = -80; // How far to swipe to trigger delete

export function DeletableItem({ children, onDelete }: DeletableItemProps) {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // Only allow swiping left, and not past the threshold
    if (deltaX < 0) {
      setDragX(Math.max(deltaX, SWIPE_THRESHOLD - 20));
    }
  };

  const handleTouchEnd = () => {
    if (dragX < SWIPE_THRESHOLD) {
      // Keep it open
      setDragX(SWIPE_THRESHOLD);
    } else {
      // Snap back
      setDragX(0);
    }
    startX.current = 0;
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Animate out
    setTimeout(() => {
        onDelete();
        // Reset state in case component is re-used
        setIsDeleting(false);
        setDragX(0);
    }, 300);
  };

  return (
    <div 
        className={cn(
            "relative w-full overflow-hidden transition-all duration-300",
            isDeleting ? "h-0 opacity-0" : "h-auto opacity-100"
        )}
    >
      <div className="absolute top-0 right-0 h-full flex items-center">
        <Button
          variant="destructive"
          size="icon"
          className="h-full w-20 rounded-none flex items-center justify-center"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      <div
        ref={itemRef}
        className="relative w-full transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
