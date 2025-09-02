import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Patient, PatientSchema } from '../schemas/patient.schema';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'Sayantan', // In production, use environment variable
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
