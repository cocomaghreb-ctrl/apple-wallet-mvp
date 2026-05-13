import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { adminUserRepository } from '../repositories/adminUser.repo';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { handleError, AppError } from '../utils/errors';
import { AdminLoginSchema } from '@apple-wallet/shared';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password, name } = req.body;

      const existing = await adminUserRepository.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        });
      }

      const admin = await adminUserRepository.create(email, password, name);
      logger.info(`✅ Admin registered: ${email}`);

      const token = generateToken({
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      });

      return res.status(201).json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = AdminLoginSchema.parse(req.body);

      const admin = await adminUserRepository.findByEmail(email);
      if (!admin) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const isValid = await adminUserRepository.verifyPassword(password, admin.password);
      if (!isValid) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      logger.info(`✅ Admin logged in: ${email}`);

      const token = generateToken({
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      });

      return res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.admin) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const admin = await adminUserRepository.findById(req.admin.id);
      if (!admin) {
        throw new AppError(404, 'Admin not found', 'NOT_FOUND');
      }

      return res.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const authController = new AuthController();
