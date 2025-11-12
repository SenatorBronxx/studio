
'use client';

import { useLanguage } from '@/context/language-context';
import { Utensils } from 'lucide-react';

export default function FoodPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Utensils className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold text-foreground">{t('foodTitle')}</h1>
      <p className="text-muted-foreground mt-2">
        {t('foodDescription')}
      </p>
    </div>
  );
}
