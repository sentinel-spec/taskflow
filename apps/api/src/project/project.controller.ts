import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { UserPayload } from '@/auth/decorators/current-user.decorator';
import { GenerateProjectDescriptionDto } from './dto/generate-project-description.dto';

@Controller('workspace/:workspaceId/project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(workspaceId, createProjectDto, user.id);
  }

  @Get()
  findAll(@Param('workspaceId', ParseIntPipe) workspaceId: number) {
    return this.projectService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Post('description/draft')
  generateDescriptionDraft(
    @CurrentUser() user: UserPayload,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() payload: GenerateProjectDescriptionDto,
  ) {
    return this.projectService.generateDescriptionDraft(
      user.id,
      workspaceId,
      payload,
    );
  }
}
