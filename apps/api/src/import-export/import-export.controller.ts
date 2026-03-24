import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('import-export')
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export/projects/:projectId')
  exportProject(@Param('projectId') projectId: string) {
    return this.importExportService.exportProject(+projectId);
  }

  @Post('import/workspaces/:workspaceId')
  importProject(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: UserPayload,
    @Body() data: any,
  ) {
    return this.importExportService.importProject(+workspaceId, user.id, data);
  }
}
