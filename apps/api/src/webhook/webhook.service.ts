import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import axios from 'axios';
import { randomBytes, createHmac } from 'crypto';

export enum WebhookEvent {
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',
  ISSUE_CREATED = 'issue.created',
  ISSUE_UPDATED = 'issue.updated',
  ISSUE_DELETED = 'issue.deleted',
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  async create(workspaceId: number, url: string) {
    const secretKey = `wh_sec_${randomBytes(16).toString('hex')}`;
    return this.prisma.webhook.create({
      data: {
        workspaceId,
        url,
        secretKey,
      },
    });
  }

  async findAll(workspaceId: number) {
    return this.prisma.webhook.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    await this.prisma.webhook.delete({ where: { id } });
    return { success: true };
  }

  async trigger(workspaceId: number, event: WebhookEvent, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { workspaceId, isActive: true },
    });

    for (const webhook of webhooks) {
      // Filter events
      if (event.startsWith('project') && !webhook.sendProjectEvents) continue;
      if (event.startsWith('issue') && !webhook.sendIssueEvents) continue;

      this.sendWebhook(webhook, event, payload).catch((err) => {
        this.logger.error(
          `Failed to send webhook ${webhook.id}: ${err.message}`,
        );
      });
    }
  }

  private async sendWebhook(webhook: any, event: string, payload: any) {
    const timestamp = Date.now();
    const body = JSON.stringify({
      event,
      timestamp,
      payload,
    });

    const signature = createHmac('sha256', webhook.secretKey)
      .update(body)
      .digest('hex');

    try {
      const response = await axios.post(webhook.url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Sensata-Signature': signature,
          'X-Sensata-Event': event,
        },
        timeout: 5000,
      });

      await this.logWebhook(
        webhook.id,
        event,
        webhook.url,
        body,
        response.status,
        JSON.stringify(response.data),
      );
    } catch (error) {
      const status = error.response?.status || 500;
      const responseBody = JSON.stringify(
        error.response?.data || error.message,
      );
      await this.logWebhook(
        webhook.id,
        event,
        webhook.url,
        body,
        status,
        responseBody,
      );
      throw error;
    }
  }

  private async logWebhook(
    webhookId: number,
    eventType: string,
    url: string,
    requestBody: string,
    responseStatus: number,
    responseBody: string,
  ) {
    await this.prisma.webhookLog.create({
      data: {
        webhookId,
        eventType,
        url,
        requestBody: JSON.parse(requestBody),
        responseStatus,
        responseBody,
      },
    });
  }
}
