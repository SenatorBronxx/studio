
'use client';

import { LayoutGrid, Music, Search, Utensils } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/home', icon: LayoutGrid, labelKey: 'home' },
    { href: '/search', icon: Search, labelKey: 'findABus' },
    { href: '/food', icon: Utensils, labelKey: 'food' },
    { href: '/music', icon: Music, labelKey: 'music' },
  ];

  return (
    <div className="bg-background/75 backdrop-blur-sm p-2 max-w-md mx-auto shadow-lg border-t border-border/50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link href={item.href} key={item.labelKey} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-full py-2 transition-colors',
                   isActive
                    ? 'bg-primary text-primary-foreground rounded-lg'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className={cn(
                    "text-xs",
                    isActive && "font-medium"
                )}>{t(item.labelKey)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
