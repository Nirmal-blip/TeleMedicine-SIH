import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiMlController } from './ai-ml.controller';
import { AiMlService } from './ai-ml.service';

@Module({
  imports: [HttpModule],
  controllers: [AiMlController],
  providers: [AiMlService],
  exports: [AiMlService],
})
export class AiMlModule {}
