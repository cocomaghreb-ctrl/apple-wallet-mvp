import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UpdateLogRepository {
  async create(data: any) {
    return prisma.updateLog.create({
      data,
    });
  }

  async findByWalletPass(walletPassId: string, limit: number = 20) {
    return prisma.updateLog.findMany({
      where: { walletPassId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByLoyaltyCard(loyaltyCardId: string, limit: number = 20) {
    return prisma.updateLog.findMany({
      where: { loyaltyCardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const updateLogRepository = new UpdateLogRepository();
