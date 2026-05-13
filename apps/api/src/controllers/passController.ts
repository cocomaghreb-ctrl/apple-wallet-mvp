import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { walletPassRepository } from '../repositories/walletPass.repo';
import { passGenerationService } from '../services/passGenerationService';
import { logger } from '../utils/logger';
import { handleError, AppError } from '../utils/errors';

export class PassController {
  async downloadPass(req: AuthenticatedRequest, res: Response) {
    try {
      const { serialNumber } = req.params;

      const walletPass = await walletPassRepository.findBySerialNumber(serialNumber);
      if (!walletPass) {
        throw new AppError(404, 'Pass not found', 'NOT_FOUND');
      }

      // Regenerate the pass to get the latest data
      const passResult = await passGenerationService.regeneratePass(
        walletPass.id,
        {
          points: walletPass.loyaltyCard.points,
          tier: walletPass.loyaltyCard.tier,
        }
      );

      logger.info(`📦 Downloaded pass: ${serialNumber}`);

      // Set response headers for .pkpass file
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="${serialNumber}.pkpass"`);
      res.setHeader('Content-Length', passResult.pkpassData.length);

      return res.send(passResult.pkpassData);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getPassInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { serialNumber } = req.params;

      const walletPass = await walletPassRepository.findBySerialNumber(serialNumber);
      if (!walletPass) {
        throw new AppError(404, 'Pass not found', 'NOT_FOUND');
      }

      return res.json({
        id: walletPass.id,
        serialNumber: walletPass.serialNumber,
        passTypeIdentifier: walletPass.passTypeIdentifier,
        teamIdentifier: walletPass.teamIdentifier,
        organizationName: walletPass.organizationName,
        description: walletPass.description,
        version: walletPass.version,
        lastUpdatedAt: walletPass.lastUpdatedAt,
        loyaltyCard: {
          id: walletPass.loyaltyCard.id,
          loyaltyId: walletPass.loyaltyCard.loyaltyId,
          points: walletPass.loyaltyCard.points,
          tier: walletPass.loyaltyCard.tier,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const passController = new PassController();
