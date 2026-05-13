import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WalletPassRepository {
  async findById(id: string) {
    return prisma.walletPass.findUnique({
      where: { id },
      include: {
        loyaltyCard: {
          include: {
            customer: true,
          },
        },
        deviceRegistrations: true,
      },
    });
  }

  async findBySerialNumber(serialNumber: string) {
    return prisma.walletPass.findUnique({
      where: { serialNumber },
      include: {
        loyaltyCard: {
          include: {
            customer: true,
          },
        },
        deviceRegistrations: true,
      },
    });
  }

  async findByLoyaltyCardId(loyaltyCardId: string) {
    return prisma.walletPass.findUnique({
      where: { loyaltyCardId },
      include: {
        loyaltyCard: true,
        deviceRegistrations: true,
      },
    });
  }

  async create(data: any) {
    return prisma.walletPass.create({
      data,
      include: {
        loyaltyCard: true,
        deviceRegistrations: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.walletPass.update({
      where: { id },
      data,
      include: {
        loyaltyCard: true,
        deviceRegistrations: true,
      },
    });
  }
}

export const walletPassRepository = new WalletPassRepository();
