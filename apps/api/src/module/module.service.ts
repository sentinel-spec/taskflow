import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: number, userId: number, dto: CreateModuleDto) {
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

    return this.prisma.module.create({
      data: {
        ...dto,
        projectId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      },
    });
  }

  async findAll(projectId: number) {
    return this.prisma.module.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { issues: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
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

    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  async update(id: number, dto: UpdateModuleDto) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.targetDate) data.targetDate = new Date(dto.targetDate);

    return this.prisma.module.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.prisma.module.delete({ where: { id } });
    return { success: true };
  }

  async addIssues(moduleId: number, issueIds: number[]) {
    await this.prisma.issue.updateMany({
      where: { id: { in: issueIds } },
      data: { moduleId },
    });
    return { success: true };
  }

  async removeIssue(issueId: number) {
    await this.prisma.issue.update({
      where: { id: issueId },
      data: { moduleId: null },
    });
    return { success: true };
  }
}
