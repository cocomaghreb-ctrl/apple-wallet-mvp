import { randomBytes } from 'crypto';

export const generateSerialNumber = (): string => {
  return randomBytes(8).toString('hex');
};

export const generateAuthenticationToken = (): string => {
  return randomBytes(32).toString('hex');
};
