import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export class AdminUserRepository {
  async findByEmail(email: string) {
    return prisma.adminUser.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  }

  async create(email: string, password: string, name: string) {
    const hashedPassword = await bcryptjs.hash(password, 10);

    return prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcryptjs.compare(password, hashedPassword);
  }
}

export const adminUserRepository = new AdminUserRepository();
