import { logger } from '../utils/logger';
import { loyaltyCardRepository } from '../repositories/loyaltyCard.repo';
import { updateLogRepository } from '../repositories/updateLog.repo';
import { passGenerationService } from './passGenerationService';
import { applePushNotificationService } from './applePushNotificationService';
import type { UpdateLoyaltyCardInput } from '@apple-wallet/shared';

export class LoyaltyCardService {
  /**
   * Create a new loyalty card with associated Apple Wallet pass
   */
  async createCard(data: any) {
    try {
      logger.info(`✅ Creating loyalty card for ${data.email}`);

      const card = await loyaltyCardRepository.create(data);

      // Generate Apple Wallet pass
      const passResult = await passGenerationService.generatePass({
        customerId: card.customerId,
        loyaltyCardId: card.id,
        customerFirstName: card.customer.firstName,
        customerLastName: card.customer.lastName,
        loyaltyId: card.loyaltyId,
        points: card.points,
        tier: card.tier,
        qrValue: card.qrValue,
        organizationName: data.organizationName,
        backgroundColor: data.backgroundColor,
        foregroundColor: data.foregroundColor,
        labelColor: data.labelColor,
      });

      logger.info(`✅ Loyalty card created: ${card.id}`);

      return {
        card,
        walletPass: passResult.walletPass,
      };
    } catch (error) {
      logger.error('❌ Failed to create loyalty card', error);
      throw error;
    }
  }

  /**
   * Update loyalty card and regenerate pass if needed
   */
  async updateCard(cardId: string, data: UpdateLoyaltyCardInput, adminEmail?: string) {
    try {
      logger.info(`🔄 Updating loyalty card: ${cardId}`);

      const card = await loyaltyCardRepository.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      const oldValues = {
        points: card.points,
        tier: card.tier,
        active: card.active,
      };

      const updatedCard = await loyaltyCardRepository.update(cardId, data);

      // Log the update
      await updateLogRepository.create({
        walletPassId: card.walletPass?.id,
        loyaltyCardId: cardId,
        action: 'card_updated',
        oldValue: JSON.stringify(oldValues),
        newValue: JSON.stringify({
          points: updatedCard.points,
          tier: updatedCard.tier,
          active: updatedCard.active,
        }),
        adminEmail,
      });

      // If points or tier changed, regenerate pass
      if ((data.points !== undefined && data.points !== oldValues.points) ||
          (data.tier !== undefined && data.tier !== oldValues.tier)) {
        logger.info(`  Points/tier changed, regenerating pass`);
        
        if (card.walletPass) {
          await passGenerationService.regeneratePass(card.walletPass.id, {
            points: updatedCard.points,
            tier: updatedCard.tier,
          });

          // Notify devices about the update
          await applePushNotificationService.notifyPassUpdated(card.walletPass.id);
        }
      }

      logger.info(`✅ Card updated successfully`);
      return updatedCard;
    } catch (error) {
      logger.error('❌ Failed to update loyalty card', error);
      throw error;
    }
  }

  /**
   * Add points to a card
   */
  async addPoints(cardId: string, points: number, reason: string, adminEmail?: string) {
    try {
      logger.info(`➕ Adding ${points} points to card: ${cardId} (reason: ${reason})`);

      const card = await loyaltyCardRepository.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      const oldPoints = card.points;
      const updatedCard = await loyaltyCardRepository.addPoints(cardId, points, reason);

      // Log the transaction
      await updateLogRepository.create({
        walletPassId: card.walletPass?.id,
        loyaltyCardId: cardId,
        action: 'points_updated',
        oldValue: JSON.stringify({ points: oldPoints }),
        newValue: JSON.stringify({ points: updatedCard.points }),
        adminEmail,
      });

      // Regenerate and notify
      if (card.walletPass) {
        await passGenerationService.regeneratePass(card.walletPass.id, {
          points: updatedCard.points,
        });

        await applePushNotificationService.notifyPassUpdated(card.walletPass.id);
      }

      logger.info(`✅ Points added. New balance: ${updatedCard.points}`);
      return updatedCard;
    } catch (error) {
      logger.error('❌ Failed to add points', error);
      throw error;
    }
  }
}

export const loyaltyCardService = new LoyaltyCardService();
