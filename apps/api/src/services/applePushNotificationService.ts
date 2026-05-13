import { logger } from '../utils/logger';
import { deviceRegistrationRepository } from '../repositories/deviceRegistration.repo';
import { updateLogRepository } from '../repositories/updateLog.repo';
import { walletPassRepository } from '../repositories/walletPass.repo';

/**
 * ApplePushNotificationService abstracts push notification sending.
 * In production, this would use Apple's APNs service.
 * For MVP, we log the intent and store device registrations.
 */
export class ApplePushNotificationService {
  /**
   * Send a push notification to notify Wallet app that a pass was updated.
   * Apple Wallet will then fetch the updated pass using the web service endpoint.
   *
   * In production, this should:
   * 1. Load APNs certificate
   * 2. Connect to Apple APNs gateway (api.push.apple.com:443)
   * 3. Send a notification with empty payload (just triggers an update)
   * 4. Handle delivery/failure responses
   */
  async notifyPassUpdated(walletPassId: string): Promise<void> {
    try {
      logger.info(`📲 Notifying pass updates for: ${walletPassId}`);

      const walletPass = await walletPassRepository.findById(walletPassId);
      if (!walletPass) {
        logger.warn(`Pass not found: ${walletPassId}`);
        return;
      }

      const deviceRegistrations = walletPass.deviceRegistrations;
      logger.info(`  Found ${deviceRegistrations.length} registered device(s)`);

      for (const device of deviceRegistrations) {
        await this.sendNotification(device.pushToken, {
          passTypeIdentifier: walletPass.passTypeIdentifier,
          serialNumber: walletPass.serialNumber,
          deviceLibraryIdentifier: device.deviceLibraryIdentifier,
        });
      }
    } catch (error) {
      logger.error('❌ Failed to notify pass updates', error);
      // Don't throw - notifications are best-effort
    }
  }

  /**
   * Send individual push notification to a device
   */
  private async sendNotification(
    pushToken: string,
    payload: {
      passTypeIdentifier: string;
      serialNumber: string;
      deviceLibraryIdentifier: string;
    }
  ): Promise<void> {
    const apnsEnv = process.env.APPLE_APN_ENVIRONMENT || 'sandbox';
    const apnsKeyId = process.env.APPLE_APN_KEY_ID;
    const apnsTeamId = process.env.APPLE_APN_TEAM_ID;

    if (!apnsKeyId || !apnsTeamId) {
      logger.warn('⚠️  [DEV MODE] APNs credentials not configured, skipping actual notification');
      logger.info(`  Device: ${payload.deviceLibraryIdentifier}`);
      logger.info(`  Pass: ${payload.passTypeIdentifier}/${payload.serialNumber}`);
      return;
    }

    logger.info('🔐 Production APNs implementation needed:');
    logger.info(`  1. Install apn package: npm install apn`);
    logger.info(`  2. Load certificate from ${process.env.APPLE_APN_CERTIFICATE_PATH}`);
    logger.info(`  3. Send to ${apnsEnv} gateway`);
    logger.info(`  4. Push token: ${pushToken.substring(0, 16)}...`);
    logger.info(`  5. Payload: ${JSON.stringify(payload)}`);
  }

  /**
   * Get list of all devices that should be notified for a pass
   */
  async getDevicesForPass(walletPassId: string) {
    return deviceRegistrationRepository.findByWalletPass(walletPassId);
  }
}

export const applePushNotificationService = new ApplePushNotificationService();
