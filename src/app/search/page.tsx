
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, ArrowRight, Search, BusFront } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-grow p-4">
             <div className="max-w-md mx-auto">
                <div className='flex items-center gap-2 mb-4'>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                        placeholder='From' 
                        className='pl-10 bg-white' 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        />
                    </div>
                    <div className="p-2 rounded-full bg-gray-200">
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className='relative flex-1'>
                        <BusFront className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                        placeholder='To' 
                        className='pl-10 bg-white'
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleSearch} className='w-full'>
                    <Search className='mr-2 h-5 w-5' />
                    Search Buses
                </Button>
            </div>

            <div className="text-center mt-8">
                <Bus className="h-16 w-16 text-primary mb-4 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
                <p className="text-gray-500 mt-2 mb-6">
                    Finding the best buses for your journey.
                </p>

                <Card className="max-w-md mx-auto text-left">
                    <CardHeader>
                        <CardTitle>Your Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {fromQuery && toQuery ? (
                            <div>
                                <p><span className='font-semibold'>From:</span> {fromQuery}</p>
                                <p><span className='font-semibold'>To:</span> {toQuery}</p>
                                <p className="text-sm text-muted-foreground mt-4">Bus results would be displayed here...</p>
                            </div>
                        ) : (
                            <p>No search details provided. Use the search bar above to find a bus.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="sticky bottom-0 p-2 sm:p-4">
            <BottomNav />
        </div>
    </div>
  );
}
