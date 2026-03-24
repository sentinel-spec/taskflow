import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Project,
  type WorkspaceInvitation,
  WorkspaceRole,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { UserPayload } from '@/auth/decorators/current-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteWorkspaceMembersDto } from './dto/invite-workspace-members.dto';
import { JoinWorkspaceInvitationDto } from './dto/join-workspace-invitation.dto';
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

  private serializeInvitation(
    invitation: WorkspaceInvitation & {
      workspace: {
        id: number;
        name: string;
        slug: string;
        logoUrl: string | null;
      };
    },
  ) {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      accepted: invitation.accepted,
      responded_at: invitation.respondedAt,
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name,
        slug: invitation.workspace.slug,
        logo_url: invitation.workspace.logoUrl,
      },
    };
  }

  async userWorkspaceInvitations(userEmail: string) {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: {
        email: userEmail,
        respondedAt: null,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map((invitation) =>
      this.serializeInvitation(invitation),
    );
  }

  async listMembersBySlug(workspaceSlug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: workspace.id,
      },
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return members.map((member) => ({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user,
    }));
  }

  async inviteMembersToWorkspace(
    workspaceSlug: string,
    user: UserPayload,
    dto: InviteWorkspaceMembersDto,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const uniqueEmails = Array.from(
      new Set(
        dto.emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
      ),
    );
    const role = dto.role ?? WorkspaceRole.MEMBER;

    const createdInvitations: Array<{
      id: string;
      email: string;
      role: WorkspaceRole;
      token: string | null;
    }> = [];

    for (const email of uniqueEmails) {
      const invitation = await this.prisma.workspaceInvitation.upsert({
        where: {
          workspaceId_email: {
            workspaceId: workspace.id,
            email,
          },
        },
        update: {
          role,
          token: randomUUID(),
          accepted: false,
          respondedAt: null,
        },
        create: {
          workspaceId: workspace.id,
          email,
          role,
          token: randomUUID(),
          accepted: false,
        },
        select: {
          id: true,
          email: true,
          role: true,
          token: true,
        },
      });

      createdInvitations.push(invitation);
    }

    return {
      invitedBy: user.email,
      workspace: {
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
      },
      invitations: createdInvitations.map((invitation) => ({
        ...invitation,
        invitationUrl: `/workspace-invitations/?invitation_id=${invitation.id}&slug=${workspace.slug}&token=${invitation.token}`,
      })),
    };
  }

  async getWorkspaceInvitation(workspaceSlug: string, invitationId: string) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        workspace: {
          slug: workspaceSlug,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.serializeInvitation(invitation);
  }

  async joinWorkspaceInvitation(
    workspaceSlug: string,
    invitationId: string,
    body: JoinWorkspaceInvitationDto,
  ) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        workspace: {
          slug: workspaceSlug,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.respondedAt) {
      return this.serializeInvitation(invitation);
    }

    const hasToken = Boolean(body.token);
    if (!hasToken || invitation.token !== body.token) {
      throw new ForbiddenException('Invalid invitation token');
    }

    if (body.accepted) {
      const invitee = await this.prisma.user.findUnique({
        where: {
          email: invitation.email,
        },
        select: {
          id: true,
        },
      });

      if (!invitee) {
        throw new BadRequestException(
          'Please create an account with invited email before accepting',
        );
      }

      await this.prisma.workspaceMember.upsert({
        where: {
          userId_workspaceId: {
            userId: invitee.id,
            workspaceId: invitation.workspaceId,
          },
        },
        update: {
          role: invitation.role,
        },
        create: {
          userId: invitee.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });
    }

    const updated = await this.prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        accepted: body.accepted,
        respondedAt: new Date(),
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    return this.serializeInvitation(updated);
  }

  async joinWorkspaces(user: UserPayload, invitationIds: string[]) {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: {
        id: {
          in: invitationIds,
        },
        email: user.email,
        respondedAt: null,
      },
    });

    if (invitations.length === 0) {
      return { joined: 0 };
    }

    await this.prisma.$transaction(async (tx) => {
      for (const invitation of invitations) {
        await tx.workspaceMember.upsert({
          where: {
            userId_workspaceId: {
              userId: user.id,
              workspaceId: invitation.workspaceId,
            },
          },
          update: {
            role: invitation.role,
          },
          create: {
            userId: user.id,
            workspaceId: invitation.workspaceId,
            role: invitation.role,
          },
        });
      }

      await tx.workspaceInvitation.updateMany({
        where: {
          id: {
            in: invitations.map((invitation) => invitation.id),
          },
        },
        data: {
          accepted: true,
          respondedAt: new Date(),
        },
      });
    });

    return { joined: invitations.length };
  }

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
