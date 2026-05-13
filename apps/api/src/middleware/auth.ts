import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid authorization header');
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization header',
    });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    logger.warn('Invalid token');
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }

  req.admin = {
    id: payload.adminId,
    email: payload.email,
    name: '',
    role: payload.role,
  };

  next();
};

export const walletAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('ApplePass b64token=')) {
    logger.warn('Invalid Apple Wallet auth header');
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid authorization',
    });
  }

  // In real implementation, validate against stored authenticationToken
  // For MVP, just verify the format
  next();
};
