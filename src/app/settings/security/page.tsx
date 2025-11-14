
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Fingerprint, SmartphoneNfc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSecuritySettings } from '@/context/security-settings-context';
import { useLanguage } from '@/context/language-context';

export default function SecurityPage() {
  const router = useRouter();
  const {
    isPinEnabled,
    setIsPinEnabled,
    isBiometricEnabled,
    setIsBiometricEnabled,
    is2faEnabled,
    setIs2faEnabled,
  } = useSecuritySettings();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{t('securitySettings')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-4 space-y-4">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="pin-login" className="flex items-center gap-4 cursor-pointer">
                        <div className="p-2 bg-muted rounded-full">
                            <KeyRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{t('pinLogin')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('pinLoginDescription')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        id="pin-login"
                        checked={isPinEnabled}
                        onCheckedChange={setIsPinEnabled}
                    />
                   </div>
                   {isPinEnabled && (
                     <div className="pl-12">
                       <Button variant="outline" size="sm">{t('changePin')}</Button>
                     </div>
                   )}
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <Label htmlFor="biometric-login" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <Fingerprint className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('biometricLogin')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('biometricLoginDescription')}
                        </p>
                    </div>
                   </Label>
                   <Switch
                    id="biometric-login"
                    checked={isBiometricEnabled}
                    onCheckedChange={setIsBiometricEnabled}
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                   <Label htmlFor="2fa" className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2 bg-muted rounded-full">
                        <SmartphoneNfc className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('twoFactorAuth')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('twoFactorAuthDescription')}
                        </p>
                    </div>
                  </Label>
                  <Switch
                    id="2fa"
                    checked={is2faEnabled}
                    onCheckedChange={setIs2faEnabled}
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
