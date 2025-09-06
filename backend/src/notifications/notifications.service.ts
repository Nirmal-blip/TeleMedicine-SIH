import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async createNotification(notificationData: {
    patientId?: string;
    doctorId?: string;
    recipientType: 'Patient' | 'Doctor';
    senderPatientId?: string;
    senderDoctorId?: string;
    senderType?: 'Patient' | 'Doctor' | 'System';
    title: string;
    message: string;
    type: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
  }) {
    const notification = new this.notificationModel({
      ...notificationData,
      priority: notificationData.priority || 'Medium',
      senderType: notificationData.senderType || 'System',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return await notification.save();
  }

<<<<<<< HEAD
  async getNotificationsForUser(userId: string, userType: 'Patient' | 'Doctor', limit: number = 50, skip: number = 0) {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType }
      : { patientId: userId, recipientType: userType };
    
=======
  async getNotificationsForUser(userId: string, userType: string, limit: number = 50, skip: number = 0) {
    // Get custom ID from MongoDB ObjectId
    let customUserId = userId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(userId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(userId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID:', error);
    }

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
    
    // Debug logging
    console.log(`🔍 Searching notifications for: ${customUserId} (${capitalizedUserType})`);
    
    // Query for BOTH custom ID and MongoDB ObjectId to catch all notifications
    const query = userType === 'doctor' 
      ? { 
          $or: [
            { doctorId: customUserId, recipientType: capitalizedUserType },
            { doctorId: userId, recipientType: capitalizedUserType }
          ]
        }
      : { 
          $or: [
            { patientId: customUserId, recipientType: capitalizedUserType },
            { patientId: userId, recipientType: capitalizedUserType }
          ]
        };
    
    console.log('📊 Query with both IDs:', query);
    
>>>>>>> da4678f9adbe56de278a80de09ef048b8f636ed2
    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
      
    return notifications;
  }

<<<<<<< HEAD
=======
  async getUnreadNotificationsCount(userId: string, userType: string) {
    // Get custom ID from MongoDB ObjectId
    let customUserId = userId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(userId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(userId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID for unread count:', error);
    }

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
    
    // Query for BOTH custom ID and MongoDB ObjectId to catch all unread notifications
    const query = userType === 'doctor' 
      ? { 
          $or: [
            { doctorId: customUserId, recipientType: capitalizedUserType, isRead: false },
            { doctorId: userId, recipientType: capitalizedUserType, isRead: false }
          ]
        }
      : { 
          $or: [
            { patientId: customUserId, recipientType: capitalizedUserType, isRead: false },
            { patientId: userId, recipientType: capitalizedUserType, isRead: false }
          ]
        };
    
    return await this.notificationModel.countDocuments(query);
  }

  async getUnreadNotificationsCountByTypes(userId: string, userType: 'Patient' | 'Doctor', types: string[]) {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType, isRead: false, type: { $in: types } }
      : { patientId: userId, recipientType: userType, isRead: false, type: { $in: types } };
    
    console.log('🔢 Video call unread count query:', query);
    
    return await this.notificationModel.countDocuments(query);
  }

  async getUnreadNotificationsCountExcludingTypes(userId: string, userType: 'Patient' | 'Doctor', excludeTypes: string[]) {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType, isRead: false, type: { $nin: excludeTypes } }
      : { patientId: userId, recipientType: userType, isRead: false, type: { $nin: excludeTypes } };
    
    console.log('🚫 Excluding video call unread count query:', query);
    
    return await this.notificationModel.countDocuments(query);
  }

  async getNotificationsWithBothIds(userId: string, userType: string, limit: number = 50, skip: number = 0) {
    // Get custom ID from MongoDB ObjectId
    let customUserId = userId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(userId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(userId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID:', error);
    }

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

    // Query for notifications that have BOTH patientId AND doctorId (not null/undefined)
    const baseQuery = userType === 'doctor' 
      ? { doctorId: customUserId, recipientType: capitalizedUserType }
      : { patientId: customUserId, recipientType: capitalizedUserType };
    
    const query = {
      ...baseQuery,
      patientId: { $exists: true, $ne: null, $ne: '' },
      doctorId: { $exists: true, $ne: null, $ne: '' }
    };
    
    console.log('🔗 Notifications with both IDs query:', query);
    
    return await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getUnreadNotificationsCountWithBothIds(userId: string, userType: string) {
    // Get custom ID from MongoDB ObjectId
    let customUserId = userId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(userId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(userId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID for unread count:', error);
    }

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

    // Count unread notifications that have BOTH patientId AND doctorId
    const baseQuery = userType === 'doctor' 
      ? { doctorId: customUserId, recipientType: capitalizedUserType, isRead: false }
      : { patientId: customUserId, recipientType: capitalizedUserType, isRead: false };
    
    const query = {
      ...baseQuery,
      patientId: { $exists: true, $ne: null, $ne: '' },
      doctorId: { $exists: true, $ne: null, $ne: '' }
    };
    
    console.log('🔢 Unread count with both IDs query:', query);
    
    return await this.notificationModel.countDocuments(query);
  }

>>>>>>> da4678f9adbe56de278a80de09ef048b8f636ed2
  async markAsRead(notificationId: string, userId: string) {
    return await this.notificationModel.findOneAndUpdate(
      { 
        _id: notificationId, 
        $or: [{ patientId: userId }, { doctorId: userId }]
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
  }

  async getUnreadCount(userId: string, userType: 'Patient' | 'Doctor') {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType, isRead: false }
      : { patientId: userId, recipientType: userType, isRead: false };
    
    return await this.notificationModel.countDocuments(query);
  }

  // Method to create appointment-related notifications
  async createAppointmentNotification(appointmentData: {
    appointmentId: string;
    doctorId: string;
    patientId: string;
    doctorName: string;
    patientName: string;
    appointmentDate: Date;
    type: 'appointment_booked' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder';
  }) {
    const notifications = [];

    // Notification for doctor
    notifications.push({
      doctorId: appointmentData.doctorId,
      recipientType: 'Doctor',
      senderPatientId: appointmentData.patientId,
      senderType: 'Patient',
      title: this.getAppointmentTitle(appointmentData.type, 'doctor'),
      message: this.getAppointmentMessage(appointmentData.type, 'doctor', appointmentData),
      type: appointmentData.type,
      priority: appointmentData.type === 'appointment_cancelled' ? 'Medium' : 'High',
      actionUrl: '/doctor/appointments',
      actionText: 'View Appointment'
    });

    // Notification for patient
    notifications.push({
      patientId: appointmentData.patientId,
      recipientType: 'Patient',
      senderDoctorId: appointmentData.doctorId,
      senderType: 'Doctor',
      title: this.getAppointmentTitle(appointmentData.type, 'patient'),
      message: this.getAppointmentMessage(appointmentData.type, 'patient', appointmentData),
      type: appointmentData.type,
      priority: appointmentData.type === 'appointment_cancelled' ? 'Medium' : 'High',
      actionUrl: '/patient/appointments',
      actionText: 'View Appointment'
    });

    return await this.notificationModel.insertMany(notifications);
  }

  private getAppointmentTitle(type: string, recipient: 'doctor' | 'patient'): string {
    const titles = {
      appointment_booked: {
        doctor: 'New Appointment Request',
        patient: 'Appointment Requested'
      },
      appointment_confirmed: {
        doctor: 'Appointment Confirmed',
        patient: 'Appointment Confirmed'
      },
      appointment_cancelled: {
        doctor: 'Appointment Cancelled',
        patient: 'Appointment Cancelled'
      },
      appointment_reminder: {
        doctor: 'Appointment Reminder',
        patient: 'Appointment Reminder'
      }
    };
    return titles[type][recipient];
  }

  private getAppointmentMessage(type: string, recipient: 'doctor' | 'patient', data: any): string {
    const messages = {
      appointment_booked: {
        doctor: `${data.patientName} has requested an appointment for ${data.appointmentDate.toLocaleDateString()}`,
        patient: `Your appointment request with Dr. ${data.doctorName} has been submitted`
      },
      appointment_confirmed: {
        doctor: `Appointment with ${data.patientName} confirmed for ${data.appointmentDate.toLocaleDateString()}`,
        patient: `Your appointment with Dr. ${data.doctorName} is confirmed for ${data.appointmentDate.toLocaleDateString()}`
      },
      appointment_cancelled: {
        doctor: `Appointment with ${data.patientName} has been cancelled`,
        patient: `Your appointment with Dr. ${data.doctorName} has been cancelled`
      },
      appointment_reminder: {
        doctor: `Reminder: You have an appointment with ${data.patientName} tomorrow`,
        patient: `Reminder: You have an appointment with Dr. ${data.doctorName} tomorrow`
      }
    };
    return messages[type][recipient];
  }
}
