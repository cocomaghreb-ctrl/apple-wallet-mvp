import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeviceRegistrationRepository {
  async findById(id: string) {
    return prisma.deviceRegistration.findUnique({
      where: { id },
    });
  }

  async findByDeviceAndPass(walletPassId: string, deviceLibraryIdentifier: string) {
    return prisma.deviceRegistration.findUnique({
      where: {
        walletPassId_deviceLibraryIdentifier: {
          walletPassId,
          deviceLibraryIdentifier,
        },
      },
    });
  }

  async findByWalletPass(walletPassId: string) {
    return prisma.deviceRegistration.findMany({
      where: { walletPassId },
    });
  }

  async findUpdatedSince(walletPassId: string, since: Date) {
    return prisma.deviceRegistration.findMany({
      where: {
        walletPassId,
        updatedAt: {
          gte: since,
        },
      },
    });
  }

  async create(data: any) {
    return prisma.deviceRegistration.create({
      data,
    });
  }

  async delete(walletPassId: string, deviceLibraryIdentifier: string) {
    return prisma.deviceRegistration.delete({
      where: {
        walletPassId_deviceLibraryIdentifier: {
          walletPassId,
          deviceLibraryIdentifier,
        },
      },
    });
  }
}

export const deviceRegistrationRepository = new DeviceRegistrationRepository();
