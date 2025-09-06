import { Module } from '@nestjs/common';
import { VideoConsultationGateway } from './video-consultation.gateway';
import { VideoConsultationService } from './video-consultation.service';
import { VideoConsultationController } from './video-consultation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentSchema } from '../schemas/appointment.schema';
import { DoctorSchema } from '../schemas/doctor.schema';
import { PatientSchema } from '../schemas/patient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'Doctor', schema: DoctorSchema },
      { name: 'Patient', schema: PatientSchema },
    ]),
  ],
  providers: [VideoConsultationGateway, VideoConsultationService],
  controllers: [VideoConsultationController],
  exports: [VideoConsultationService],
})
export class VideoConsultationModule {}
