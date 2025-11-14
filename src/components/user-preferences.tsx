
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { savePreferencesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

const initialState = {
  message: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {t('savePreferences')}
    </Button>
  );
}

export function UserPreferences() {
  const [state, formAction] = useActionState(
    savePreferencesAction,
    initialState
  );
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (state.message) {
      if (state.data) {
        toast({
          title: t('preferencesSavedToastTitle'),
          description: state.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: t('uhOhSomethingWentWrong'),
          description: state.message,
        });
      }
    }
  }, [state, toast, t]);

  return (
    <Card className="w-full max-w-md bg-card/75 backdrop-blur-sm border-white/20 text-card-foreground lg:bg-card/75 lg:text-card-foreground lg:border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white lg:text-white">
          <Save />
          {t('tellUsMoreTitle')}
        </CardTitle>
        <CardDescription className="text-white/80 lg:text-white/80">
          {t('tellUsMoreDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food" className="text-white/90 lg:text-white/90">
              {t('favouriteFoodLabel')}
            </Label>
            <Input
              id="food"
              name="food"
              placeholder={t('favouriteFoodPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="music" className="text-white/90 lg:text-white/90">
              {t('favouriteMusicLabel')}
            </Label>
            <Input
              id="music"
              name="music"
              placeholder={t('favouriteMusicPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-white/90 lg:text-white/90">
              {t('favouriteDestinationLabel')}
            </Label>
            <Input
              id="destination"
              name="destination"
              placeholder={t('favouriteDestinationPlaceholder')}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/80 lg:text-white/80">
              {state.data.confirmationMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
