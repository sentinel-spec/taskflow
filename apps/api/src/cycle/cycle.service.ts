import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Injectable()
export class CycleService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: number, userId: number, dto: CreateCycleDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return this.prisma.cycle.create({
      data: {
        ...dto,
        projectId,
        ownedById: userId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findAll(projectId: number) {
    return this.prisma.cycle.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const cycle = await this.prisma.cycle.findUnique({
      where: { id },
      include: {
        project: true,
        ownedBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        issues: {
          include: {
            state: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cycle) throw new NotFoundException('Cycle not found');
    return cycle;
  }

  async update(id: number, dto: UpdateCycleDto) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.cycle.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.prisma.cycle.delete({ where: { id } });
    return { success: true };
  }

  async addIssues(cycleId: number, issueIds: number[]) {
    await this.prisma.issue.updateMany({
      where: { id: { in: issueIds } },
      data: { cycleId },
    });
    return { success: true };
  }

  async removeIssue(issueId: number) {
    await this.prisma.issue.update({
      where: { id: issueId },
      data: { cycleId: null },
    });
    return { success: true };
  }
}
