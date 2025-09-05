import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiMlController } from './ai-ml.controller';
import { AiMlService } from './ai-ml.service';
import { ChatHistoryModule } from '../chat-history/chat-history.module';

@Module({
  imports: [HttpModule, ChatHistoryModule],
  controllers: [AiMlController],
  providers: [AiMlService],
  exports: [AiMlService],
})
export class AiMlModule {}
