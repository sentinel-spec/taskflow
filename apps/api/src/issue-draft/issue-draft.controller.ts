import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { IssueDraftService } from './issue-draft.service';
import { CreateIssueDraftDto } from './dto/create-issue-draft.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('projects/:projectId/drafts')
@UseGuards(JwtAuthGuard)
export class IssueDraftController {
  constructor(private readonly issueDraftService: IssueDraftService) {}

  @Post()
  upsert(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateIssueDraftDto,
  ) {
    return this.issueDraftService.upsert(+projectId, user.id, dto);
  }

  @Get()
  findForUser(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.issueDraftService.findForUser(+projectId, user.id);
  }

  @Delete()
  remove(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.issueDraftService.remove(+projectId, user.id);
  }
}
