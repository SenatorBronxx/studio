
'use server';
/**
 * @fileOverview Type definitions for the Admin Panel backend logic.
 */
import { z } from 'zod';


//================================================================================
// 1. GENERATE DRIVER REGISTRATION CODE
//================================================================================

export const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

export const GenerateDriverCodeOutputSchema = z.object({
  registrationCode: z.string(),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


//================================================================================
// 2. LIST USERS (PASSENGERS)
//================================================================================

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  walletBalance: z.number().optional(),
});

export const ListUsersOutputSchema = z.object({
  users: z.array(UserSchema),
});
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;


//================================================================================
// 3. LIST DRIVERS
//================================================================================

export const DriverSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  busPlateNumber: z.string().optional(),
  registrationCode: z.string().optional(),
});
export const ListDriversOutputSchema = z.object({
  drivers: z.array(DriverSchema),
});
export type ListDriversOutput = z.infer<typeof ListDriversOutputSchema>;


//================================================================================
// 4. DELETE USER
//================================================================================

export const DeleteUserInputSchema = z.object({
  userId: z.string(),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export const DeleteUserOutputSchema = z.object({
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


//================================================================================
// 5. DELETE DRIVER
//================================================================================

export const DeleteDriverInputSchema = z.object({
  driverId: z.string(),
});
export type DeleteDriverInput = z.infer<typeof DeleteDriverInputSchema>;

export const DeleteDriverOutputSchema = z.object({
  message: z.string(),
});
export type DeleteDriverOutput = z.infer<typeof DeleteDriverOutputSchema>;
