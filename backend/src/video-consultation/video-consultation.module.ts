import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Video consultation components
import { VideoConsultationController } from '../video-consultation/video-consultation.controller';
import { VideoConsultationService } from '../video-consultation/video-consultation.service';  
import { VideoConsultationGateway } from '../video-consultation/video-consultation.gateway';

// Schemas
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [VideoConsultationController],
  providers: [VideoConsultationGateway, VideoConsultationService],
  exports: [VideoConsultationService],
})
export class VideoConsultationModule {}