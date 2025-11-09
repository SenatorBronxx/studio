
'use client';

import {
  ArrowUpRight,
  Bus,
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
import { Progress } from '@/components/ui/progress';
import { VisaIcon } from '@/components/icons/visa';

const mockTransactions = [
  {
    id: 'txn-1',
    type: 'payment',
    plate: 'GT 4589-23',
    amount: -75.0,
  },
  {
    id: 'txn-2',
    type: 'payment',
    plate: 'AS 1234-24',
    amount: -55.0,
  },
    {
    id: 'txn-3',
    type: 'payment',
    plate: 'GN 2020-21',
    amount: -80.0,
  },
];

export default function EritasPayPage() {
  const currentBalance = 250.00;
  const maxBalance = 400.00;
  const progressPercentage = (currentBalance / maxBalance) * 100;

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
                <div className='p-2 bg-primary/10 rounded-lg'>
                    <Bus className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">GH₵ {currentBalance.toFixed(2)}</div>
              <Badge variant="secondary" className="mt-2">5% cash back on bus tickets</Badge>
            </CardContent>
          </Card>
          
          {/* Wallet Threshold */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-foreground">Wallet Threshold</h3>
                        <p className="text-sm font-mono text-muted-foreground">GH₵ {currentBalance.toFixed(2)} / GH₵ {maxBalance.toFixed(2)}</p>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">Increase your limit by verifying your identity.</p>
                </CardContent>
            </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="flex-col h-20">
              <ArrowUpRight className="h-6 w-6 mb-1" />
              Top-up
            </Button>
            <Button size="lg" variant="secondary" className="flex-col h-20">
              <VisaIcon className="w-12 mb-2" />
              Synchronize with VISA
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
                            <Avatar className="h-10 w-10 border bg-primary/10 text-primary">
                                <AvatarFallback>
                                    <Bus className='w-5 h-5'/>
                                </AvatarFallback>
                            </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">Bus Ticket Payment</p>
                            <p className="text-sm text-muted-foreground font-mono">{tx.plate}</p>
                        </div>
                        <div className={`font-semibold text-foreground`}>
                            -GH₵{Math.abs(tx.amount).toFixed(2)}
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
