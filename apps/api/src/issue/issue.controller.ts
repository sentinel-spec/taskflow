import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('projects/:projectId/issues')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
    @Body() createIssueDto: CreateIssueDto,
  ) {
    return this.issueService.create(+projectId, user.id, createIssueDto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.issueService.findAll(+projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    return this.issueService.update(+id, updateIssueDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueService.remove(+id);
  }
}
