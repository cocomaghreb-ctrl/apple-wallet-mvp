import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface PassSigningResult {
  pkpassData: Buffer;
  filename: string;
}

export interface AppleWalletError {
  code: string;
  message: string;
  statusCode: number;
}
