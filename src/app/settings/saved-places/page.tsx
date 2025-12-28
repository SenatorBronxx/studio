
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useLanguage } from '@/context/language-context';
import { useSavedPlaces } from '@/context/saved-places-context';
import Link from 'next/link';

export default function SavedPlacesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { places, removePlace, isHydrated } = useSavedPlaces();

  const getIcon = (iconName: 'Home' | 'Briefcase' | string) => {
    switch (iconName) {
        case 'Home':
            return Home;
        case 'Briefcase':
            return Briefcase;
        default:
            return MapPin;
    }
  }

  if (!isHydrated) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

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
          <h1 className="text-lg font-semibold mx-auto">{t('savedPlaces')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-4">
            <Card>
                 <CardHeader>
                    <CardTitle>{t('myPlaces')}</CardTitle>
                    <CardDescription>{t('myPlacesDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {places.map((place) => {
                        const Icon = getIcon(place.icon);
                        return (
                        <div key={place.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-muted rounded-full">
                                <Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{place.name}</p>
                                <p className="text-sm text-muted-foreground">{place.address}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/settings/saved-places/edit?id=${place.id}`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>{t('edit')}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                <span className="text-destructive">{t('remove')}</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('removePlaceTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('removePlaceDescription', { placeName: place.name })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => removePlace(place.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    {t('remove')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        )
                    })}
                    <Link href="/settings/saved-places/edit" passHref>
                        <Button variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('addPlace')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
