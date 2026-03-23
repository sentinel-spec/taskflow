import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { JoinWorkspaceInvitationDto } from './dto/join-workspace-invitation.dto';
import { JoinWorkspacesDto } from './dto/join-workspaces.dto';
import { WorkspaceService } from './workspace.service';

@Controller()
export class WorkspaceInvitationController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('users/me/workspaces/invitations')
  @UseGuards(JwtAuthGuard)
  userWorkspaceInvitations(@CurrentUser() user: UserPayload) {
    return this.workspaceService.userWorkspaceInvitations(user.email);
  }

  @Post('users/me/workspaces/invitations')
  @UseGuards(JwtAuthGuard)
  joinWorkspaces(
    @CurrentUser() user: UserPayload,
    @Body() body: JoinWorkspacesDto,
  ) {
    return this.workspaceService.joinWorkspaces(user, body.invitations);
  }

  @Get('workspace/:slug/invitations/:id/join')
  getWorkspaceInvitation(
    @Param('slug') slug: string,
    @Param('id') invitationId: string,
  ) {
    return this.workspaceService.getWorkspaceInvitation(slug, invitationId);
  }

  @Post('workspace/:slug/invitations/:id/join')
  joinWorkspaceInvitation(
    @Param('slug') slug: string,
    @Param('id') invitationId: string,
    @Body() body: JoinWorkspaceInvitationDto,
  ) {
    return this.workspaceService.joinWorkspaceInvitation(
      slug,
      invitationId,
      body,
    );
  }
}
