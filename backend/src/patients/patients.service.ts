import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../schemas/patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async generatePatientId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PAT${currentYear}`;
    
    // Find the latest patient with current year prefix
    const latestPatient = await this.patientModel
      .findOne({ patientId: { $regex: `^${prefix}` } })
      .sort({ patientId: -1 })
      .exec();
    
    let nextNumber = 1;
    if (latestPatient && latestPatient.patientId) {
      const lastNumber = parseInt(latestPatient.patientId.substring(prefix.length));
      nextNumber = lastNumber + 1;
    }
    
    // Pad with zeros to make it 6 digits
    const paddedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}${paddedNumber}`;
  }

  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).select('-password').exec();
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async findByEmail(email: string): Promise<Patient> {
    const patient = await this.patientModel.findOne({ email }).select('-password').exec();
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async findByPatientId(patientId: string): Promise<Patient> {
    const patient = await this.patientModel.findOne({ patientId }).select('-password').exec();
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(id: string, updateData: Partial<Patient>): Promise<Patient> {
    const patient = await this.patientModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
    
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Patient not found');
    }
  }
}
