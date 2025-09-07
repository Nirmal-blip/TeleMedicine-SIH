import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseController } from './database.controller';
import { SeederService } from './seeder.service';
import { Patient, PatientSchema } from '../schemas/patient.schema';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { MedicalRecord, MedicalRecordSchema } from '../schemas/medical-record.schema';
import { Prescription, PrescriptionSchema } from '../schemas/prescription.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Get MongoDB URI from environment variable
        const mongoUri = configService.get<string>('MONGODB_URI') || 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
        
        console.log('Connecting to MongoDB...');
        console.log('Using URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Log URI without exposing credentials
        
        return {
          uri: mongoUri,
          dbName: 'TeleMedicine', // Specify the database name
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [DatabaseController],
  providers: [SeederService],
  exports: [MongooseModule],
})
export class DatabaseModule {}
