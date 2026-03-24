import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LabelService {
  constructor(private prisma: PrismaService) {}

  async create(
    projectId: number,
    name: string,
    color?: string,
    description?: string,
  ) {
    return this.prisma.label.create({
      data: { projectId, name, color, description },
    });
  }

  async findAll(projectId: number) {
    return this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: number) {
    await this.prisma.label.delete({ where: { id } });
    return { success: true };
  }

  async attachToIssue(issueId: number, labelId: number) {
    return this.prisma.issue.update({
      where: { id: issueId },
      data: {
        labels: { connect: { id: labelId } },
      },
      include: { labels: true },
    });
  }

  async detachFromIssue(issueId: number, labelId: number) {
    return this.prisma.issue.update({
      where: { id: issueId },
      data: {
        labels: { disconnect: { id: labelId } },
      },
      include: { labels: true },
    });
  }
}
