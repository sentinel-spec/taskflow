import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('workspaces/:workspaceId/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  globalSearch(
    @Param('workspaceId') workspaceId: string,
    @Query('q') query: string,
  ) {
    if (!query || query.length < 2) {
      return { issues: [], projects: [], pages: [] };
    }
    return this.searchService.globalSearch(+workspaceId, query);
  }
}
