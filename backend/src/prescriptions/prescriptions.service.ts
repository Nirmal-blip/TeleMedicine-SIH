import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
  ) {}

  async create(prescriptionData: any): Promise<Prescription> {
    try {
      // If patientId is not provided, generate a temporary one
      if (!prescriptionData.patientId && prescriptionData.patient) {
        prescriptionData.patientId = `TEMP-${prescriptionData.patient}`;
      }
      
      const prescription = new this.prescriptionModel(prescriptionData);
      return prescription.save();
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionModel.find().exec();
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionModel.findById(id).exec();
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ patientId })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByPatient(patientObjectId: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ patient: patientObjectId })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByDoctor(doctorId: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ doctor: doctorId })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByDoctorId(doctorId: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ doctorId })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByStatus(status: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ status })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByPatientIdAndStatus(patientId: string, status: string): Promise<Prescription[]> {
    return this.prescriptionModel
      .find({ patientId, status })
      .sort({ issueDate: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<Prescription>): Promise<Prescription> {
    const prescription = await this.prescriptionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    
    return prescription;
  }

  async remove(id: string): Promise<void> {
    const result = await this.prescriptionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Prescription not found');
    }
  }

  async generatePrescriptionNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `RX${currentYear}`;
    
    // Find the latest prescription with current year prefix
    const latestPrescription = await this.prescriptionModel
      .findOne({ prescriptionNumber: { $regex: `^${prefix}` } })
      .sort({ prescriptionNumber: -1 })
      .exec();
    
    let nextNumber = 1;
    if (latestPrescription && latestPrescription.prescriptionNumber) {
      const lastNumber = parseInt(latestPrescription.prescriptionNumber.substring(prefix.length));
      nextNumber = lastNumber + 1;
    }
    
    // Pad with zeros to make it 8 digits
    const paddedNumber = nextNumber.toString().padStart(8, '0');
    return `${prefix}${paddedNumber}`;
  }
}
