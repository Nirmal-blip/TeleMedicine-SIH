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
import { NotificationsModule } from './notifications/notifications.module';
import { MedicinesModule } from './medicines/medicines.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

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
    
    // Serve static files (removed dist serving as it's causing errors)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    UploadsModule,
    AiMlModule,
    ChatHistoryModule,
    VideoConsultationModule,
    NotificationsModule,
    MedicinesModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
