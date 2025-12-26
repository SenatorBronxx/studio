
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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Palette } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useState } from 'react';

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

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

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
          <h1 className="text-lg font-semibold mx-auto">{t('profileSettings')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center -mt-2 mb-6">
            {isLoading ? (
                <div className='h-24 w-24 flex items-center justify-center'>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : user ? (
                <>
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-10 w-10"/>}
                    </AvatarFallback>
                </Avatar>
                <div className='text-center mt-2'>
                    <p className='font-bold text-xl'>{user.displayName}</p>
                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                </div>
                </>
            ) : (
                 <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarFallback>
                        <User className="h-10 w-10"/>
                    </AvatarFallback>
                </Avatar>
            )}
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
