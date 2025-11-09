"use client";

import { useFormState, useFormStatus } from "react-dom";
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

const initialState = {
  message: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Save Preferences
    </Button>
  );
}

export function UserPreferences() {
  const [state, formAction] = useFormState(savePreferencesAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.data) {
        toast({
          title: "Preferences Saved!",
          description: state.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-white/20 text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Save />
          Tell Us More About You
        </CardTitle>
        <CardDescription className="text-white/80">
          Help us personalize your experience by sharing your favorites.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food" className="text-white/90">
              Favourite Food
            </Label>
            <Input
              id="food"
              name="food"
              placeholder="e.g., Waakye, Jollof Rice"
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="music" className="text-white/90">
              Favourite Music
            </Label>
            <Input
              id="music"
              name="music"
              placeholder="e.g., Highlife, Afrobeats"
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-white/90">
              Favourite Ghanaian Destination
            </Label>
            <Input
              id="destination"
              name="destination"
              placeholder="e.g., Cape Coast Castle, Kakum National Park"
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/80">{state.data.confirmationMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
