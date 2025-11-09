
'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-grow p-4 text-center">
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
                    {from && to ? (
                        <div>
                            <p><span className='font-semibold'>From:</span> {from}</p>
                            <p><span className='font-semibold'>To:</span> {to}</p>
                        </div>
                    ) : (
                        <p>No search details provided. Go back to the home page to start a search.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="sticky bottom-0 p-2 sm:p-4">
            <BottomNav />
        </div>
    </div>
  );
}
