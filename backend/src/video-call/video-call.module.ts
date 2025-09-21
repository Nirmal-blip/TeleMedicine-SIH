import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoCallGateway } from './video-call.gateway';
import { VideoCallService } from './video-call.service';
import { VideoCallController } from './video-call.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Patient, PatientSchema } from '../schemas/patient.schema';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema }
    ])
  ],
  controllers: [VideoCallController],
  providers: [VideoCallGateway, VideoCallService],
  exports: [VideoCallService],
})
export class VideoCallModule {}
