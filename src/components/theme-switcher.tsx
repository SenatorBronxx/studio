
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher({ showLabel = false }: { showLabel?: boolean }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
            setTheme(localTheme);
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', isDark);
    };

    if (showLabel) {
        return (
            <>
                <Label htmlFor="theme-switch" className="flex items-center gap-3">
                    <Sun className="h-5 w-5" /> Light / <Moon className="h-5 w-5" /> Dark
                </Label>
                <Switch
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                />
            </>
        )
    }

    return (
        <Switch
            id="theme-switch-settings"
            checked={theme === 'dark'}
            onCheckedChange={handleThemeChange}
        />
    );
}
