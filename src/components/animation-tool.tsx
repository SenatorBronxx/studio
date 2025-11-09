"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generatePersonalizedAnimation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
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
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Generate Ideas
    </Button>
  );
}

export function AnimationTool() {
  const [state, formAction] = useFormState(generatePersonalizedAnimation, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== "success") {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-white/20 text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wand2 />
          Personalize Your Experience
        </CardTitle>
        <CardDescription className="text-white/80">
          Tell us your interests, and we'll suggest some fun animations for you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interests" className="text-white/90">Your Interests</Label>
            <Input
              id="interests"
              name="interests"
              placeholder="e.g., hiking, futuristic cities, coffee"
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-accent"
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-white">Animation Style Suggestion:</h4>
              <p className="text-sm text-white/80">{state.data.animationStyle}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Sticker Ideas:</h4>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-white/80">
                {state.data.stickerSuggestions.map((sticker, index) => (
                  <li key={index}>{sticker}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
