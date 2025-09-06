import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoCallNotificationsGateway } from './video-call-notifications.gateway';
import { VideoCallNotificationsService } from './video-call-notifications.service';
import { VideoCallNotificationsController } from './video-call-notifications.controller';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [VideoCallNotificationsController],
  providers: [VideoCallNotificationsGateway, VideoCallNotificationsService],
  exports: [VideoCallNotificationsService],
})
export class VideoCallNotificationsModule {}
