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

  async getNotificationsForUser(userId: string, userType: 'Patient' | 'Doctor', limit: number = 50, skip: number = 0) {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType }
      : { patientId: userId, recipientType: userType };
    
    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
      
    return notifications;
  }

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

  async markAllAsRead(userId: string, userType: 'Patient' | 'Doctor') {
    const query = userType === 'Doctor' 
      ? { doctorId: userId, recipientType: userType, isRead: false }
      : { patientId: userId, recipientType: userType, isRead: false };
    
    return await this.notificationModel.updateMany(
      query,
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  async deleteNotification(notificationId: string, userId: string) {
    return await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      $or: [{ patientId: userId }, { doctorId: userId }]
    });
  }
}
