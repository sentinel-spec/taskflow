import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceInvitationController } from './workspace-invitation.controller';

@Module({
  controllers: [WorkspaceController, WorkspaceInvitationController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
