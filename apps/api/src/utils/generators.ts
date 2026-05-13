import { v4 as uuidv4 } from 'crypto';

export const generateSerialNumber = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 16);
};

export const generateAuthenticationToken = (): string => {
  return uuidv4().replace(/-/g, '');
};
