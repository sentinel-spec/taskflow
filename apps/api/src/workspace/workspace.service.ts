import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project, WorkspaceRole } from '@prisma/client';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

type LogoProps = {
  in_use?: 'emoji' | 'icon' | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

const DEFAULT_ICON_COLOR = '#6d7b8a';

function mapLogoProps(project: Project): LogoProps {
  if (project.logoType === 'emoji' && project.icon) {
    return {
      in_use: 'emoji',
      emoji: { value: project.icon },
    };
  }

  if (project.logoType === 'icon' && project.icon) {
    return {
      in_use: 'icon',
      icon: {
        name: project.icon,
        color: project.color || DEFAULT_ICON_COLOR,
      },
    };
  }

  return { in_use: null };
}

function attachLogoProps(project: Project) {
  return {
    ...project,
    logo_props: mapLogoProps(project),
  };
}

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkSlug(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
    });
    return {
      available: !workspace,
      slug,
    };
  }

  async create(userId: number, createWorkspaceDto: CreateWorkspaceDto) {
    const { name, slug, description, teamSize, useCase, coverImage } =
      createWorkspaceDto;

    const existingWorkspace = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      throw new ConflictException('Workspace with this slug already exists');
    }

    return this.prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        teamSize,
        useCase,
        coverImage,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAllForUser(userId: number) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        projects: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return {
      ...workspace,
      projects: workspace.projects?.map((project) => attachLogoProps(project)),
    };
  }

  async findBySlug(slug: string, userId: number) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        slug,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        projects: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace not found or access denied`);
    }

    return {
      ...workspace,
      projects: workspace.projects?.map((project) => attachLogoProps(project)),
    };
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });
  }

  async leave(workspaceId: number, userId: number) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      include: {
        workspace: {
          include: {
            members: {
              where: { role: WorkspaceRole.OWNER },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Check if user is the only owner
    if (
      membership.role === WorkspaceRole.OWNER &&
      membership.workspace.members.length === 1
    ) {
      throw new ConflictException(
        'You are the only owner of this workspace. Transfer ownership or delete the workspace before leaving.',
      );
    }

    // Check if user is the last member of the workspace
    const allMembers = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
    });

    if (allMembers.length === 1) {
      throw new ConflictException(
        'You are the only member of this workspace. Delete the workspace instead of leaving.',
      );
    }

    await this.prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return { success: true, message: 'You have left the workspace' };
  }

  async remove(id: number) {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  /**
   * Generate next project identifier for a workspace
   * Format: PROJ-00001, PROJ-00002, etc.
   */
  async generateNextProjectIdentifier(workspaceId: number): Promise<string> {
    const prefix = 'PROJ';

    // Get all projects in the workspace to find the highest identifier
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { identifier: true },
      orderBy: { id: 'asc' },
    });

    if (projects.length === 0) {
      return `${prefix}-00001`;
    }

    // Find the highest number in the sequence
    let maxNumber = 0;
    for (const project of projects) {
      const match = project.identifier.match(/^PROJ-(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    return `${prefix}-${paddedNumber}`;
  }
}
