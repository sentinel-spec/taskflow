import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { IntakeService } from './intake.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/intakes')
@UseGuards(JwtAuthGuard)
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post()
  createIntake(
    @Param('projectId') projectId: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.intakeService.createIntake(+projectId, name, description);
  }

  @Get()
  findAllIntakes(@Param('projectId') projectId: string) {
    return this.intakeService.findAllIntakes(+projectId);
  }

  @Post(':intakeId/issues')
  createIntakeIssue(
    @Param('intakeId') intakeId: string,
    @Body('issueId') issueId: number,
  ) {
    return this.intakeService.createIntakeIssue(+intakeId, issueId);
  }

  @Get(':intakeId/issues')
  findIntakeIssues(@Param('intakeId') intakeId: string) {
    return this.intakeService.findIntakeIssues(+intakeId);
  }

  @Patch('issues/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.intakeService.updateStatus(+id, status);
  }
}
