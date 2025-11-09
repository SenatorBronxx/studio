
'use client';

import { LayoutGrid, Music, Search, Wallet } from 'lucide-react';
import { Button } from './ui/button';

const navItems = [
  { icon: LayoutGrid, label: 'Home' },
  { icon: Wallet, label: 'ERITAS Pay' },
  { icon: Search, label: 'Find A Bus', primary: true },
  { icon: Music, label: 'MUSIC' },
];

export function BottomNav() {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-2 max-w-md mx-auto shadow-lg border-t border-gray-200/50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Button key={item.label} className="flex-1 flex flex-col h-auto bg-primary text-primary-foreground rounded-lg py-2">
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          }
          return (
            <button key={item.label} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary transition-colors">
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
