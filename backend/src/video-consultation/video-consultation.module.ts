import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Video consultation components
import { VideoConsultationController } from '../video-consultation/video-consultation.controller';
import { VideoConsultationService } from '../video-consultation/video-consultation.service';  
import { VideoConsultationGateway } from '../video-consultation/video-consultation.gateway';

// Notifications
import { NotificationsModule } from '../notifications/notifications.module';

// Schemas
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [VideoConsultationController],
  providers: [VideoConsultationGateway, VideoConsultationService],
  exports: [VideoConsultationService],
})
export class VideoConsultationModule {}