import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';
import { WorkspaceGuard } from './guards/workspace.guard';
import { WorkspaceRoles } from './decorators/workspace-roles.decorator';
import { WorkspaceRole } from '@prisma/client';
import { InviteWorkspaceMembersDto } from './dto/invite-workspace-members.dto';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('check-slug/:slug')
  checkSlug(@Param('slug') slug: string) {
    return this.workspaceService.checkSlug(slug);
  }

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(user.id, createWorkspaceDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.workspaceService.findAllForUser(user.id);
  }

  @Get(':slug')
  @UseGuards(WorkspaceGuard)
  findOne(@Param('slug') slug: string, @CurrentUser() user: UserPayload) {
    return this.workspaceService.findBySlug(slug, user.id);
  }

  @Get(':slug/members')
  @UseGuards(WorkspaceGuard)
  getMembers(@Param('slug') slug: string) {
    return this.workspaceService.listMembersBySlug(slug);
  }

  @Post(':slug/invitations')
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  inviteMembers(
    @Param('slug') slug: string,
    @CurrentUser() user: UserPayload,
    @Body() body: InviteWorkspaceMembersDto,
  ) {
    return this.workspaceService.inviteMembersToWorkspace(slug, user, body);
  }

  @Get(':id/projects/next-identifier')
  @UseGuards(WorkspaceGuard)
  async getNextProjectIdentifier(@Param('id', ParseIntPipe) id: number) {
    const identifier =
      await this.workspaceService.generateNextProjectIdentifier(id);
    return { identifier };
  }

  @Patch(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Delete(':id/leave')
  @UseGuards(WorkspaceGuard)
  leave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.workspaceService.leave(id, user.id);
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.remove(id);
  }
}
