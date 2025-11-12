
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

const settingsOptions = [
  {
    icon: User,
    title: 'Edit Profile',
    description: 'Change name, photo, contact',
    href: '/settings/edit-profile',
  },
  {
    icon: Smartphone,
    title: 'Linked Devices',
    description: 'See other phones using this account',
    href: '/settings/linked-devices',
  },
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Add/remove MoMo, cards, Eritas Pay wallet',
    href: '/settings/payment-methods',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Enable/disable route or booking alerts',
    href: '/settings/notifications',
  },
  {
    icon: Lock,
    title: 'Security Settings',
    description: 'PIN, biometric login, 2FA toggle',
    href: '/settings/security',
  },
];

export default function SettingsPage() {
  const router = useRouter();
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
          <h1 className="text-lg font-semibold mx-auto">Profile Settings</h1>
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
                      <Link href={item.href} key={item.title}>
                        <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50">
                          <div className="p-2 bg-muted rounded-full">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <div key={item.title} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50">
                        <div className="p-2 bg-muted rounded-full">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                            {item.description}
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
                        <p className="font-semibold">App Theme</p>
                        <p className="text-sm text-muted-foreground">
                        Light / Dark / Auto
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
