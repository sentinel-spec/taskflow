import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GenerateProjectDescriptionDto } from './dto/generate-project-description.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(':workspaceId')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.projectService.create(+workspaceId, createProjectDto, user.id);
  }

  @Get('favorites/all')
  findFavorites(@CurrentUser() user: UserPayload) {
    return this.projectService.findFavorites(user.id);
  }

  @Get(':workspaceId')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectService.findAll(+workspaceId);
  }

  @Get('details/:id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Post(':workspaceId/generate-description')
  generateDescription(
    @Param('workspaceId') workspaceId: string,
    @Body() payload: GenerateProjectDescriptionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.projectService.generateDescriptionDraft(
      user.id,
      +workspaceId,
      payload,
    );
  }

  @Post(':id/favorite')
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.projectService.toggleFavorite(+id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
