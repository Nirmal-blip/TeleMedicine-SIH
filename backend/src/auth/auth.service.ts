import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    private jwtService: JwtService,
  ) {}

  private async generatePatientId(): Promise<string> {
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

  async register(registerDto: RegisterDto) {
    const { fullname, email, phone, password, dateOfBirth, gender, location, userType, medicalRegNo, specialization } = registerDto;

    // Validate userType
    if (userType !== 'patient' && userType !== 'doctor') {
      throw new BadRequestException('Invalid user type');
    }

    // Check if user already exists
    const existingUser = userType === 'patient'
      ? await this.patientModel.findOne({ $or: [{ email }, { fullname }] })
      : await this.doctorModel.findOne({ $or: [{ email }, { fullname }] });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (userType === 'patient') {
      const patientId = await this.generatePatientId();
      user = await this.patientModel.create({
        patientId,
        fullname,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth,
        gender,
        location,
      });
    } else {
      // Ensure doctors provide required fields
      if (!medicalRegNo || !specialization) {
        throw new BadRequestException('Medical Registration Number and Specialization are required for doctors');
      }
      user = await this.doctorModel.create({
        fullname,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth,
        gender,
        location,
        medicalRegNo,
        specialization,
      });
    }

    // Generate authentication token
    const token = this.jwtService.sign({
      email: email,
      userid: user._id,
      userType: userType,
    });

    return { token, message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password, userType } = loginDto;

    // Validate userType
    if (userType !== 'patient' && userType !== 'doctor') {
      throw new BadRequestException('Invalid user type');
    }

    // Find user based on userType
    const user = userType === 'patient'
      ? await this.patientModel.findOne({ email })
      : await this.doctorModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate authentication token
    const token = this.jwtService.sign({
      email: user.email,
      userid: user._id,
      userType: userType,
    });

    return { token, message: 'Login successful', userType };
  }
}
