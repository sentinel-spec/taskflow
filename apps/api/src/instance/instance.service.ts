import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InstanceService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async findAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        roles: true,
        createdAt: true,
        _count: {
          select: { workspaces: true },
        },
      },
    });
  }

  async updateUserStatus(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  // Workspace Management
  async findAllWorkspaces() {
    return this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    });
  }

  async deleteWorkspace(id: number) {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  // System Health / Stats
  async getInstanceStats() {
    const [userCount, workspaceCount, issueCount, projectCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.workspace.count(),
        this.prisma.issue.count(),
        this.prisma.project.count(),
      ]);

    return {
      users: userCount,
      workspaces: workspaceCount,
      projects: projectCount,
      issues: issueCount,
    };
  }
}
