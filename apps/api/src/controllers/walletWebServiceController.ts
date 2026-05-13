import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { deviceRegistrationRepository } from '../repositories/deviceRegistration.repo';
import { walletPassRepository } from '../repositories/walletPass.repo';
import { logger } from '../utils/logger';
import { handleError, AppError } from '../utils/errors';
import { DeviceRegistrationSchema } from '@apple-wallet/shared';

export class WalletWebServiceController {
  /**
   * POST /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
   * Register a device to receive updates for a pass
   */
  async registerDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = req.params;
      const { pushToken } = req.body;

      if (!pushToken) {
        throw new AppError(400, 'Push token required', 'VALIDATION_ERROR');
      }

      logger.info(
        `📱 Registering device: ${deviceLibraryIdentifier} for pass: ${serialNumber}`
      );

      const walletPass = await walletPassRepository.findBySerialNumber(serialNumber);
      if (!walletPass) {
        throw new AppError(404, 'Pass not found', 'NOT_FOUND');
      }

      // Check if already registered
      const existing = await deviceRegistrationRepository.findByDeviceAndPass(
        walletPass.id,
        deviceLibraryIdentifier
      );

      if (existing) {
        // Update push token if changed
        if (existing.pushToken !== pushToken) {
          logger.info(`  Updating push token for device`);
          // In a real implementation, update the token
        }
        return res.status(200).json({ registered: true });
      }

      // Create new registration
      const registration = await deviceRegistrationRepository.create({
        walletPassId: walletPass.id,
        deviceLibraryIdentifier,
        pushToken,
      });

      logger.info(`✅ Device registered: ${registration.id}`);

      return res.status(201).json({
        registered: true,
        deviceId: registration.id,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * DELETE /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
   * Unregister a device from receiving updates
   */
  async unregisterDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceLibraryIdentifier, serialNumber } = req.params;

      logger.info(
        `📱 Unregistering device: ${deviceLibraryIdentifier} for pass: ${serialNumber}`
      );

      const walletPass = await walletPassRepository.findBySerialNumber(serialNumber);
      if (!walletPass) {
        throw new AppError(404, 'Pass not found', 'NOT_FOUND');
      }

      await deviceRegistrationRepository.delete(walletPass.id, deviceLibraryIdentifier);

      logger.info(`✅ Device unregistered`);

      return res.status(200).json({ unregistered: true });
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}
   * Get list of updated passes for a device
   */
  async getUpdatedPasses(req: AuthenticatedRequest, res: Response) {
    try {
      const { passTypeIdentifier } = req.params;
      const passesUpdatedSince = req.query.passesUpdatedSince as string;

      logger.info(
        `📋 Getting updated passes for type: ${passTypeIdentifier} since: ${passesUpdatedSince}`
      );

      if (!passesUpdatedSince) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'passesUpdatedSince parameter required',
        });
      }

      const sinceDate = new Date(passesUpdatedSince);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format',
        });
      }

      // In a real implementation, query passes updated since the given date
      // For MVP, return empty list
      logger.info(`  Found 0 updated passes`);

      return res.json({
        lastUpdated: new Date().toISOString(),
        serialNumbers: [],
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * GET /v1/passes/{passTypeIdentifier}/{serialNumber}
   * Get the actual pass file (signed .pkpass)
   */
  async getPass(req: AuthenticatedRequest, res: Response) {
    try {
      const { serialNumber } = req.params;

      logger.info(`📦 Fetching pass: ${serialNumber}`);

      const walletPass = await walletPassRepository.findBySerialNumber(serialNumber);
      if (!walletPass) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      // In real implementation, return the signed .pkpass file
      // For MVP, return pass info
      return res.json({
        serialNumber: walletPass.serialNumber,
        passTypeIdentifier: walletPass.passTypeIdentifier,
        version: walletPass.version,
        lastUpdatedAt: walletPass.lastUpdatedAt,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const walletWebServiceController = new WalletWebServiceController();
