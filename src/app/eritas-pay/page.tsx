
'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfileSidebar } from '@/components/profile-sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BottomNav } from '@/components/bottom-nav';

const mockTransactions = [
  {
    id: 'txn-1',
    type: 'payment',
    name: 'STC Bus Ticket',
    description: 'Accra to Kumasi',
    amount: -75.0,
    avatar: PlaceHolderImages.find((p) => p.id === 'bus-side-view')?.imageUrl,
  },
  {
    id: 'txn-2',
    type: 'top-up',
    name: 'Mobile Money Top-up',
    description: 'MTN Mobile Money',
    amount: 200.0,
    avatar: PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl,
  },
    {
    id: 'txn-3',
    type: 'payment',
    name: 'Streetwise 2',
    description: 'KFC, Circle',
    amount: -55.0,
    avatar: PlaceHolderImages.find((p) => p.id === 'bus-side-view')?.imageUrl,
  },
];

export default function EritasPayPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <ProfileSidebar />
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Balance Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                ERITAS Pay Balance
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">GH₵ 576.00</div>
              <Badge variant="secondary" className="mt-2">5% cash back on bus tickets</Badge>
            </CardContent>
          </Card>
          
           {/* Notification Card */}
          <Card className="bg-primary text-primary-foreground">
             <CardContent className="p-4 flex items-center justify-between">
                <div className='flex items-center gap-4'>
                    <div className='bg-primary-foreground/20 p-3 rounded-lg'>
                        <CreditCard className='h-6 w-6'/>
                    </div>
                    <div>
                        <p className='font-bold'>You received GH₵ 100.00</p>
                        <p className='text-sm opacity-80'>Use it to tap and pay in stores</p>
                    </div>
                </div>
                <ChevronRight className='h-6 w-6 opacity-70'/>
             </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="flex-col h-20">
              <ArrowUpRight className="h-6 w-6 mb-1" />
              Send
            </Button>
            <Button size="lg" variant="secondary" className="flex-col h-20">
              <ArrowDownLeft className="h-6 w-6 mb-1" />
              Receive
            </Button>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="link" className="text-primary">
                See all
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {mockTransactions.map((tx, index) => (
                    <div key={tx.id}>
                        <div className="flex items-center gap-4 p-4">
                        <Avatar className="h-10 w-10 border">
                            {tx.avatar && <AvatarImage src={tx.avatar} alt={tx.name} className='object-cover' />}
                            <AvatarFallback>{tx.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{tx.name}</p>
                            <p className="text-sm text-muted-foreground">{tx.description}</p>
                        </div>
                        <div className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                            {tx.amount > 0 ? `+GH₵${tx.amount.toFixed(2)}` : `-GH₵${Math.abs(tx.amount).toFixed(2)}`}
                        </div>
                        </div>
                        {index < mockTransactions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}
