import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { ActivityService } from '@/activity/activity.service';
import { NotificationService } from '@/notification/notification.service';
import { WebhookService, WebhookEvent } from '@/webhook/webhook.service';

@Injectable()
export class IssueService {
  constructor(
    private prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
    private readonly webhookService: WebhookService,
  ) {}

  async create(projectId: number, userId: number, dto: CreateIssueDto) {
    // Verify project and membership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    // Generate sequence ID
    const lastIssue = await this.prisma.issue.findFirst({
      where: { projectId },
      orderBy: { sequenceId: 'desc' },
      select: { sequenceId: true },
    });

    const sequenceId = (lastIssue?.sequenceId || 0) + 1;

    const issue = await this.prisma.issue.create({
      data: {
        ...dto,
        projectId,
        createdById: userId,
        sequenceId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        state: true,
        cycle: true,
        module: true,
        estimate: true,
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log activity
    await this.activityService.create({
      issueId: issue.id,
      projectId: issue.projectId,
      actorId: userId,
      verb: 'created',
    });

    // Notify assignee
    if (issue.assigneeId && issue.assigneeId !== userId) {
      await this.notificationService.create({
        receiverId: issue.assigneeId,
        triggeredById: userId,
        projectId: issue.projectId,
        issueId: issue.id,
        type: 'ISSUE_ASSIGNED',
        title: 'New issue assigned to you',
        message: `Issue "${issue.name}" has been assigned to you.`,
      });
    }

    // Trigger Webhook
    this.webhookService.trigger(
      project.workspaceId,
      WebhookEvent.ISSUE_CREATED,
      issue,
    );

    return issue;
  }

  async findAll(projectId: number) {
    return this.prisma.issue.findMany({
      where: { projectId },
      orderBy: { sequenceId: 'desc' },
      include: {
        state: true,
        cycle: true,
        module: true,
        estimate: true,
        assignee: {
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
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        state: true,
        project: true,
        cycle: true,
        module: true,
        estimate: true,
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async update(id: number, dto: UpdateIssueDto, userId: number) {
    const oldIssue = await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data,
      include: {
        state: true,
        cycle: true,
        module: true,
        estimate: true,
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Track changes
    const trackedFields = [
      'name',
      'description',
      'priority',
      'stateId',
      'assigneeId',
      'cycleId',
      'moduleId',
    ];

    for (const field of trackedFields) {
      if (dto[field] !== undefined && dto[field] !== (oldIssue as any)[field]) {
        await this.activityService.create({
          issueId: updatedIssue.id,
          projectId: updatedIssue.projectId,
          actorId: userId,
          verb: 'updated',
          field,
          oldValue: String((oldIssue as any)[field] || ''),
          newValue: String((updatedIssue as any)[field] || ''),
        });

        // Notify new assignee
        if (
          field === 'assigneeId' &&
          dto.assigneeId &&
          dto.assigneeId !== userId
        ) {
          await this.notificationService.create({
            receiverId: dto.assigneeId,
            triggeredById: userId,
            projectId: updatedIssue.projectId,
            issueId: updatedIssue.id,
            type: 'ISSUE_ASSIGNED',
            title: 'Issue assigned to you',
            message: `Issue "${updatedIssue.name}" has been assigned to you.`,
          });
        }
      }
    }

    // Trigger Webhook
    const project = await this.prisma.project.findUnique({
      where: { id: updatedIssue.projectId },
      select: { workspaceId: true },
    });
    if (project) {
      this.webhookService.trigger(
        project.workspaceId,
        WebhookEvent.ISSUE_UPDATED,
        updatedIssue,
      );
    }

    return updatedIssue;
  }

  async remove(id: number) {
    await this.prisma.issue.delete({ where: { id } });
    return { success: true };
  }
}
