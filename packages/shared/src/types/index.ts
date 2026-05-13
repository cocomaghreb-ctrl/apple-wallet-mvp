export interface AdminUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CreateLoyaltyCardDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loyaltyId: string;
  points: number;
  tier: string;
  qrValue: string;
  organizationName: string;
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  logoImageBase64?: string;
}

export interface UpdateLoyaltyCardDTO {
  points?: number;
  tier?: string;
  active?: boolean;
}

export interface LoyaltyCardResponse {
  id: string;
  customerId: string;
  loyaltyId: string;
  tier: string;
  points: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  qrValue: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletPassResponse {
  id: string;
  loyaltyCardId: string;
  serialNumber: string;
  passTypeIdentifier: string;
  teamIdentifier: string;
  organizationName: string;
  version: number;
  lastUpdatedAt: string;
}

export interface DeviceRegistrationRequest {
  deviceLibraryIdentifier: string;
  pushToken: string;
  passesUpdatedSince?: string;
}

export interface PassUpdatePayload {
  points?: number;
  tier?: string;
  qrValue?: string;
}

export interface ApplePushNotificationPayload {
  deviceLibraryIdentifier: string;
  pushToken: string;
  passTypeIdentifier: string;
  serialNumber: string;
}

export interface PassSigningOptions {
  certificatePath?: string;
  certificatePassword?: string;
  teamIdentifier: string;
  passTypeIdentifier: string;
}
