import { Module } from '@nestjs/common';
import { SystemSettingsModule } from '@/system-settings/system-settings.module';
import { AiService } from './ai.service';
import { OpenRouterProvider } from './openrouter.provider';

@Module({
  imports: [SystemSettingsModule],
  providers: [AiService, OpenRouterProvider],
  exports: [AiService],
})
export class AiModule {}
