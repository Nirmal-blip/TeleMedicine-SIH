import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { OtpService } from './otp.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, OtpService],
  exports: [EmailService, OtpService],
})
export class EmailModule {}
