
'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Smartphone,
  CreditCard,
  Bell,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Palette } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const settingsOptions = [
  {
    icon: User,
    titleKey: 'editProfile',
    descriptionKey: 'editProfileDescription',
    href: '/settings/edit-profile',
  },
  {
    icon: Smartphone,
    titleKey: 'linkedDevices',
    descriptionKey: 'linkedDevicesDescriptionSettings',
    href: '/settings/linked-devices',
  },
  {
    icon: CreditCard,
    titleKey: 'paymentMethods',
    descriptionKey: 'paymentMethodsDescription',
    href: '/settings/payment-methods',
  },
  {
    icon: Bell,
    titleKey: 'notifications',
    descriptionKey: 'notificationsDescription',
    href: '/settings/notifications',
  },
  {
    icon: Lock,
    titleKey: 'securitySettings',
    descriptionKey: 'securitySettingsDescription',
    href: '/settings/security',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const userImage = PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;

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
          <h1 className="text-lg font-semibold mx-auto">{t('profileSettings')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center -mt-2 mb-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                {userImage && <AvatarImage src={userImage} alt="User Name" />}
                <AvatarFallback>
                    <User className="h-10 w-10"/>
                </AvatarFallback>
            </Avatar>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {settingsOptions.map((item) => {
                  if (item.href) {
                    return (
                      <Link href={item.href} key={item.titleKey}>
                        <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50">
                          <div className="p-2 bg-muted rounded-full">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold">{t(item.titleKey)}</p>
                            <p className="text-sm text-muted-foreground">
                              {t(item.descriptionKey)}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <div key={item.titleKey} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50">
                        <div className="p-2 bg-muted rounded-full">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{t(item.titleKey)}</p>
                            <p className="text-sm text-muted-foreground">
                            {t(item.descriptionKey)}
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  );
                })}
                 <div className="flex items-center gap-4 p-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{t('appTheme')}</p>
                        <p className="text-sm text-muted-foreground">
                        {t('appThemeDescription')}
                        </p>
                    </div>
                    <ThemeSwitcher />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
