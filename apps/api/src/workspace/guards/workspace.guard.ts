import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Slug or ID from params
    const slug = params.slug;
    const id = params.id ? parseInt(params.id) : null;

    if (!slug && !id) {
      return true; // If no workspace specified, let it pass (e.g. create workspace)
    }

    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspace: slug ? { slug } : { id: id! },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach workspace and membership to request for later use in controllers
    request.workspace = membership.workspace;
    request.workspaceMembership = membership;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.includes(membership.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient workspace permissions');
    }

    return true;
  }
}
