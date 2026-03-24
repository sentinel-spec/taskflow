import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { IssueRelationType } from '@prisma/client';

@Injectable()
export class IssueDetailsService {
  constructor(private prisma: PrismaService) {}

  // Comments
  async addComment(issueId: number, actorId: number, content: any) {
    return this.prisma.issueComment.create({
      data: {
        issueId,
        actorId,
        commentHtml: content.html,
        commentJson: content.json,
        commentPlain: content.plain,
      },
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

  async findComments(issueId: number) {
    return this.prisma.issueComment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        reactions: true,
      },
    });
  }

  // Relations
  async addRelation(
    issueId: number,
    relatedIssueId: number,
    type: IssueRelationType,
  ) {
    return this.prisma.issueRelation.create({
      data: { issueId, relatedIssueId, type },
    });
  }

  async findRelations(issueId: number) {
    return this.prisma.issueRelation.findMany({
      where: { OR: [{ issueId }, { relatedIssueId: issueId }] },
      include: {
        issue: { select: { id: true, name: true, sequenceId: true } },
        relatedIssue: { select: { id: true, name: true, sequenceId: true } },
      },
    });
  }

  // Links
  async addLink(issueId: number, url: string, title?: string) {
    return this.prisma.issueLink.create({
      data: { issueId, url, title },
    });
  }

  async findLinks(issueId: number) {
    return this.prisma.issueLink.findMany({
      where: { issueId },
    });
  }

  // Reactions
  async toggleReaction(
    actorId: number,
    emoji: string,
    issueId?: number,
    commentId?: number,
  ) {
    const where = {
      actorId_issueId_emoji: issueId ? { actorId, issueId, emoji } : undefined,
      actorId_commentId_emoji: commentId
        ? { actorId, commentId, emoji }
        : undefined,
    };

    // This is a simplified toggle logic
    const existing = await this.prisma.issueReaction.findFirst({
      where: { actorId, emoji, issueId, commentId },
    });

    if (existing) {
      await this.prisma.issueReaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    } else {
      await this.prisma.issueReaction.create({
        data: { actorId, emoji, issueId, commentId },
      });
      return { reacted: true };
    }
  }
}
