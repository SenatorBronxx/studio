
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
    Menu,
    User,
    History,
    Percent,
    Award,
    LogOut,
    Settings,
    Sun,
    Moon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const menuItems = [
    { icon: Settings, label: 'Profile Settings' },
    { icon: History, label: 'Recent Trips' },
    { icon: Percent, label: 'User Discounts' },
    { icon: Award, label: 'Loyalty Points' },
];

export function ProfileSidebar() {
    const userImage = PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
            setTheme(localTheme);
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
        }
    }, []);

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', isDark);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-800"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="text-left">
                    <SheetTitle>My Profile</SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col h-full">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {userImage && <AvatarImage src={userImage} alt="User Name" />}
                            <AvatarFallback>
                                <User />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-semibold">Ama Serwaa</p>
                            <p className="text-sm text-muted-foreground">ama.s@email.com</p>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Menu Items */}
                    <div className="flex flex-col gap-4 flex-grow">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    className="justify-start gap-3 text-md"
                                >
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    {item.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between mb-6">
                        <Label htmlFor="theme-switch" className="flex items-center gap-3">
                            <Sun className="h-5 w-5" /> Light / <Moon className="h-5 w-5" /> Dark
                        </Label>
                        <Switch
                            id="theme-switch"
                            checked={theme === 'dark'}
                            onCheckedChange={handleThemeChange}
                        />
                    </div>

                    {/* Logout Button */}
                    <Button variant="destructive" className="w-full">
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
