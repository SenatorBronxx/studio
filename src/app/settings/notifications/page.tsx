
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificationSettings } from '@/context/notification-settings-context';
import { useLanguage } from '@/context/language-context';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    routeAlerts,
    setRouteAlerts,
    bookingAlerts,
    setBookingAlerts,
    systemAlerts,
    setSystemAlerts
  } = useNotificationSettings();
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('notifications')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <Label htmlFor="route-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <Bus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('routeAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('routeAlertsDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch 
                    id="route-alerts"
                    checked={routeAlerts}
                    onCheckedChange={setRouteAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <Label htmlFor="booking-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('bookingAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('bookingAlertsDescription')}
                        </p>
                    </div>
                   </Label>
                   <Switch 
                    id="booking-alerts"
                    checked={bookingAlerts}
                    onCheckedChange={setBookingAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                   <Label htmlFor="system-alerts" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('systemAlerts')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('systemAlertsDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch 
                    id="system-alerts"
                    checked={systemAlerts}
                    onCheckedChange={setSystemAlerts}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
