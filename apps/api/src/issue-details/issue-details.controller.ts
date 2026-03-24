import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { IssueDetailsService } from './issue-details.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';
import { IssueRelationType } from '@prisma/client';

@Controller('issues/:issueId')
@UseGuards(JwtAuthGuard)
export class IssueDetailsController {
  constructor(private readonly detailsService: IssueDetailsService) {}

  @Post('comments')
  addComment(
    @Param('issueId') issueId: string,
    @CurrentUser() user: UserPayload,
    @Body() content: any,
  ) {
    return this.detailsService.addComment(+issueId, user.id, content);
  }

  @Get('comments')
  findComments(@Param('issueId') issueId: string) {
    return this.detailsService.findComments(+issueId);
  }

  @Post('relations')
  addRelation(
    @Param('issueId') issueId: string,
    @Body('relatedIssueId') relatedIssueId: number,
    @Body('type') type: IssueRelationType,
  ) {
    return this.detailsService.addRelation(+issueId, relatedIssueId, type);
  }

  @Get('relations')
  findRelations(@Param('issueId') issueId: string) {
    return this.detailsService.findRelations(+issueId);
  }

  @Post('links')
  addLink(
    @Param('issueId') issueId: string,
    @Body('url') url: string,
    @Body('title') title?: string,
  ) {
    return this.detailsService.addLink(+issueId, url, title);
  }

  @Get('links')
  findLinks(@Param('issueId') issueId: string) {
    return this.detailsService.findLinks(+issueId);
  }

  @Post('reactions')
  toggleReaction(
    @Param('issueId') issueId: string,
    @CurrentUser() user: UserPayload,
    @Body('emoji') emoji: string,
    @Body('commentId') commentId?: number,
  ) {
    return this.detailsService.toggleReaction(
      user.id,
      emoji,
      +issueId,
      commentId,
    );
  }
}
