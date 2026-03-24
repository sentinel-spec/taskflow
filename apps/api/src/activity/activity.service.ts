import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface CreateActivityInput {
  issueId: number;
  projectId: number;
  actorId: number;
  verb: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateActivityInput) {
    return this.prisma.issueActivity.create({
      data: input,
    });
  }

  async findAllForIssue(issueId: number) {
    return this.prisma.issueActivity.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
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

  async findAllForProject(projectId: number) {
    return this.prisma.issueActivity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        issue: { select: { id: true, name: true, sequenceId: true } },
        actor: {
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
}
