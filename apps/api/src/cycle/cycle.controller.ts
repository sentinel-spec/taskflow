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
import { CycleService } from './cycle.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('projects/:projectId/cycles')
@UseGuards(JwtAuthGuard)
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
    @Body() createCycleDto: CreateCycleDto,
  ) {
    return this.cycleService.create(+projectId, user.id, createCycleDto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.cycleService.findAll(+projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cycleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCycleDto: UpdateCycleDto) {
    return this.cycleService.update(+id, updateCycleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cycleService.remove(+id);
  }

  @Post(':id/issues')
  addIssues(@Param('id') id: string, @Body('issueIds') issueIds: number[]) {
    return this.cycleService.addIssues(+id, issueIds);
  }

  @Delete('issues/:issueId')
  removeIssue(@Param('issueId') issueId: string) {
    return this.cycleService.removeIssue(+issueId);
  }
}
