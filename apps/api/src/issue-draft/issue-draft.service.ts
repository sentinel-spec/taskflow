import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIssueDraftDto } from './dto/create-issue-draft.dto';

@Injectable()
export class IssueDraftService {
  constructor(private prisma: PrismaService) {}

  async upsert(projectId: number, userId: number, dto: CreateIssueDraftDto) {
    const draft = await this.prisma.issueDraft.findFirst({
      where: { projectId, createdById: userId },
    });

    if (draft) {
      return this.prisma.issueDraft.update({
        where: { id: draft.id },
        data: dto,
      });
    }

    return this.prisma.issueDraft.create({
      data: {
        ...dto,
        projectId,
        createdById: userId,
      },
    });
  }

  async findForUser(projectId: number, userId: number) {
    return this.prisma.issueDraft.findFirst({
      where: { projectId, createdById: userId },
      include: {
        state: true,
      },
    });
  }

  async remove(projectId: number, userId: number) {
    const draft = await this.prisma.issueDraft.findFirst({
      where: { projectId, createdById: userId },
    });

    if (draft) {
      await this.prisma.issueDraft.delete({ where: { id: draft.id } });
    }
    return { success: true };
  }
}
