import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Password (minimum 6 characters)', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Gender', enum: ['Male', 'Female', 'Other'], example: 'Male' })
  @IsEnum(['Male', 'Female', 'Other'])
  gender: string;

  @ApiProperty({ description: 'Location/Address', example: 'New York, NY' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Type of user', enum: ['patient', 'doctor'], example: 'patient' })
  @IsEnum(['patient', 'doctor'])
  userType: string;

  @ApiPropertyOptional({ description: 'Medical registration number (required for doctors)', example: 'MD123456' })
  @IsOptional()
  @IsString()
  medicalRegNo?: string;

  @ApiPropertyOptional({ description: 'Medical specialization (required for doctors)', example: 'Cardiology' })
  @IsOptional()
  @IsString()
  specialization?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Type of user', enum: ['patient', 'doctor'], example: 'patient' })
  @IsEnum(['patient', 'doctor'])
  userType: string;
}
