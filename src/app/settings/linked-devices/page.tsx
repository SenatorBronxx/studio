
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Laptop, Tablet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const initialDevices = [
  {
    id: 1,
    type: 'smartphone',
    name: 'Samsung Galaxy S24 Ultra',
    location: 'Accra, GH',
    lastActive: 'Online now',
    isCurrent: true,
  },
  {
    id: 2,
    type: 'laptop',
    name: 'Macbook Pro 14"',
    location: 'Kumasi, GH',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 3,
    type: 'tablet',
    name: 'iPad Air',
    location: 'Tema, GH',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

const deviceIcons = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
};

export default function LinkedDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState(initialDevices);

  const handleUnlink = (deviceId: number) => {
    setDevices((prevDevices) => prevDevices.filter((device) => device.id !== deviceId));
    // Here you would also make an API call to invalidate the session for that device
  };

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
          <h1 className="text-lg font-semibold mx-auto">Linked Devices</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            These are the devices that are currently signed in to your account.
          </p>

          {devices.map((device) => {
            const Icon = deviceIcons[device.type as keyof typeof deviceIcons];
            return (
              <Card key={device.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-grow">
                    <p className="font-semibold">{device.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.location} • {device.lastActive}
                    </p>
                  </div>
                  {device.isCurrent ? (
                    <Badge variant="secondary">Current device</Badge>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unlink this device?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unlink the {device.name}? It will be signed out of your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnlink(device.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Unlink
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
