import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { SocketModule } from '@/common/socket/socket.module';

@Global()
@Module({
  imports: [PrismaModule, SocketModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
