
'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    User,
    History,
    Percent,
    Award,
    LogOut,
    Settings,
    QrCode,
    MapPin,
    Home,
    Briefcase,
    Plus,
    Trash2,
    Ticket,
    Globe,
    Share2,
    UserCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
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
import { ThemeSwitcher } from './theme-switcher';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '@/context/language-context';
import { useState } from 'react';

const menuItems = [
    { id: 'settings', icon: Settings, labelKey: 'profileSettings', href: '/settings' },
    { id: 'trips', icon: History, labelKey: 'recentTrips', href: '/settings/recent-trips' },
    { id: 'share', icon: Share2, labelKey: 'shareMyTrip' },
    { id: 'qr', icon: QrCode, labelKey: 'tripQrCodes', href: '/settings/trip-qrs' },
    { id: 'loyalty', icon: Award, labelKey: 'loyaltyPoints', href: '/loyalty' },
];

// Mock user data for a DB-less experience
const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export function ProfileSidebar() {
    const router = useRouter();
    const { toast } = useToast();
    const { language, setLanguage, t } = useLanguage();

    const handleLogout = () => {
        router.push('/');
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        localStorage.clear();
    };

    const handleDeleteAccount = async () => {
        toast({
            title: t('accountDeletedToastTitle'),
            description: t('accountDeletedToastDescription')
        });
        router.push('/');
        localStorage.clear();
    };
    
    const handleNavigate = (href?: string) => {
        if (href) {
            router.push(href);
        }
    };

    const handleShareTrip = () => {
        // Since active trip is removed, we show a toast
        toast({
            variant: 'destructive',
            title: t('noActiveTripTitle'),
            description: t('noActiveTripDescription'),
        });
    };

    const handleMenuClick = (item: (typeof menuItems)[0]) => {
        if (item.id === 'share') {
            handleShareTrip();
        } else if (item.href) {
            handleNavigate(item.href);
        }
    }
    
    const user = mockUser; // Use the mock user

    return (
        <>
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="bg-background/75 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                >
                    <UserCircle className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="text-left">
                    <SheetTitle>{t('myProfile')}</SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col h-full">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                <AvatarFallback>
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{user.displayName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{t('guest')}</p>
                                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/')}>
                                    {t('signIn')}
                                </Button>
                            </div>
                        </div>
                    )}


                    <Separator className="my-6" />

                    {/* Menu Items */}
                    <div className="flex flex-col gap-1 flex-grow overflow-y-auto">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className="justify-start gap-3 text-md"
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    {t(item.labelKey)}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 space-y-4">
                        {/* Language Switcher */}
                        <div className="flex items-center justify-between">
                            <div className='flex items-center gap-3 text-md'>
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('language')}</span>
                            </div>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-us">English (US)</SelectItem>
                                    <SelectItem value="en-gb">English (UK)</SelectItem>
                                    <SelectItem value="tw">Twi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Theme Switcher */}
                        <div className="flex items-center justify-between">
                        <ThemeSwitcher showLabel />
                        </div>

                        <div className="space-y-2">
                            {/* Logout Button */}
                            <Button variant="outline" className="w-full" onClick={handleLogout}>
                                <LogOut className="mr-2 h-5 w-5" />
                                {t('logout')}
                            </Button>

                            {/* Delete Account Button */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-5 w-5" />
                                        {t('deleteAccount')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('deleteAccountConfirmationTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('deleteAccountConfirmationDescription')}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount}>{t('continue')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
        </>
    );
}

    