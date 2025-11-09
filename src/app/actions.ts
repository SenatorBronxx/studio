"use server";

import { z } from "zod";
import { personalizedAnimation } from "@/ai/flows/personalized-animation";
import type { PersonalizedAnimationOutput } from "@/ai/flows/personalized-animation";

const AnimationRequestSchema = z.object({
  interests: z.string().min(3, "Please tell us a bit more about your interests."),
});

type State = {
  message?: string | null;
  data?: PersonalizedAnimationOutput | null;
};

export async function generatePersonalizedAnimation(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = AnimationRequestSchema.safeParse({
    interests: formData.get("interests"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.interests?.[0],
    };
  }

  try {
    const result = await personalizedAnimation({
      interests: validatedFields.data.interests,
    });
    return { message: "success", data: result };
  } catch (error) {
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }
}
