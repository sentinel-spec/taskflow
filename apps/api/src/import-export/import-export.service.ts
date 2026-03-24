import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ImportExportService {
  constructor(private prisma: PrismaService) {}

  async exportProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        states: true,
        estimates: {
          include: { points: true },
        },
        cycles: true,
        modules: true,
        pages: true,
        issues: {
          include: {
            activities: true,
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      project: {
        name: project.name,
        identifier: project.identifier,
        description: project.description,
        logoType: project.logoType,
        icon: project.icon,
        color: project.color,
        coverImage: project.coverImage,
        isPublic: project.isPublic,
      },
      states: project.states.map((s) => ({
        name: s.name,
        description: s.description,
        color: s.color,
        slug: s.slug,
        sequence: s.sequence,
        group: s.group,
        default: s.default,
      })),
      estimates: project.estimates.map((e) => ({
        name: e.name,
        description: e.description,
        points: e.points.map((p) => ({
          key: p.key,
          value: p.value,
          description: p.description,
        })),
      })),
      cycles: project.cycles.map((c) => ({
        name: c.name,
        description: c.description,
        startDate: c.startDate,
        endDate: c.endDate,
      })),
      modules: project.modules.map((m) => ({
        name: m.name,
        description: m.description,
        startDate: m.startDate,
        targetDate: m.targetDate,
        status: m.status,
      })),
      pages: project.pages.map((p) => ({
        name: p.name,
        descriptionJson: p.descriptionJson,
        descriptionHtml: p.descriptionHtml,
        descriptionPlain: p.descriptionPlain,
        color: p.color,
        isPublic: p.isPublic,
      })),
      issues: project.issues.map((i) => ({
        name: i.name,
        description: i.description,
        priority: i.priority,
        sequenceId: i.sequenceId,
        sortOrder: i.sortOrder,
        startDate: i.startDate,
        dueDate: i.dueDate,
        // We'll need to map these back during import based on names
        stateName: project.states.find((s) => s.id === i.stateId)?.name,
      })),
    };
  }

  async importProject(workspaceId: number, userId: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Project
      const project = await tx.project.create({
        data: {
          ...data.project,
          workspaceId,
          members: {
            create: { userId },
          },
        },
      });

      // 2. Create States
      const stateMap = new Map<string, number>();
      for (const s of data.states) {
        const state = await tx.state.create({
          data: { ...s, projectId: project.id },
        });
        stateMap.set(s.name, state.id);
      }

      // 3. Create Estimates
      for (const e of data.estimates) {
        await tx.estimate.create({
          data: {
            name: e.name,
            description: e.description,
            projectId: project.id,
            points: {
              create: e.points,
            },
          },
        });
      }

      // 4. Create Cycles
      for (const c of data.cycles) {
        await tx.cycle.create({
          data: { ...c, projectId: project.id, ownedById: userId },
        });
      }

      // 5. Create Modules
      for (const m of data.modules) {
        await tx.module.create({
          data: { ...m, projectId: project.id },
        });
      }

      // 6. Create Pages
      for (const p of data.pages) {
        await tx.page.create({
          data: { ...p, projectId: project.id, ownedById: userId },
        });
      }

      // 7. Create Issues
      for (const i of data.issues) {
        const { stateName, ...issueData } = i;
        await tx.issue.create({
          data: {
            ...issueData,
            projectId: project.id,
            createdById: userId,
            stateId:
              stateMap.get(stateName) || Array.from(stateMap.values())[0],
          },
        });
      }

      return project;
    });
  }
}
