import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical-record.schema';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  // Migration: Add patientId to existing patients
  async migratePatientIds() {
    console.log('🔄 Starting patientId migration...');
    
    const patientsWithoutId = await this.patientModel.find({ 
      $or: [
        { patientId: { $exists: false } },
        { patientId: null },
        { patientId: "" }
      ]
    });

    if (patientsWithoutId.length === 0) {
      console.log('✅ All patients already have patientId');
      return;
    }

    console.log(`📝 Found ${patientsWithoutId.length} patients without patientId`);

    for (const patient of patientsWithoutId) {
      const patientId = await this.generatePatientId();
      await this.patientModel.findByIdAndUpdate(patient._id, { patientId });
      console.log(`✅ Assigned patientId ${patientId} to patient ${patient.fullname}`);
    }

    console.log('🎉 PatientId migration completed!');
  }

  // Migration: Add doctorId to existing doctors  
  async migrateDoctorIds() {
    console.log('🔄 Starting doctorId migration...');
    
    const doctorsWithoutId = await this.doctorModel.find({ 
      $or: [
        { doctorId: { $exists: false } },
        { doctorId: null },
        { doctorId: "" }
      ]
    });

    if (doctorsWithoutId.length === 0) {
      console.log('✅ All doctors already have doctorId');
      return;
    }

    console.log(`📝 Found ${doctorsWithoutId.length} doctors without doctorId`);

    for (const doctor of doctorsWithoutId) {
      const doctorId = await this.generateDoctorId();
      await this.doctorModel.findByIdAndUpdate(doctor._id, { doctorId });
      console.log(`✅ Assigned doctorId ${doctorId} to doctor ${doctor.fullname}`);
    }

    console.log('🎉 DoctorId migration completed!');
  }

  private async generatePatientId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PAT${currentYear}`;
    
    const latestPatient = await this.patientModel
      .findOne({ patientId: { $regex: `^${prefix}` } })
      .sort({ patientId: -1 })
      .exec();
    
    let nextNumber = 1;
    if (latestPatient && latestPatient.patientId) {
      const lastNumber = parseInt(latestPatient.patientId.substring(prefix.length));
      nextNumber = lastNumber + 1;
    }
    
    const paddedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}${paddedNumber}`;
  }

  private async generateDoctorId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `DOC${currentYear}`;
    
    const latestDoctor = await this.doctorModel
      .findOne({ doctorId: { $regex: `^${prefix}` } })
      .sort({ doctorId: -1 })
      .exec();
    
    let nextNumber = 1;
    if (latestDoctor && latestDoctor.doctorId) {
      const lastNumber = parseInt(latestDoctor.doctorId.substring(prefix.length));
      nextNumber = lastNumber + 1;
    }
    
    const paddedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}${paddedNumber}`;
  }

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const patientCount = await this.patientModel.countDocuments();
    const doctorCount = await this.doctorModel.countDocuments();

    if (patientCount > 0 || doctorCount > 0) {
      console.log('📊 Database already contains data. Skipping seeding.');
      return { message: 'Database already seeded', patients: patientCount, doctors: doctorCount };
    }

    try {
      // Seed Patients
      const patients = await this.seedPatients();
      console.log(`✅ Created ${patients.length} patients`);

      // Seed Doctors
      const doctors = await this.seedDoctors();
      console.log(`✅ Created ${doctors.length} doctors`);

      // Seed Appointments
      const appointments = await this.seedAppointments(patients, doctors);
      console.log(`✅ Created ${appointments.length} appointments`);

      // Seed Medical Records
      const medicalRecords = await this.seedMedicalRecords(patients, doctors, appointments);
      console.log(`✅ Created ${medicalRecords.length} medical records`);

      // Seed Prescriptions
      const prescriptions = await this.seedPrescriptions(patients, doctors, appointments);
      console.log(`✅ Created ${prescriptions.length} prescriptions`);

      // Seed Notifications
      const notifications = await this.seedNotifications(patients, doctors);
      console.log(`✅ Created ${notifications.length} notifications`);

      console.log('🎉 Database seeding completed successfully!');
      
      return {
        message: 'Database seeded successfully',
        summary: {
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          medicalRecords: medicalRecords.length,
          prescriptions: prescriptions.length,
          notifications: notifications.length
        }
      };
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private async seedPatients() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const patientsData = [
      {
        fullname: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'Male',
        location: 'New York, NY',
        password: hashedPassword,
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        height: 180,
        weight: 75,
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1234567891',
          relationship: 'Spouse'
        }
      },
      {
        fullname: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1234567892',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'Female',
        location: 'Los Angeles, CA',
        password: hashedPassword,
        bloodGroup: 'A+',
        allergies: ['Latex'],
        height: 165,
        weight: 60,
        emergencyContact: {
          name: 'Michael Johnson',
          phone: '+1234567893',
          relationship: 'Husband'
        }
      },
      {
        fullname: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1234567894',
        dateOfBirth: new Date('1978-12-10'),
        gender: 'Male',
        location: 'Chicago, IL',
        password: hashedPassword,
        bloodGroup: 'B+',
        allergies: [],
        height: 175,
        weight: 80
      },
      {
        fullname: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1234567895',
        dateOfBirth: new Date('1995-03-18'),
        gender: 'Female',
        location: 'Houston, TX',
        password: hashedPassword,
        bloodGroup: 'AB+',
        allergies: ['Shellfish'],
        height: 170,
        weight: 65
      }
    ];

    return await this.patientModel.insertMany(patientsData);
  }

  private async seedDoctors() {
    const hashedPassword = await bcrypt.hash('doctor123', 10);
    
    const doctorsData = [
      {
        fullname: 'Dr. Michael Brown',
        email: 'dr.brown@hospital.com',
        phone: '+1234567896',
        dateOfBirth: new Date('1975-04-12'),
        gender: 'Male',
        location: 'New York, NY',
        medicalRegNo: 'MD12345',
        specialization: 'Cardiology',
        password: hashedPassword,
        qualification: 'MD, FACC',
        experience: 15,
        consultationFee: 200,
        about: 'Experienced cardiologist with expertise in heart disease prevention and treatment.',
        rating: 4.8,
        totalRatings: 120,
        isVerified: true,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '15:00' }
        ]
      },
      {
        fullname: 'Dr. Lisa Anderson',
        email: 'dr.anderson@hospital.com',
        phone: '+1234567897',
        dateOfBirth: new Date('1980-09-25'),
        gender: 'Female',
        location: 'Los Angeles, CA',
        medicalRegNo: 'MD12346',
        specialization: 'Pediatrics',
        password: hashedPassword,
        qualification: 'MD, FAAP',
        experience: 12,
        consultationFee: 150,
        about: 'Dedicated pediatrician focused on child health and development.',
        rating: 4.9,
        totalRatings: 95,
        isVerified: true,
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ]
      },
      {
        fullname: 'Dr. James Taylor',
        email: 'dr.taylor@hospital.com',
        phone: '+1234567898',
        dateOfBirth: new Date('1970-11-08'),
        gender: 'Male',
        location: 'Chicago, IL',
        medicalRegNo: 'MD12347',
        specialization: 'Orthopedics',
        password: hashedPassword,
        qualification: 'MD, FAAOS',
        experience: 20,
        consultationFee: 250,
        about: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
        rating: 4.7,
        totalRatings: 150,
        isVerified: true,
        availability: [
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ]
      },
      {
        fullname: 'Dr. Emma Martinez',
        email: 'dr.martinez@hospital.com',
        phone: '+1234567899',
        dateOfBirth: new Date('1982-07-14'),
        gender: 'Female',
        location: 'Houston, TX',
        medicalRegNo: 'MD12348',
        specialization: 'Dermatology',
        password: hashedPassword,
        qualification: 'MD, FAAD',
        experience: 10,
        consultationFee: 180,
        about: 'Dermatologist specializing in skin cancer detection and cosmetic procedures.',
        rating: 4.6,
        totalRatings: 85,
        isVerified: true,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      }
    ];

    return await this.doctorModel.insertMany(doctorsData);
  }

  private async seedAppointments(patients: any[], doctors: any[]) {
    const appointmentsData = [
      {
        doctor: doctors[0]._id,
        patient: patients[0]._id,
        date: new Date('2024-02-15'),
        time: '10:00',
        status: 'Confirmed',
        reason: 'Regular cardiac checkup',
        type: 'In-Person',
        consultationFee: 200,
        paymentStatus: 'Paid'
      },
      {
        doctor: doctors[1]._id,
        patient: patients[1]._id,
        date: new Date('2024-02-16'),
        time: '14:00',
        status: 'Completed',
        reason: 'Child vaccination',
        type: 'In-Person',
        consultationFee: 150,
        paymentStatus: 'Paid',
        rating: 5,
        review: 'Excellent care for my child!'
      },
      {
        doctor: doctors[2]._id,
        patient: patients[2]._id,
        date: new Date('2024-02-17'),
        time: '11:30',
        status: 'Pending',
        reason: 'Knee pain consultation',
        type: 'Online',
        meetingLink: 'https://meet.example.com/room123',
        consultationFee: 250,
        paymentStatus: 'Pending'
      },
      {
        doctor: doctors[3]._id,
        patient: patients[3]._id,
        date: new Date('2024-02-18'),
        time: '15:00',
        status: 'Confirmed',
        reason: 'Skin examination',
        type: 'In-Person',
        consultationFee: 180,
        paymentStatus: 'Paid'
      }
    ];

    return await this.appointmentModel.insertMany(appointmentsData);
  }

  private async seedMedicalRecords(patients: any[], doctors: any[], appointments: any[]) {
    const medicalRecordsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        title: 'Cardiac Assessment',
        description: 'Regular cardiac checkup with ECG and blood pressure monitoring',
        diagnosis: 'Normal cardiac function',
        symptoms: ['None reported'],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 98.6,
          weight: 75,
          height: 180
        },
        priority: 'Low',
        status: 'Active'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointment: appointments[1]._id,
        title: 'Pediatric Vaccination',
        description: 'Routine childhood vaccination and health check',
        diagnosis: 'Healthy child development',
        symptoms: ['None'],
        vitals: {
          temperature: 98.2,
          weight: 25,
          height: 110
        },
        priority: 'Low',
        status: 'Resolved'
      }
    ];

    return await this.medicalRecordModel.insertMany(medicalRecordsData);
  }

  private async seedPrescriptions(patients: any[], doctors: any[], appointments: any[]) {
    const prescriptionsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        prescriptionNumber: 'RX001',
        medications: [
          {
            name: 'Lisinopril',
            genericName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food',
            quantity: 30
          }
        ],
        diagnosis: 'Hypertension prevention',
        issueDate: new Date(),
        status: 'Active',
        priority: 'Medium'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointment: appointments[1]._id,
        prescriptionNumber: 'RX002',
        medications: [
          {
            name: 'Children\'s Tylenol',
            genericName: 'Acetaminophen',
            dosage: '160mg',
            frequency: 'As needed',
            duration: '7 days',
            instructions: 'For fever or pain relief',
            quantity: 20
          }
        ],
        diagnosis: 'Post-vaccination care',
        issueDate: new Date(),
        status: 'Completed',
        isDispensed: true,
        priority: 'Low'
      }
    ];

    return await this.prescriptionModel.insertMany(prescriptionsData);
  }

  private async seedNotifications(patients: any[], doctors: any[]) {
    const notificationsData = [
      {
        recipient: patients[0]._id,
        recipientType: 'Patient',
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Michael Brown has been confirmed for February 15th at 10:00 AM.',
        type: 'appointment_confirmed',
        priority: 'Medium'
      },
      {
        recipient: patients[1]._id,
        recipientType: 'Patient',
        title: 'Prescription Ready',
        message: 'Your prescription is ready for pickup at the pharmacy.',
        type: 'prescription_ready',
        priority: 'High'
      },
      {
        recipient: doctors[0]._id,
        recipientType: 'Doctor',
        title: 'New Patient Appointment',
        message: 'You have a new appointment request from John Smith.',
        type: 'appointment_booked',
        priority: 'Medium'
      }
    ];

    return await this.notificationModel.insertMany(notificationsData);
  }

  async getDataSummary() {
    const summary = {
      patients: await this.patientModel.countDocuments(),
      doctors: await this.doctorModel.countDocuments(),
      appointments: await this.appointmentModel.countDocuments(),
      medicalRecords: await this.medicalRecordModel.countDocuments(),
      prescriptions: await this.prescriptionModel.countDocuments(),
      notifications: await this.notificationModel.countDocuments()
    };

    return summary;
  }

  async getAllData() {
    const data = {
      patients: await this.patientModel.find().select('-password').limit(10),
      doctors: await this.doctorModel.find().select('-password').limit(10),
      appointments: await this.appointmentModel.find().populate('patient', 'fullname email').populate('doctor', 'fullname specialization').limit(10),
      medicalRecords: await this.medicalRecordModel.find().populate('patient', 'fullname').populate('doctor', 'fullname').limit(10),
      prescriptions: await this.prescriptionModel.find().populate('patient', 'fullname').populate('doctor', 'fullname').limit(10),
      notifications: await this.notificationModel.find().limit(10)
    };

    return data;
  }
}
