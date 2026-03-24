import { Module } from '@nestjs/common';
import { IssueDraftController } from './issue-draft.controller';
import { IssueDraftService } from './issue-draft.service';

@Module({
  controllers: [IssueDraftController],
  providers: [IssueDraftService],
})
export class IssueDraftModule {}
