import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      logger.warn('Validation failed', error.errors);
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
  };
};
