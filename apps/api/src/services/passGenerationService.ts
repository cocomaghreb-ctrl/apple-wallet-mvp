import { logger } from '../utils/logger';
import { generateSerialNumber, generateAuthenticationToken } from '../utils/generators';
import { walletPassRepository } from '../repositories/walletPass.repo';
import { createPassSigningService } from './passSigningService';
import type { CreateLoyaltyCardInput } from '@apple-wallet/shared';

export interface PassGenerationPayload {
  customerId: string;
  loyaltyCardId: string;
  customerFirstName: string;
  customerLastName: string;
  loyaltyId: string;
  points: number;
  tier: string;
  qrValue: string;
  organizationName: string;
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
}

export class PassGenerationService {
  private signingService = createPassSigningService();

  /**
   * Generate complete pass.json structure for Apple Wallet
   * Reference: https://developer.apple.com/documentation/walletkit/pass
   */
  private generatePassJson(payload: PassGenerationPayload): any {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3001/api';
    const passTypeIdentifier = process.env.APPLE_PASS_TYPE_ID || 'pass.com.example.loyaltycard';
    const teamIdentifier = process.env.APPLE_TEAM_ID || 'your-team-id';

    return {
      formatVersion: 1,
      passTypeIdentifier,
      teamIdentifier,
      serialNumber: generateSerialNumber(),
      organizationName: payload.organizationName,
      description: `${payload.customerFirstName} ${payload.customerLastName} - Loyalty Card`,
      webServiceURL: baseURL,
      authenticationToken: generateAuthenticationToken(),
      logoText: `${payload.organizationName} Rewards`,
      labelColor: payload.labelColor || 'rgb(100, 100, 100)',
      foregroundColor: payload.foregroundColor || 'rgb(0, 0, 0)',
      backgroundColor: payload.backgroundColor || 'rgb(255, 255, 255)',

      // Loyalty card structure
      storeCard: {
        primaryFields: [
          {
            key: 'loyaltyId',
            label: 'Loyalty ID',
            value: payload.loyaltyId,
            textAlignment: 'PKTextAlignmentLeft',
          },
        ],
        secondaryFields: [
          {
            key: 'tier',
            label: 'Status',
            value: payload.tier.charAt(0).toUpperCase() + payload.tier.slice(1),
          },
          {
            key: 'name',
            label: 'Member',
            value: `${payload.customerFirstName} ${payload.customerLastName}`,
          },
        ],
        auxiliaryFields: [
          {
            key: 'points',
            label: 'Points',
            value: payload.points.toString(),
            textAlignment: 'PKTextAlignmentRight',
          },
        ],
        backFields: [
          {
            key: 'loyalty_terms',
            label: 'Terms',
            value: 'Visit our website for complete loyalty program terms and conditions.',
          },
        ],
        barcode: {
          format: 'PKBarcodeFormatQR',
          message: payload.qrValue,
          messageEncoding: 'iso-8859-1',
          altText: payload.qrValue,
        },
      },
    };
  }

  /**
   * Generate a complete pass for a loyalty card
   */
  async generatePass(payload: PassGenerationPayload) {
    try {
      logger.info(`📝 Generating pass for customer: ${payload.customerId}`);

      const passJson = this.generatePassJson(payload);
      const serialNumber = passJson.serialNumber;
      const authenticationToken = passJson.authenticationToken;

      logger.info(`  Serial Number: ${serialNumber}`);
      logger.info(`  Authentication Token: ${authenticationToken.substring(0, 16)}...`);

      // Sign the pass
      const signingResult = await this.signingService.sign(passJson, {
        teamIdentifier: passJson.teamIdentifier,
        passTypeIdentifier: passJson.passTypeIdentifier,
        organizationName: passJson.organizationName,
        serialNumber,
        description: passJson.description,
      });

      // Store pass metadata in database
      const walletPass = await walletPassRepository.create({
        loyaltyCardId: payload.loyaltyCardId,
        serialNumber,
        passTypeIdentifier: passJson.passTypeIdentifier,
        teamIdentifier: passJson.teamIdentifier,
        organizationName: payload.organizationName,
        description: passJson.description,
        authenticationToken,
        webServiceURL: passJson.webServiceURL,
        backgroundColor: payload.backgroundColor,
        foregroundColor: payload.foregroundColor,
        labelColor: payload.labelColor,
      });

      logger.info(`✅ Pass generated successfully. Wallet Pass ID: ${walletPass.id}`);

      return {
        walletPass,
        passJson,
        pkpassData: signingResult.pkpassData,
      };
    } catch (error) {
      logger.error('❌ Pass generation failed', error);
      throw error;
    }
  }

  /**
   * Regenerate a pass (e.g., when points are updated)
   */
  async regeneratePass(walletPassId: string, updatedPayload: Partial<PassGenerationPayload>) {
    try {
      logger.info(`🔄 Regenerating pass: ${walletPassId}`);

      const walletPass = await walletPassRepository.findById(walletPassId);
      if (!walletPass) {
        throw new Error('Wallet pass not found');
      }

      const card = walletPass.loyaltyCard;
      const customer = card.customer;

      const payload: PassGenerationPayload = {
        customerId: customer.id,
        loyaltyCardId: card.id,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        loyaltyId: card.loyaltyId,
        points: updatedPayload.points ?? card.points,
        tier: updatedPayload.tier ?? card.tier,
        qrValue: updatedPayload.qrValue ?? card.qrValue,
        organizationName: walletPass.organizationName,
        backgroundColor: walletPass.backgroundColor || undefined,
        foregroundColor: walletPass.foregroundColor || undefined,
        labelColor: walletPass.labelColor || undefined,
      };

      const passJson = this.generatePassJson(payload);
      const newSerialNumber = passJson.serialNumber;

      const signingResult = await this.signingService.sign(passJson, {
        teamIdentifier: walletPass.teamIdentifier,
        passTypeIdentifier: walletPass.passTypeIdentifier,
        organizationName: walletPass.organizationName,
        serialNumber: newSerialNumber,
        description: walletPass.description,
      });

      // Update wallet pass with new version
      const updatedPass = await walletPassRepository.update(walletPassId, {
        serialNumber: newSerialNumber,
        version: { increment: 1 },
        lastUpdatedAt: new Date(),
      });

      logger.info(`✅ Pass regenerated. New serial: ${newSerialNumber}`);

      return {
        walletPass: updatedPass,
        passJson,
        pkpassData: signingResult.pkpassData,
      };
    } catch (error) {
      logger.error('❌ Pass regeneration failed', error);
      throw error;
    }
  }
}

export const passGenerationService = new PassGenerationService();
