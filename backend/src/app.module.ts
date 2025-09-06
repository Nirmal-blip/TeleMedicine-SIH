import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiMlModule } from './ai-ml/ai-ml.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { VideoConsultationModule } from './video-consultation/video-consultation.module';
<<<<<<< HEAD
import { NotificationsModule } from './notifications/notifications.module';
=======
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
>>>>>>> 6979ad29fce946dbf2388aa016cafc09d2bdfcdc

import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database connection
    DatabaseModule,
    
    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'dist'),
      exclude: ['/api*'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    PrescriptionsModule,
    UploadsModule,
    AiMlModule,
    ChatHistoryModule,
    VideoConsultationModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
