
'use client';

import { LayoutGrid, Music, Search, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: LayoutGrid, label: 'Home' },
  { href: '/eritas-pay', icon: Wallet, label: 'ERITAS Pay' },
  { href: '/search', icon: Search, label: 'Find A Bus', primary: true },
  { href: '/music', icon: Music, label: 'MUSIC' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white/80 backdrop-blur-sm p-2 max-w-md mx-auto shadow-lg border-t border-gray-200/50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.primary) {
            return (
              <Button key={item.label} className="flex-1 flex flex-col h-auto bg-primary text-primary-foreground rounded-lg py-2">
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          }

          return (
            <Link href={item.href} key={item.label} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary transition-colors',
                  isActive && 'text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
