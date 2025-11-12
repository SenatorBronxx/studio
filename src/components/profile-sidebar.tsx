
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { useUser } from '@/context/user-context';
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
import { useDiscount } from '@/context/discount-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '@/context/language-context';
import { useTrip } from '@/context/trip-context';

const menuItems = [
    { id: 'settings', icon: Settings, labelKey: 'profileSettings', href: '/settings' },
    { id: 'trips', icon: History, labelKey: 'recentTrips', href: '/settings/recent-trips' },
    { id: 'share', icon: Share2, labelKey: 'shareMyTrip' },
    { id: 'qr', icon: QrCode, labelKey: 'tripQrCodes' },
    {
        id: 'places',
        icon: MapPin,
        labelKey: 'savedPlaces',
        subItems: [
            { icon: Home, labelKey: 'addHomeAddress' },
            { icon: Briefcase, labelKey: 'addWorkAddress' },
            { icon: Plus, labelKey: 'addPlace' },
        ],
    },
    { id: 'discounts', icon: Percent, labelKey: 'userDiscounts' },
    { id: 'loyalty', icon: Award, labelKey: 'loyaltyPoints', href: '/loyalty' },
];

const discountOffer = {
    code: 'ERITAS15',
    percentage: 15,
    description: '15% discount on your next 3 trips',
};

export function ProfileSidebar() {
    const { user, setUser } = useUser();
    const userImage = PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;
    const router = useRouter();
    const { toast } = useToast();
    const { activeDiscount, activateDiscount, deactivateDiscount } = useDiscount();
    const { language, setLanguage, t } = useLanguage();
    const { activeTrip } = useTrip();

    const handleLogout = () => {
        setUser(null); // Clear user from context
        router.push('/');
    };

    const handleDeleteAccount = () => {
        // In a real app, this would trigger a backend process to delete the user.
        console.log('Deleting user account and all local data...');
        
        // Clear all app-related data from localStorage
        // This is a more robust way than clearing everything, in case other apps on the same domain use localStorage.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('eritas-')) {
                localStorage.removeItem(key);
            }
        });
        
        setUser(null); // Clear user from context
        
        toast({
            title: t('accountDeletedToastTitle'),
            description: t('accountDeletedToastDescription')
        });
        
        router.push('/'); // Redirect to the home/login page
    };
    
    const handleNavigate = (href?: string) => {
        if (href) {
            router.push(href);
        }
    };

    const handleShareTrip = async () => {
        if (!activeTrip) {
            toast({
                variant: 'destructive',
                title: t('noActiveTripTitle'),
                description: t('noActiveTripDescription'),
            });
            return;
        }

        if (!navigator.share) {
            toast({
                variant: 'destructive',
                title: t('shareNotSupportedTitle'),
                description: t('shareNotSupportedDescription'),
            });
            return;
        }

        const { bus, destination, eta } = activeTrip;
        const shareText = t('shareTripText', {
            driver: bus.driver,
            plate: bus.plate,
            destination: destination,
            eta: eta,
        });

        const shareUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        
        try {
            await navigator.share({
                title: t('shareTripTitle'),
                text: `${shareText}\n\n${t('trackMyTrip')}:\n${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
                toast({
                    title: t('shareCancelledTitle'),
                    description: t('shareCancelledDescription'),
                });
            } else {
                console.error('Error sharing trip:', error);
                toast({
                    variant: 'destructive',
                    title: t('shareFailedTitle'),
                    description: t('shareFailedDescription'),
                });
            }
        }
    };

    const handleMenuClick = (item: (typeof menuItems)[0]) => {
        if (item.id === 'share') {
            handleShareTrip();
        } else if (item.href) {
            handleNavigate(item.href);
        }
    }

    const handleActivateDiscount = () => {
        activateDiscount(discountOffer);
        toast({
            title: t('discountActivatedToastTitle'),
            description: t('discountActivatedToastDescription', { percentage: discountOffer.percentage }),
        });
    }

    const handleDeactivateDiscount = () => {
        deactivateDiscount();
        toast({
            title: t('discountDeactivatedToastTitle'),
            description: t('discountDeactivatedToastDescription'),
        });
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-card text-foreground"
                >
                    <User className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="text-left">
                    <SheetTitle>{t('myProfile')}</SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col h-full">
                    {/* Profile Section */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {userImage && <AvatarImage src={userImage} alt={user.name} />}
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{user.name}</p>
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
                    <div className="flex flex-col gap-1 flex-grow">
                         <Accordion type="single" collapsible className="w-full -mt-2">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;

                                if (item.id === 'discounts') {
                                    return (
                                        <AlertDialog key={item.id}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start gap-3 text-md w-full"
                                                    disabled={!user}
                                                >
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                    {t(item.labelKey)}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                {activeDiscount ? (
                                                    <>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('deactivateDiscountTitle')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t('deactivateDiscountDescription', { percentage: activeDiscount.percentage })}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={handleDeactivateDiscount}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                {t('deactivate')}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('discountEligibilityTitle')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t('discountEligibilityDescription', { percentage: discountOffer.percentage })}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="py-4">
                                                            <div className="relative rounded-lg bg-muted p-4 flex items-center justify-center">
                                                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-primary/30" />
                                                                <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                                                                    {discountOffer.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('close')}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleActivateDiscount}>{t('activate')}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </>
                                                )}
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )
                                }

                                return item.subItems ? (
                                    <AccordionItem value={`item-${index}`} key={item.id} className="border-b-0">
                                        <AccordionTrigger className="hover:no-underline hover:bg-transparent p-0">
                                             <Button
                                                variant="ghost"
                                                className="justify-start gap-3 text-md w-full"
                                                asChild
                                            >
                                                <div>
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                    {t(item.labelKey)}
                                                </div>
                                            </Button>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-2">
                                            <div className="flex flex-col gap-1 ml-8 mt-1">
                                                {item.subItems.map((subItem, subIndex) => {
                                                    const SubIcon = subItem.icon;
                                                    return (
                                                        <Button
                                                            key={subIndex}
                                                            variant="ghost"
                                                            className="justify-start gap-3 text-md"
                                                        >
                                                            <SubIcon className="h-5 w-5 text-muted-foreground" />
                                                            {t(subItem.labelKey)}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ) : (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        className="justify-start gap-3 text-md"
                                        onClick={() => handleMenuClick(item)}
                                        disabled={!user && !!item.href}
                                    >
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        {t(item.labelKey)}
                                    </Button>
                                );
                            })}
                         </Accordion>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center justify-between mb-4">
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
                                <SelectItem value="ga">Ga</SelectItem>
                                <SelectItem value="ew">Ewe</SelectItem>
                                <SelectItem value="sf">Sefwi</SelectItem>
                                <SelectItem value="ha">Hausa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between mb-6">
                       <ThemeSwitcher showLabel />
                    </div>

                    <div className="space-y-2">
                        {/* Logout Button */}
                        <Button variant="outline" className="w-full" onClick={handleLogout} disabled={!user}>
                            <LogOut className="mr-2 h-5 w-5" />
                            {t('logout')}
                        </Button>

                         {/* Delete Account Button */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full" disabled={!user}>
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
            </SheetContent>
        </Sheet>
    );
}

    