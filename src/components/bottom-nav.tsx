
'use client';

import { LayoutGrid, Music, Search, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: LayoutGrid, label: 'Home' },
  { href: '/eritas-pay', icon: Wallet, label: 'ERITAS Pay' },
  { href: '/search', icon: Search, label: 'Find A Bus' },
  { href: '/music', icon: Music, label: 'MUSIC' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bg-background/80 backdrop-blur-sm p-2 max-w-md mx-auto shadow-lg border-t border-border/50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link href={item.href} key={item.label} className="flex-1">
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
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
