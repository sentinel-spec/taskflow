import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('workspaces/:workspaceId/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body('url') url: string) {
    return this.webhookService.create(+workspaceId, url);
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.webhookService.findAll(+workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webhookService.remove(+id);
  }
}
