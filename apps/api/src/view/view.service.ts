import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ViewService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: number, userId: number, data: any) {
    return this.prisma.issueView.create({
      data: {
        ...data,
        projectId,
        ownedById: userId,
      },
    });
  }

  async findAll(projectId: number) {
    return this.prisma.issueView.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        ownedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const view = await this.prisma.issueView.findUnique({
      where: { id },
    });
    if (!view) throw new NotFoundException('View not found');
    return view;
  }

  async update(id: number, data: any) {
    return this.prisma.issueView.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.prisma.issueView.delete({ where: { id } });
    return { success: true };
  }
}
