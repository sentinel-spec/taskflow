import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProjectStats(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, identifier: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    const [totalIssues, issuesByState, issuesByPriority, issuesByAssignee] =
      await Promise.all([
        this.prisma.issue.count({ where: { projectId } }),
        this.prisma.issue.groupBy({
          by: ['stateId'],
          where: { projectId },
          _count: true,
        }),
        this.prisma.issue.groupBy({
          by: ['priority'],
          where: { projectId },
          _count: true,
        }),
        this.prisma.issue.groupBy({
          by: ['assigneeId'],
          where: { projectId },
          _count: true,
        }),
      ]);

    // Fetch state names for better output
    const states = await this.prisma.state.findMany({
      where: { projectId },
      select: { id: true, name: true, color: true },
    });

    const stateStats = issuesByState.map((group) => ({
      state: states.find((s) => s.id === group.stateId)?.name || 'Unknown',
      color: states.find((s) => s.id === group.stateId)?.color,
      count: group._count,
    }));

    return {
      project,
      totalIssues,
      stateStats,
      priorityStats: issuesByPriority.map((group) => ({
        priority: group.priority,
        count: group._count,
      })),
      assigneeStats: issuesByAssignee.map((group) => ({
        assigneeId: group.assigneeId,
        count: group._count,
      })),
    };
  }

  async getWorkspaceStats(workspaceId: number) {
    const [totalProjects, totalIssues, totalMembers] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.issue.count({ where: { project: { workspaceId } } }),
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
    ]);

    return {
      totalProjects,
      totalIssues,
      totalMembers,
    };
  }
}
