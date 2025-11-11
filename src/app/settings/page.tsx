
'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Smartphone,
  CreditCard,
  Bell,
  Palette,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const settingsOptions = [
  {
    icon: User,
    title: 'Edit Profile',
    description: 'Change name, photo, contact',
  },
  {
    icon: Smartphone,
    title: 'Linked Devices',
    description: 'See other phones using this account',
  },
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Add/remove MoMo, cards, Eritas Pay wallet',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Enable/disable route or booking alerts',
  },
  {
    icon: Palette,
    title: 'App Theme',
    description: 'Light / Dark / Auto',
  },
  {
    icon: Lock,
    title: 'Security Settings',
    description: 'PIN, biometric login, 2FA toggle',
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
                {settingsOptions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50"
                    >
                      <div className="p-2 bg-muted rounded-full">
                         <Icon className="h-5 w-5 text-muted-foreground" />
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
