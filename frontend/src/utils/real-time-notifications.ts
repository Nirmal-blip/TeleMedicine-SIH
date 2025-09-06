import { io, Socket } from 'socket.io-client';
import { NotificationManager, NotificationData } from './notifications';

export class RealTimeNotificationService {
  private socket: Socket | null = null;
  private userId: string = '';
  private userType: 'doctor' | 'patient' = 'patient';
  private isConnected: boolean = false;

  constructor(userId: string, userType: 'doctor' | 'patient') {
    this.userId = userId;
    this.userType = userType;
    this.connect();
  }

  private connect() {
    try {
      // Connect to the video-call namespace
      this.socket = io('http://localhost:3000/video-call', {
        query: {
          userId: this.userId,
          userType: this.userType,
        },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Real-time notifications connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Real-time notifications disconnected');
        this.isConnected = false;
      });

      // Listen for incoming video call notifications
      this.socket.on('incoming-video-call', (data: {
        callId: string;
        doctorId: string;
        doctorName: string;
        patientId: string;
        patientName: string;
        specialization: string;
        requestedAt?: string;
      }) => {
        console.log('Incoming call notification:', data);
        
        const notificationData: NotificationData = {
          type: 'video-call-request',
          title: 'Incoming Video Call',
          message: this.userType === 'patient' 
            ? `Dr. ${data.doctorName} is calling you for video consultation`
            : `Patient ${data.patientName} is requesting video consultation`,
          callId: data.callId,
          doctorId: data.doctorId,
          patientId: data.patientId,
          doctorName: data.doctorName,
          patientName: data.patientName,
        };

        NotificationManager.showNotification(notificationData);
        NotificationManager.showBrowserNotification(
          notificationData.title,
          notificationData.message
        );
      });

      // Listen for call accepted notifications
      this.socket.on('call-accepted', (data: {
        callId: string;
        doctorId: string;
        doctorName: string;
        message: string;
        videoCallUrl: string;
      }) => {
        console.log('Call accepted notification:', data);
        
        const notificationData: NotificationData = {
          type: 'video-call-accepted',
          title: 'Call Accepted',
          message: data.message,
          callId: data.callId,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
        };

        NotificationManager.showNotification(notificationData);
        NotificationManager.showBrowserNotification(
          notificationData.title,
          notificationData.message
        );
      });

      // Listen for call rejected notifications
      this.socket.on('call-rejected', (data: {
        callId: string;
        doctorId: string;
        doctorName: string;
        reason: string;
        message: string;
      }) => {
        console.log('Call rejected notification:', data);
        
        const notificationData: NotificationData = {
          type: 'video-call-rejected',
          title: 'Call Rejected',
          message: data.reason,
          callId: data.callId,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
        };

        NotificationManager.showNotification(notificationData);
        NotificationManager.showBrowserNotification(
          notificationData.title,
          notificationData.message
        );
      });

      // Listen for call started notifications (kept for backward compatibility)
      this.socket.on('call-started', (data: {
        callId: string;
        appointmentId?: string;
        doctorName?: string;
        patientName?: string;
      }) => {
        console.log('Call started notification:', data);
        
        const notificationData: NotificationData = {
          type: 'video-call-started',
          title: 'Video Call Started',
          message: 'Your video consultation is ready. Click to join.',
          callId: data.callId,
          appointmentId: data.appointmentId,
          doctorName: data.doctorName,
          patientName: data.patientName,
        };

        NotificationManager.showNotification(notificationData);
      });

      // Listen for user joined notifications
      this.socket.on('user-joined', (data: {
        userId: string;
        userType: string;
      }) => {
        console.log('User joined call:', data);
        if (data.userId !== this.userId) {
          const otherUserType = data.userType === 'doctor' ? 'Doctor' : 'Patient';
          NotificationManager.showNotification({
            type: 'video-call-started',
            title: 'User Joined',
            message: `${otherUserType} has joined the video call`,
          });
        }
      });

      // Listen for call end notifications
      this.socket.on('call-ended', (data: {
        callId: string;
        reason?: string;
      }) => {
        console.log('Call ended notification:', data);
        
        NotificationManager.showNotification({
          type: 'video-call-ended',
          title: 'Call Ended',
          message: data.reason || 'The video consultation has ended.',
        });
      });

      // Listen for appointment booking notifications
      this.socket.on('appointment-booked', (data: {
        appointmentId: string;
        doctorName: string;
        patientName: string;
        date: string;
        time: string;
      }) => {
        console.log('Appointment booked notification:', data);
        
        const notificationData: NotificationData = {
          type: 'appointment-booked',
          title: 'Appointment Booked',
          message: this.userType === 'patient'
            ? `Your appointment with Dr. ${data.doctorName} is booked for ${data.date} at ${data.time}`
            : `New appointment booked by ${data.patientName} for ${data.date} at ${data.time}`,
          appointmentId: data.appointmentId,
        };

        NotificationManager.showNotification(notificationData);
        NotificationManager.showBrowserNotification(
          notificationData.title,
          notificationData.message
        );
      });

      this.socket.on('error', (error: any) => {
        console.error('Notification socket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect notification service:', error);
    }
  }

  // Method to request a video call
  public requestVideoCall(data: {
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    specialization: string;
  }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request-video-call', data);
    }
  }

  // Method to accept a video call (for doctors)
  public acceptVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('accept-video-call', { callId });
    }
  }

  // Method to reject a video call (for doctors)
  public rejectVideoCall(callId: string, reason?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('reject-video-call', { callId, reason });
    }
  }

  // Method to join a video call room
  public joinVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-video-room', { callId });
    }
  }

  // Method to leave a video call room
  public leaveVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-video-room', { callId });
    }
  }

  // Method to end a video call
  public endVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('end-video-call', { callId });
    }
  }

  // Method to notify about appointment booking
  public notifyAppointmentBooked(appointmentData: {
    appointmentId: string;
    doctorId: string;
    patientId: string;
    doctorName: string;
    patientName: string;
    date: string;
    time: string;
  }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('appointment-booked', appointmentData);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public isServiceConnected(): boolean {
    return this.isConnected;
  }

  public emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

// Global instance
let notificationService: RealTimeNotificationService | null = null;

export const initializeNotificationService = (userId: string, userType: 'doctor' | 'patient') => {
  if (notificationService) {
    notificationService.disconnect();
  }
  notificationService = new RealTimeNotificationService(userId, userType);
  return notificationService;
};

export const getNotificationService = (): RealTimeNotificationService | null => {
  return notificationService;
};
