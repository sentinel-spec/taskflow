import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTokenService } from './api-token.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@/auth/decorators/current-user.decorator';

@Controller('api-tokens')
@UseGuards(JwtAuthGuard)
export class ApiTokenController {
  constructor(private readonly apiTokenService: ApiTokenService) {}

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body('label') label: string,
    @Body('description') description?: string,
  ) {
    return this.apiTokenService.create(user.id, label, description);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.apiTokenService.findAll(user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.apiTokenService.remove(+id, user.id);
  }
}
