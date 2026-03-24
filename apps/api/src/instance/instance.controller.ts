import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('instances')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Get('stats')
  async getStats() {
    return this.instanceService.getInstanceStats();
  }

  @Get('users')
  async findAllUsers() {
    return this.instanceService.findAllUsers();
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.instanceService.updateUserStatus(+id, isActive);
  }

  @Get('workspaces')
  async findAllWorkspaces() {
    return this.instanceService.findAllWorkspaces();
  }

  @Delete('workspaces/:id')
  async deleteWorkspace(@Param('id') id: string) {
    return this.instanceService.deleteWorkspace(+id);
  }
}
