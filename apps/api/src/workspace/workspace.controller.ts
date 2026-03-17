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
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { WorkspaceGuard } from './guards/workspace.guard';
import { WorkspaceRoles } from './decorators/workspace-roles.decorator';
import { WorkspaceRole } from '@prisma/client';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(user.id, createWorkspaceDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.workspaceService.findAllForUser(user.id);
  }

  @Get(':slug')
  @UseGuards(WorkspaceGuard)
  findOne(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.workspaceService.findBySlug(slug, user.id);
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

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.remove(id);
  }
}
