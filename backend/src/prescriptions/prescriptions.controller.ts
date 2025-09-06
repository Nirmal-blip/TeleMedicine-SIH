import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async create(@Body() prescriptionData: any) {
    try {
      console.log('=== PRESCRIPTION DATA FROM FRONTEND ===');
      console.log(JSON.stringify(prescriptionData, null, 2));
      console.log('=======================================');
      
      // Generate prescription number if not provided
      if (!prescriptionData.prescriptionNumber) {
        prescriptionData.prescriptionNumber = await this.prescriptionsService.generatePrescriptionNumber();
      }
      
      // Convert date strings to Date objects if needed
      if (prescriptionData.issueDate && typeof prescriptionData.issueDate === 'string') {
        prescriptionData.issueDate = new Date(prescriptionData.issueDate);
      }
      if (prescriptionData.expiryDate && typeof prescriptionData.expiryDate === 'string') {
        prescriptionData.expiryDate = new Date(prescriptionData.expiryDate);
      }
      
      // Ensure required fields are present
      if (!prescriptionData.patient) {
        throw new Error('Patient ID is required');
      }
      if (!prescriptionData.doctor) {
        throw new Error('Doctor ID is required');
      }
      if (!prescriptionData.patientId) {
        throw new Error('Patient custom ID is required');
      }
      if (!prescriptionData.doctorId) {
        throw new Error('Doctor custom ID is required');
      }
      if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
        throw new Error('At least one medication is required');
      }
      if (!prescriptionData.issueDate) {
        prescriptionData.issueDate = new Date(); // Default to current date
      }
      
      return this.prescriptionsService.create(prescriptionData);
    } catch (error) {
      console.error('=== PRESCRIPTION CREATION ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('Data that caused error:', JSON.stringify(prescriptionData, null, 2));
      console.error('=====================================');
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get('patient/:patientId')
  findByPatientId(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatientId(patientId);
  }

  @Get('patient-object/:patientObjectId')
  findByPatient(@Param('patientObjectId') patientObjectId: string) {
    return this.prescriptionsService.findByPatient(patientObjectId);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.prescriptionsService.findByDoctor(doctorId);
  }

  @Get('doctor-id/:doctorId')
  findByDoctorId(@Param('doctorId') doctorId: string) {
    return this.prescriptionsService.findByDoctorId(doctorId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.prescriptionsService.findByStatus(status);
  }

  @Get('patient/:patientId/status/:status')
  findByPatientIdAndStatus(
    @Param('patientId') patientId: string,
    @Param('status') status: string
  ) {
    return this.prescriptionsService.findByPatientIdAndStatus(patientId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.prescriptionsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
