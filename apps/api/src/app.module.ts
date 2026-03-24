import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { RedisModule } from './common/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './common/health/health.controller';
import { SocketModule } from './common/socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { AiModule } from './ai/ai.module';
import { IssueModule } from './issue/issue.module';
import { CycleModule } from './cycle/cycle.module';
import { ModuleModule } from './module/module.module';
import { ActivityModule } from './activity/activity.module';
import { NotificationModule } from './notification/notification.module';
import { PageModule } from './page/page.module';
import { IssueDraftModule } from './issue-draft/issue-draft.module';
import { WebhookModule } from './webhook/webhook.module';
import { ImportExportModule } from './import-export/import-export.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InstanceModule } from './instance/instance.module';
import { IssueDetailsModule } from './issue-details/issue-details.module';
import { LabelModule } from './label/label.module';
import { ViewModule } from './view/view.module';
import { IntakeModule } from './intake/intake.module';
import { SearchModule } from './search/search.module';
import { ApiTokenModule } from './api-token/api-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: `redis://${config.get<string>('REDIS_HOST')}:${config.get<number>('REDIS_PORT')}`,
          ttl: 600, // 10 minutes default
        }),
      }),
    }),
    TerminusModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    FileModule,
    WorkspaceModule,
    ProjectModule,
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    MailModule,
    SocketModule,
    SystemSettingsModule,
    AiModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLER_TTL') || 60000,
            limit: config.get<number>('THROTTLER_LIMIT') || 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        }),
      }),
    }),
    IssueModule,
    CycleModule,
    ModuleModule,
    ActivityModule,
    NotificationModule,
    PageModule,
    IssueDraftModule,
    WebhookModule,
    ImportExportModule,
    AnalyticsModule,
    InstanceModule,
    IssueDetailsModule,
    LabelModule,
    ViewModule,
    IntakeModule,
    SearchModule,
    ApiTokenModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
