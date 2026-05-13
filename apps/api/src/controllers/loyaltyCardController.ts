import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { loyaltyCardService } from '../services/loyaltyCardService';
import { loyaltyCardRepository } from '../repositories/loyaltyCard.repo';
import { logger } from '../utils/logger';
import { handleError, AppError } from '../utils/errors';
import { CreateLoyaltyCardSchema, UpdateLoyaltyCardSchema } from '@apple-wallet/shared';

export class LoyaltyCardController {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const cards = await loyaltyCardRepository.findAll(skip, limit);

      logger.info(`📋 Listed ${cards.length} loyalty cards`);

      return res.json({
        data: cards.map((card) => ({
          id: card.id,
          customerId: card.customerId,
          loyaltyId: card.loyaltyId,
          tier: card.tier,
          points: card.points,
          totalPointsEarned: card.totalPointsEarned,
          totalPointsSpent: card.totalPointsSpent,
          qrValue: card.qrValue,
          active: card.active,
          customer: {
            firstName: card.customer.firstName,
            lastName: card.customer.lastName,
            email: card.customer.email,
          },
          walletPass: card.walletPass
            ? {
                id: card.walletPass.id,
                serialNumber: card.walletPass.serialNumber,
                passTypeIdentifier: card.walletPass.passTypeIdentifier,
              }
            : null,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        })),
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const card = await loyaltyCardRepository.findById(id);
      if (!card) {
        throw new AppError(404, 'Loyalty card not found', 'NOT_FOUND');
      }

      return res.json({
        id: card.id,
        customerId: card.customerId,
        loyaltyId: card.loyaltyId,
        tier: card.tier,
        points: card.points,
        totalPointsEarned: card.totalPointsEarned,
        totalPointsSpent: card.totalPointsSpent,
        qrValue: card.qrValue,
        active: card.active,
        customer: card.customer,
        walletPass: card.walletPass,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = CreateLoyaltyCardSchema.parse(req.body);

      const result = await loyaltyCardService.createCard(data);

      logger.info(`✅ Loyalty card created: ${result.card.id}`);

      return res.status(201).json({
        card: result.card,
        walletPass: result.walletPass,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = UpdateLoyaltyCardSchema.parse(req.body);

      if (!req.admin) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const updatedCard = await loyaltyCardService.updateCard(id, data, req.admin.email);

      logger.info(`✅ Card updated: ${id}`);

      return res.json(updatedCard);
    } catch (error) {
      handleError(error, res);
    }
  }

  async addPoints(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { points, reason } = req.body;

      if (typeof points !== 'number' || !reason) {
        throw new AppError(400, 'Missing points or reason', 'VALIDATION_ERROR');
      }

      if (!req.admin) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const updatedCard = await loyaltyCardService.addPoints(id, points, reason, req.admin.email);

      logger.info(`✅ Points updated for card: ${id}`);

      return res.json(updatedCard);
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const loyaltyCardController = new LoyaltyCardController();
