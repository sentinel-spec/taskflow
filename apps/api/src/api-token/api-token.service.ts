import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiTokenService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, label: string, description?: string) {
    const token = `ss_at_${randomBytes(24).toString('hex')}`;
    return this.prisma.apiToken.create({
      data: {
        userId,
        label,
        description,
        token,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.apiToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        description: true,
        isActive: true,
        lastUsedAt: true,
        expiredAt: true,
        createdAt: true,
        // We never return the full token after creation for security
        token: false,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.prisma.apiToken.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  async validateToken(token: string) {
    const apiToken = await this.prisma.apiToken.findUnique({
      where: { token, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roles: true,
            isActive: true,
          },
        },
      },
    });

    if (!apiToken || !apiToken.user.isActive) {
      return null;
    }

    // Check expiration if set
    if (apiToken.expiredAt && apiToken.expiredAt < new Date()) {
      return null;
    }

    // Update last used at (background)
    this.prisma.apiToken
      .update({
        where: { id: apiToken.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return apiToken.user;
  }
}
