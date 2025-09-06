import { Module } from '@nestjs/common';
import { VideoCallGateway } from './video-call.gateway';
import { VideoCallService } from './video-call.service';
import { VideoCallController } from './video-call.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
  ],
  controllers: [VideoCallController],
  providers: [VideoCallGateway, VideoCallService],
  exports: [VideoCallService],
})
export class VideoCallModule {}
