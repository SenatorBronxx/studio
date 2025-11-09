
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, BusFront } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fromQuery = searchParams.get('from') || '';
  const toQuery = searchParams.get('to') || '';

  const [fromLocation, setFromLocation] = useState(fromQuery);
  const [toLocation, setToLocation] = useState(toQuery);

  useEffect(() => {
    setFromLocation(fromQuery);
    setToLocation(toQuery);
  }, [fromQuery, toQuery]);

  const handleSearch = () => {
    router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 shadow-sm">
             <div className="max-w-md mx-auto">
                <div className='flex items-center gap-2 mb-2'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder='From' 
                        className='pl-10 bg-card' 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        />
                    </div>
                    <div className="p-2 rounded-full bg-muted">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                        placeholder='To' 
                        className='pl-10 bg-card'
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleSearch} className='w-full'>
                    <Search className='mr-2 h-5 w-5' />
                    Search For Buses
                </Button>
            </div>
        </div>

        <div className="flex-grow p-4">
            <div className="max-w-md mx-auto text-center">
                
                {fromQuery && toQuery ? (
                    <div>
                        <h1 className="text-xl font-bold text-foreground mb-2">Showing results for:</h1>
                        <p className="text-muted-foreground mb-6"><span className='font-semibold text-foreground'>{fromQuery}</span> to <span className='font-semibold text-foreground'>{toQuery}</span></p>
                        {/* Bus results would be mapped and displayed here */}
                        <Card className="text-left">
                            <CardContent className='p-4'>
                                <p className='text-muted-foreground'>Bus results would appear here.</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center mt-16">
                        <Search className="h-16 w-16 text-muted-foreground/30 mb-4 mx-auto" />
                        <h1 className="text-2xl font-bold text-foreground">Find Your Bus</h1>
                        <p className="text-muted-foreground mt-2">
                            Enter a destination to see available buses.
                        </p>
                    </div>
                )}
            </div>
        </div>
        <div className="sticky bottom-0">
            <BottomNav />
        </div>
    </div>
  );
}
