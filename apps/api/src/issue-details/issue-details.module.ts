import { Module } from '@nestjs/common';
import { IssueDetailsController } from './issue-details.controller';
import { IssueDetailsService } from './issue-details.service';

@Module({
  controllers: [IssueDetailsController],
  providers: [IssueDetailsService],
})
export class IssueDetailsModule {}
