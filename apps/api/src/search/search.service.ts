import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(workspaceId: number, query: string) {
    const [issues, projects, pages] = await Promise.all([
      this.prisma.issue.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: { project: { select: { identifier: true } } },
      }),
      this.prisma.project.findMany({
        where: {
          workspaceId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { identifier: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.page.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { descriptionPlain: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    return {
      issues: issues.map((i) => ({
        id: i.id,
        type: 'issue',
        title: i.name,
        key: `${i.project.identifier}-${i.sequenceId}`,
      })),
      projects: projects.map((p) => ({
        id: p.id,
        type: 'project',
        title: p.name,
        key: p.identifier,
      })),
      pages: pages.map((p) => ({
        id: p.id,
        type: 'page',
        title: p.name,
      })),
    };
  }
}
