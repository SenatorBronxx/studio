
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

export default function ShareTripPage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Since useTrip is removed, we just show a message.
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-4">
            <h1 className="text-xl font-bold">{t('noActiveTripTitle')}</h1>
            <p className='text-muted-foreground'>{t('noActiveTripDescription')}</p>
            <Button onClick={() => router.push('/home')} className="mt-4">{t('goToHome')}</Button>
        </div>
    );
}

    
