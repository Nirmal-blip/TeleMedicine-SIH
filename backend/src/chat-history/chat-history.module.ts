import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatHistoryController } from './chat-history.controller';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistory, ChatHistorySchema } from './chat-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatHistory.name, schema: ChatHistorySchema }
    ])
  ],
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService],
  exports: [ChatHistoryService],
})
export class ChatHistoryModule {}
