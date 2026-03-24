import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SocketGateway } from '@/common/socket/socket.gateway';

export interface CreateNotificationInput {
  receiverId: number;
  triggeredById?: number;
  projectId?: number;
  issueId?: number;
  type: string;
  title: string;
  message?: string;
  data?: any;
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: input,
      include: {
        triggeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Send real-time notification via Socket.io
    this.socketGateway.sendToUser(
      input.receiverId.toString(),
      'notification',
      notification,
    );

    return notification;
  }

  async findAllForUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { receiverId: userId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        triggeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        project: { select: { id: true, name: true, identifier: true } },
        issue: { select: { id: true, name: true, sequenceId: true } },
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, receiverId: userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { receiverId: userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
