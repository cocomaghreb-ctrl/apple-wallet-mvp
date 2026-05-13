import { z } from 'zod';

export const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const CreateLoyaltyCardSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  loyaltyId: z.string().min(1, 'Loyalty ID is required'),
  points: z.number().int().min(0, 'Points must be non-negative'),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('silver'),
  qrValue: z.string().min(1, 'QR value is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  backgroundColor: z.string().optional(),
  foregroundColor: z.string().optional(),
  labelColor: z.string().optional(),
  logoImageBase64: z.string().optional(),
});

export type CreateLoyaltyCardInput = z.infer<typeof CreateLoyaltyCardSchema>;

export const UpdateLoyaltyCardSchema = z.object({
  points: z.number().int().min(0).optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  active: z.boolean().optional(),
});

export type UpdateLoyaltyCardInput = z.infer<typeof UpdateLoyaltyCardSchema>;

export const DeviceRegistrationSchema = z.object({
  deviceLibraryIdentifier: z.string().min(1, 'Device ID is required'),
  pushToken: z.string().min(1, 'Push token is required'),
  passesUpdatedSince: z.string().datetime().optional(),
});

export type DeviceRegistrationInput = z.infer<typeof DeviceRegistrationSchema>;
