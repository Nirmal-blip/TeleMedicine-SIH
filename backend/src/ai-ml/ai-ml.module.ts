import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiMlController } from './ai-ml.controller';
import { AiMlService } from './ai-ml.service';
import { ChatHistoryModule } from '../chat-history/chat-history.module';

// Module disabled as Flask is now called directly from frontend
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class AiMlModule {}
