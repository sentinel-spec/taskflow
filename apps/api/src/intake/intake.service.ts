import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class IntakeService {
  constructor(private prisma: PrismaService) {}

  async createIntake(projectId: number, name: string, description?: string) {
    return this.prisma.intake.create({
      data: { projectId, name, description },
    });
  }

  async findAllIntakes(projectId: number) {
    return this.prisma.intake.findMany({
      where: { projectId },
      include: {
        _count: { select: { issues: true } },
      },
    });
  }

  async createIntakeIssue(intakeId: number, issueId: number) {
    return this.prisma.intakeIssue.create({
      data: { intakeId, issueId },
    });
  }

  async findIntakeIssues(intakeId: number) {
    return this.prisma.intakeIssue.findMany({
      where: { intakeId },
      include: {
        issue: {
          include: {
            state: true,
            assignee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async updateStatus(id: number, status: number) {
    return this.prisma.intakeIssue.update({
      where: { id },
      data: { status },
    });
  }
}
