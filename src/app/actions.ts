"use server";

import { z } from "zod";
import {
  saveUserPreferences,
  type UserPreferencesOutput,
} from "@/ai/flows/save-user-preferences";

const UserPreferencesSchema = z.object({
  food: z.string().min(2, "Please enter a valid food."),
  music: z.string().min(2, "Please enter a valid music genre."),
  destination: z.string().min(2, "Please enter a valid destination."),
});

type State = {
  message?: string | null;
  data?: UserPreferencesOutput | null;
};

export async function savePreferencesAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = UserPreferencesSchema.safeParse({
    food: formData.get("food"),
    music: formData.get("music"),
    destination: formData.get("destination"),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const message =
      fieldErrors.food?.[0] ||
      fieldErrors.music?.[0] ||
      fieldErrors.destination?.[0];
    return {
      message: message,
    };
  }

  try {
    const result = await saveUserPreferences(validatedFields.data);
    return { message: result.confirmationMessage, data: result };
  } catch (error) {
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }
}
