
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Save } from 'lucide-react';
import { usePlaces, type SavedPlace, type NewSavedPlace } from '@/context/places-context';
import { useLanguage } from '@/context/language-context';

export type PlaceAction = 'add' | 'edit';

type PlacesDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: PlaceAction;
  place?: Partial<SavedPlace> | NewSavedPlace;
};

export function PlacesDialog({ isOpen, onOpenChange, action, place }: PlacesDialogProps) {
  const { addOrUpdatePlace } = usePlaces();
  const { t } = useLanguage();
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && place?.address) {
      setAddress(place.address);
    } else {
      setAddress(''); // Reset on open or for new places
    }
  }, [isOpen, place]);

  const handleSave = () => {
    if (!place || !address) return;
    setIsSaving(true);
    
    const placeToSave = {
        ...place,
        address: address,
    };

    addOrUpdatePlace(placeToSave);

    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
    }, 500); // Give time for the toast to appear
  };
  
  const getTitle = () => {
    if (action === 'edit') return t('editSavedPlace');
    switch (place?.type) {
        case 'home': return t('addHomeAddress');
        case 'work': return t('addWorkAddress');
        default: return t('addANewPlace');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {t('saveAddressForQuickAccess')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="address">{t('address')}</Label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                id="address"
                placeholder={t('enterAddressPlaceholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10"
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !address}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t('savePlace')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
