import { PrismaClient } from '@prisma/client';
import type { CreateLoyaltyCardInput, UpdateLoyaltyCardInput } from '@apple-wallet/shared';

const prisma = new PrismaClient();

export class LoyaltyCardRepository {
  async findById(id: string) {
    return prisma.loyaltyCard.findUnique({
      where: { id },
      include: {
        customer: true,
        walletPass: true,
      },
    });
  }

  async findByLoyaltyId(loyaltyId: string) {
    return prisma.loyaltyCard.findUnique({
      where: { loyaltyId },
      include: {
        customer: true,
        walletPass: true,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 10) {
    return prisma.loyaltyCard.findMany({
      skip,
      take,
      include: {
        customer: true,
        walletPass: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateLoyaltyCardInput) {
    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    });

    return prisma.loyaltyCard.create({
      data: {
        customerId: customer.id,
        loyaltyId: data.loyaltyId,
        tier: data.tier,
        points: data.points,
        qrValue: data.qrValue,
      },
      include: {
        customer: true,
      },
    });
  }

  async update(id: string, data: UpdateLoyaltyCardInput) {
    return prisma.loyaltyCard.update({
      where: { id },
      data,
      include: {
        customer: true,
        walletPass: true,
      },
    });
  }

  async addPoints(id: string, points: number, reason: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new Error('Loyalty card not found');
    }

    const newPoints = Math.max(0, card.points + points);

    await prisma.pointTransaction.create({
      data: {
        loyaltyCardId: id,
        customerId: card.customerId,
        points,
        reason,
      },
    });

    return prisma.loyaltyCard.update({
      where: { id },
      data: {
        points: newPoints,
        totalPointsEarned:
          points > 0 ? card.totalPointsEarned + points : card.totalPointsEarned,
        totalPointsSpent:
          points < 0 ? card.totalPointsSpent + -points : card.totalPointsSpent,
      },
      include: {
        customer: true,
        walletPass: true,
      },
    });
  }
}

export const loyaltyCardRepository = new LoyaltyCardRepository();
