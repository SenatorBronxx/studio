
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

const menuItems = [
    { id: 'settings', icon: Settings, label: 'Profile Settings', href: '/settings' },
    { id: 'trips', icon: History, label: 'Recent Trips' },
    { id: 'qr', icon: QrCode, label: 'Trip QR Codes' },
    {
        id: 'places',
        icon: MapPin,
        label: 'Saved Places',
        subItems: [
            { icon: Home, label: 'Add home address' },
            { icon: Briefcase, label: 'Add work address' },
            { icon: Plus, label: 'Add place' },
        ],
    },
    { id: 'discounts', icon: Percent, label: 'User Discounts' },
    { id: 'loyalty', icon: Award, label: 'Loyalty Points' },
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
    const { activateDiscount } = useDiscount();

    const handleLogout = () => {
        setUser(null); // Clear user from context
        router.push('/');
    };

    const handleDeleteAccount = () => {
        // In a real app, this would trigger a backend process to delete the user.
        console.log('Deleting user account...');
        setUser(null);
        router.push('/');
    };
    
    const handleNavigate = (href?: string) => {
        if (href) {
            router.push(href);
        }
    };

    const handleActivateDiscount = () => {
        activateDiscount(discountOffer);
        toast({
            title: 'Discount Activated!',
            description: `Your ${discountOffer.percentage}% discount has been applied to your account.`,
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
                    <SheetTitle>My Profile</SheetTitle>
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
                                <p className="text-lg font-semibold">Guest</p>
                                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/')}>
                                    Sign In
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
                                                    {item.label}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Discount Eligibility</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Congratulations! You are eligible for a {discountOffer.percentage}% discount on your next 3 trips. Activate the code below to apply it to your account.
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
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleActivateDiscount}>Activate</AlertDialogAction>
                                                </AlertDialogFooter>
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
                                                    {item.label}
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
                                                            {subItem.label}
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
                                        onClick={() => handleNavigate(item.href)}
                                        disabled={!user && !!item.href}
                                    >
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        {item.label}
                                    </Button>
                                );
                            })}
                         </Accordion>
                    </div>

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between mb-6">
                       <ThemeSwitcher showLabel />
                    </div>

                    <div className="space-y-2">
                        {/* Logout Button */}
                        <Button variant="outline" className="w-full" onClick={handleLogout} disabled={!user}>
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </Button>

                         {/* Delete Account Button */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full" disabled={!user}>
                                    <Trash2 className="mr-2 h-5 w-5" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
