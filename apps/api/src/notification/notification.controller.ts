import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.notificationService.findAllForUser(user.id);
  }

  @Post('read-all')
  markAllAsRead(@CurrentUser() user: UserPayload) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.notificationService.markAsRead(+id, user.id);
  }
}
