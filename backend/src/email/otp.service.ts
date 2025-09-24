import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email.service';

export interface OtpDocument {
  email: string;
  otp: string;
  purpose: 'signup' | 'signin';
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

@Injectable()
export class OtpService {
  constructor(
    private emailService: EmailService,
  ) {}

  // In-memory storage for OTPs (in production, use Redis or database)
  private otpStorage: Map<string, OtpDocument> = new Map();

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string, purpose: 'signup' | 'signin'): Promise<{ success: boolean; message: string }> {
    try {
      // Check if there's already a valid OTP for this email
      const existingOtp = this.otpStorage.get(email);
      if (existingOtp && existingOtp.expiresAt > new Date()) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting a new one.'
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes

      // Store OTP
      this.otpStorage.set(email, {
        email,
        otp,
        purpose,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      });

      // Send email
      await this.emailService.sendOTP(email, otp, purpose);

      return {
        success: true,
        message: 'OTP sent successfully to your email address'
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyOTP(email: string, otp: string, purpose: 'signup' | 'signin'): Promise<{ success: boolean; message: string }> {
    try {
      const storedOtp = this.otpStorage.get(email);

      if (!storedOtp) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new OTP.'
        };
      }

      // Check if OTP has expired
      if (storedOtp.expiresAt < new Date()) {
        this.otpStorage.delete(email);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check if too many attempts
      if (storedOtp.attempts >= 3) {
        this.otpStorage.delete(email);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Check if purpose matches
      if (storedOtp.purpose !== purpose) {
        return {
          success: false,
          message: 'Invalid OTP purpose.'
        };
      }

      // Verify OTP
      if (storedOtp.otp !== otp) {
        storedOtp.attempts += 1;
        this.otpStorage.set(email, storedOtp);
        return {
          success: false,
          message: `Invalid OTP. ${3 - storedOtp.attempts} attempts remaining.`
        };
      }

      // OTP is valid, remove it from storage
      this.otpStorage.delete(email);

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Clean up expired OTPs (call this periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(email);
      }
    }
  }

  // Get OTP info for debugging (remove in production)
  getOtpInfo(email: string): OtpDocument | null {
    return this.otpStorage.get(email) || null;
  }
}
