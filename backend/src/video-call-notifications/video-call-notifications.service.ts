import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class VideoCallNotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async createVideoCallRequestNotification(data: {
    doctorId: string;
    patientId: string;
    patientName: string;
    specialization: string;
    callId: string;
    appointmentId?: string;
  }) {
    try {
      const notification = new this.notificationModel({
        recipient: data.doctorId,
        recipientType: 'Doctor',
        sender: data.patientId,
        senderType: 'Patient',
        title: 'Incoming Video Call Request',
        message: `${data.patientName} is requesting a video consultation for ${data.specialization}`,
        type: 'video_call_request',
        priority: 'High',
        actionUrl: '/doctor/notifications',
        actionText: 'View Request',
        metadata: {
          callId: data.callId,
          patientName: data.patientName,
          specialization: data.specialization,
          requestedAt: new Date().toISOString(),
          appointmentId: data.appointmentId
        }
      });

      return await notification.save();
    } catch (error) {
      console.error('Error creating video call request notification:', error);
      throw error;
    }
  }

  async createCallAcceptedNotification(data: {
    patientId: string;
    doctorId: string;
    callId: string;
  }) {
    try {
      const notification = new this.notificationModel({
        recipient: data.patientId,
        recipientType: 'Patient',
        sender: data.doctorId,
        senderType: 'Doctor',
        title: 'Video Call Accepted',
        message: 'Doctor has accepted your video call request. Please join the call.',
        type: 'video_call_accepted',
        priority: 'High',
        actionUrl: '/video-consultation',
        actionText: 'Join Call',
        metadata: {
          callId: data.callId,
          acceptedAt: new Date().toISOString()
        }
      });

      return await notification.save();
    } catch (error) {
      console.error('Error creating call accepted notification:', error);
      throw error;
    }
  }

  async createCallRejectedNotification(data: {
    patientId: string;
    doctorId: string;
    callId: string;
    reason?: string;
  }) {
    try {
      const notification = new this.notificationModel({
        recipient: data.patientId,
        recipientType: 'Patient',
        sender: data.doctorId,
        senderType: 'Doctor',
        title: 'Video Call Rejected',
        message: data.reason || 'Doctor is not available at the moment. Please try again later.',
        type: 'video_call_rejected',
        priority: 'Medium',
        actionUrl: '/dashboard',
        actionText: 'Go to Dashboard',
        metadata: {
          callId: data.callId,
          rejectedAt: new Date().toISOString(),
          reason: data.reason
        }
      });

      return await notification.save();
    } catch (error) {
      console.error('Error creating call rejected notification:', error);
      throw error;
    }
  }

  async getVideoCallNotifications(userId: string, userType: 'doctor' | 'patient') {
    try {
      const notifications = await this.notificationModel
        .find({
          recipient: userId,
          recipientType: userType === 'doctor' ? 'Doctor' : 'Patient',
          type: { $in: ['video_call_request', 'video_call_accepted', 'video_call_rejected'] }
        })
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error('Error fetching video call notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      return await this.notificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}
