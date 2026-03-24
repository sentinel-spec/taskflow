import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('projects/:projectId/modules')
@UseGuards(JwtAuthGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.moduleService.create(+projectId, user.id, createModuleDto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.moduleService.findAll(+projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }

  @Post(':id/issues')
  addIssues(@Param('id') id: string, @Body('issueIds') issueIds: number[]) {
    return this.moduleService.addIssues(+id, issueIds);
  }

  @Delete('issues/:issueId')
  removeIssue(@Param('issueId') issueId: string) {
    return this.moduleService.removeIssue(+issueId);
  }
}
