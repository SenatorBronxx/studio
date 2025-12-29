
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Save, Home, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useSavedPlaces } from '@/context/saved-places-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const placeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  icon: z.string().default('MapPin'),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

const iconOptions = [
  { value: 'Home', icon: Home },
  { value: 'Briefcase', icon: Briefcase },
  { value: 'MapPin', icon: MapPin },
];

function EditSavedPlaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get('id');
  const { places, addPlace, updatePlace } = useSavedPlaces();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = Boolean(placeId);
  const existingPlace = isEditing ? places.find(p => p.id === placeId) : undefined;
  
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: '',
      address: '',
      icon: 'MapPin',
    },
  });
  
  useEffect(() => {
    if (isEditing && existingPlace) {
      form.reset(existingPlace);
    }
  }, [isEditing, existingPlace, form]);
  

  const onSubmit = async (data: PlaceFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        if (isEditing && placeId) {
            updatePlace(placeId, data);
        } else {
            addPlace(data);
        }
        
        toast({
            title: t('placeSaved'),
            description: t('addressSavedSuccessfully'),
        });
        
        setIsSubmitting(false);
        router.back();
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold mx-auto">{isEditing ? t('editSavedPlace') : t('addANewPlace')}</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {t('saveAddressForQuickAccess')}
          </p>
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Home, Work" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('enterAddressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            {iconOptions.map(({ value, icon: Icon }) => (
                               <FormItem key={value} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={value} id={`icon-${value}`} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={`icon-${value}`}
                                  className={`p-3 rounded-full border-2 cursor-pointer ${field.value === value ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'}`}
                                >
                                  <Icon className={`h-5 w-5 ${field.value === value ? 'text-primary' : 'text-muted-foreground'}`} />
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('savePlace')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function EditSavedPlacePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditSavedPlaceForm />
        </Suspense>
    )
}
