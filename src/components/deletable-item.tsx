
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
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (itemRef.current) {
        // Remove transition during drag for immediate feedback
        itemRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // Only allow swiping left
    if (deltaX < 0) {
      setDragX(Math.max(deltaX, SWIPE_THRESHOLD - 20));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (itemRef.current) {
        // Re-apply transition for snap animation
        itemRef.current.style.transition = 'transform 0.2s ease-out';
    }

    if (dragX < SWIPE_THRESHOLD / 2) {
      // Snap to open
      setDragX(SWIPE_THRESHOLD);
    } else {
      // Snap back to closed
      setDragX(0);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Animate out and then delete
    if (itemRef.current) {
        itemRef.current.style.transition = 'all 0.3s ease-out';
        itemRef.current.style.transform = 'translateX(-100%)';
        itemRef.current.style.opacity = '0';
    }
    setTimeout(() => {
        onDelete();
        // Reset state in case component is re-used
        setIsDeleting(false);
        setDragX(0);
    }, 300);
  };
  
  const handleCancel = () => {
    setDragX(0);
  }

  return (
    <div 
        className="relative w-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-full flex items-center bg-destructive">
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
        className="relative w-full bg-background transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={dragX < 0 ? handleCancel : undefined}
      >
        {children}
      </div>
    </div>
  );
}
