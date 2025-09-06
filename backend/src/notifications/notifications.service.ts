import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(notificationData: {
    recipient: string;
    recipientType: 'Patient' | 'Doctor';
    sender?: string;
    senderType?: 'Patient' | 'Doctor' | 'System';
    title: string;
    message: string;
    type: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    relatedEntity?: {
      entityType: 'Appointment' | 'Prescription' | 'Chat' | 'MedicalRecord';
      entityId: string;
    };
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
  }) {
    const notification = new this.notificationModel(notificationData);
    return await notification.save();
  }

  async getNotificationsForUser(userId: string, userType: 'Patient' | 'Doctor', limit: number = 50, skip: number = 0) {
    return await this.notificationModel
      .find({ 
        recipient: userId, 
        recipientType: userType 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender', 'name email')
      .exec();
  }

  async getUnreadNotificationsCount(userId: string, userType: 'Patient' | 'Doctor') {
    return await this.notificationModel.countDocuments({
      recipient: userId,
      recipientType: userType,
      isRead: false
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return await this.notificationModel.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipient: userId 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
  }

  async markAllAsRead(userId: string, userType: 'Patient' | 'Doctor') {
    return await this.notificationModel.updateMany(
      { 
        recipient: userId, 
        recipientType: userType, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  async deleteNotification(notificationId: string, userId: string) {
    return await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
  }

  async deleteAllNotifications(userId: string, userType: 'Patient' | 'Doctor'): Promise<any> {
    return await this.notificationModel.deleteMany({
      recipient: userId,
      recipientType: userType
    });
  }

  async getNotificationsByType(userId: string, userType: 'Patient' | 'Doctor', type: string) {
    return await this.notificationModel
      .find({ 
        recipient: userId, 
        recipientType: userType, 
        type: type 
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .exec();
  }

  async getNotificationsByPriority(userId: string, userType: 'Patient' | 'Doctor', priority: string) {
    return await this.notificationModel
      .find({ 
        recipient: userId, 
        recipientType: userType, 
        priority: priority 
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .exec();
  }

  async searchNotifications(userId: string, userType: 'Patient' | 'Doctor', searchQuery: string) {
    return await this.notificationModel
      .find({
        recipient: userId,
        recipientType: userType,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { message: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .exec();
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
      recipient: appointmentData.doctorId,
      recipientType: 'Doctor',
      sender: appointmentData.patientId,
      senderType: 'Patient',
      title: this.getAppointmentTitle(appointmentData.type, 'doctor'),
      message: this.getAppointmentMessage(appointmentData.type, 'doctor', appointmentData),
      type: appointmentData.type,
      priority: appointmentData.type === 'appointment_cancelled' ? 'Medium' : 'High',
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointmentData.appointmentId
      },
      actionUrl: '/doctor/appointments',
      actionText: 'View Appointment'
    });

    // Notification for patient
    notifications.push({
      recipient: appointmentData.patientId,
      recipientType: 'Patient',
      sender: appointmentData.doctorId,
      senderType: 'Doctor',
      title: this.getAppointmentTitle(appointmentData.type, 'patient'),
      message: this.getAppointmentMessage(appointmentData.type, 'patient', appointmentData),
      type: appointmentData.type,
      priority: appointmentData.type === 'appointment_cancelled' ? 'Medium' : 'High',
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointmentData.appointmentId
      },
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

  // Method to create prescription-related notifications
  async createPrescriptionNotification(prescriptionData: {
    prescriptionId: string;
    doctorId: string;
    patientId: string;
    doctorName: string;
    patientName: string;
    type: 'prescription_ready';
  }) {
    return await this.createNotification({
      recipient: prescriptionData.patientId,
      recipientType: 'Patient',
      sender: prescriptionData.doctorId,
      senderType: 'Doctor',
      title: 'Prescription Ready',
      message: `Your prescription from Dr. ${prescriptionData.doctorName} is ready for pickup`,
      type: prescriptionData.type,
      priority: 'High',
      relatedEntity: {
        entityType: 'Prescription',
        entityId: prescriptionData.prescriptionId
      },
      actionUrl: '/patient/prescriptions',
      actionText: 'View Prescription'
    });
  }

  // Method to create emergency alert notifications
  async createEmergencyNotification(emergencyData: {
    patientId: string;
    doctorId: string;
    patientName: string;
    message: string;
  }) {
    return await this.createNotification({
      recipient: emergencyData.doctorId,
      recipientType: 'Doctor',
      sender: emergencyData.patientId,
      senderType: 'Patient',
      title: 'Emergency Alert',
      message: `Emergency alert from ${emergencyData.patientName}: ${emergencyData.message}`,
      type: 'emergency_alert',
      priority: 'Critical',
      actionUrl: '/doctor/video-consultation',
      actionText: 'Start Emergency Call'
    });
  }
}
