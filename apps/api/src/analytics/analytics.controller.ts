import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects/:projectId')
  getProjectStats(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectStats(+projectId);
  }

  @Get('workspaces/:workspaceId')
  getWorkspaceStats(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getWorkspaceStats(+workspaceId);
  }
}
