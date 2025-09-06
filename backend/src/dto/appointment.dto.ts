import { IsString, IsNotEmpty, IsDateString, IsMongoId, IsEnum, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  doctor: string;

  @IsMongoId()
  patient: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsEnum(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled', 'Rescheduled'])
  status?: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsEnum(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled', 'Rescheduled'])
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
