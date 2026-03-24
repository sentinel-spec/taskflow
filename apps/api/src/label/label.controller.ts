import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LabelService } from './label.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/labels')
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body('name') name: string,
    @Body('color') color?: string,
    @Body('description') description?: string,
  ) {
    return this.labelService.create(+projectId, name, color, description);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.labelService.findAll(+projectId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labelService.remove(+id);
  }

  @Post(':id/issues/:issueId')
  attach(@Param('id') id: string, @Param('issueId') issueId: string) {
    return this.labelService.attachToIssue(+issueId, +id);
  }

  @Delete(':id/issues/:issueId')
  detach(@Param('id') id: string, @Param('issueId') issueId: string) {
    return this.labelService.detachFromIssue(+issueId, +id);
  }
}
