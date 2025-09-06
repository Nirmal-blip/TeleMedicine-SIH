import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async generateDoctorId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `DOC${currentYear}`;
    
    // Find the latest doctor with current year prefix
    const latestDoctor = await this.doctorModel
      .findOne({ doctorId: { $regex: `^${prefix}` } })
      .sort({ doctorId: -1 })
      .exec();
    
    let nextNumber = 1;
    if (latestDoctor && latestDoctor.doctorId) {
      const lastNumber = parseInt(latestDoctor.doctorId.substring(prefix.length));
      nextNumber = lastNumber + 1;
    }
    
    // Pad with zeros to make it 6 digits
    const paddedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}${paddedNumber}`;
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).select('-password').exec();
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async findByEmail(email: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findOne({ email }).select('-password').exec();
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async findByDoctorId(doctorId: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findOne({ doctorId }).select('-password').exec();
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async findBySpecialization(specialization: string): Promise<Doctor[]> {
    return this.doctorModel
      .find({ 
        specialization: new RegExp(specialization, 'i'),
        isActive: true,
        isVerified: true 
      })
      .select('-password')
      .sort({ rating: -1, totalRatings: -1 })
      .exec();
  }

  async getAvailableDoctors(): Promise<Doctor[]> {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return this.doctorModel
      .find({ 
        isActive: true,
        isVerified: true,
        'availability.day': today
      })
      .select('-password')
      .sort({ rating: -1 })
      .exec();
  }

  async searchDoctors(query: string): Promise<Doctor[]> {
    const searchRegex = new RegExp(query, 'i');
    
    return this.doctorModel
      .find({
        $and: [
          { isActive: true },
          { isVerified: true },
          {
            $or: [
              { fullname: searchRegex },
              { specialization: searchRegex },
              { location: searchRegex },
              { qualification: searchRegex }
            ]
          }
        ]
      })
      .select('-password')
      .sort({ rating: -1, totalRatings: -1 })
      .exec();
  }

  async getDoctorStats(doctorId: string) {
    // This would typically involve aggregating appointment data
    // For now, return basic stats from the doctor document
    const doctor = await this.findOne(doctorId);
    return {
      totalPatients: doctor.totalRatings || 0,
      rating: doctor.rating || 0,
      consultationFee: doctor.consultationFee || 0,
      experience: doctor.experience || 0
    };
  }

  async update(id: string, updateData: Partial<Doctor>): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Doctor not found');
    }
  }
}
