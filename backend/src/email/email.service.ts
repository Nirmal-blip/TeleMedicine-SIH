import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to other services
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || 'your-email@gmail.com',
        pass: this.configService.get<string>('EMAIL_PASS') || 'your-app-password',
      },
    });
  }

  async sendOTP(email: string, otp: string, purpose: 'signup' | 'signin'): Promise<void> {
    const subject = purpose === 'signup' 
      ? 'Verify Your Email - TeleMedicine Registration' 
      : 'Login Verification - TeleMedicine';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TeleMedicine</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Health, Our Priority</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Email Verification</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            ${purpose === 'signup' 
              ? 'Thank you for registering with TeleMedicine! To complete your registration, please verify your email address using the OTP below:'
              : 'For security purposes, please verify your login attempt using the OTP below:'
            }
          </p>
          
          <div style="background: white; border: 2px dashed #10b981; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
            <h1 style="margin: 0; color: #10b981; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 25px 0;">
            <strong>Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If you didn't request this ${purpose === 'signup' ? 'registration' : 'login'}, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 TeleMedicine. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER') || 'your-email@gmail.com',
      to: email,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, fullname: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TeleMedicine!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello ${fullname}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            Welcome to TeleMedicine! Your account has been successfully created and verified. 
            You can now access all our telemedicine services including:
          </p>
          
          <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 25px;">
            <li>Video consultations with certified doctors</li>
            <li>AI-powered health recommendations</li>
            <li>Prescription management</li>
            <li>Appointment scheduling</li>
            <li>Health chat support</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/signin" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Get Started
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If you have any questions, feel free to contact our support team.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 TeleMedicine. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER') || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to TeleMedicine!',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}
