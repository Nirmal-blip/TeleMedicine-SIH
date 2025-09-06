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
      // Connect to the notification namespace
      this.socket = io('http://localhost:3000/video-consultation', {
        query: {
          userId: this.userId,
          userType: this.userType,
        },
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Real-time notifications connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Real-time notifications disconnected');
        this.isConnected = false;
      });

      // Listen for incoming call notifications
      this.socket.on('incoming-call', (data: {
        callId: string;
        appointmentId: string;
        doctorId: string;
        doctorName: string;
        patientId: string;
        patientName: string;
      }) => {
        console.log('Incoming call notification:', data);
        
        const notificationData: NotificationData = {
          type: 'video-call-request',
          title: 'Incoming Video Call',
          message: this.userType === 'patient' 
            ? `Dr. ${data.doctorName} is calling you for video consultation`
            : `Patient ${data.patientName} is requesting video consultation`,
          callId: data.callId,
          appointmentId: data.appointmentId,
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

      // Listen for call started notifications
      this.socket.on('call-started', (data: {
        callId: string;
        appointmentId: string;
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

  // Method to notify about video call requests
  public requestVideoCall(doctorId: string, patientId: string, appointmentId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('start-call', {
        appointmentId,
        patientId,
        doctorId,
      });
    }
  }

  // Method to join a video call
  public joinVideoCall(callId: string, appointmentId?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-call', {
        callId,
        appointmentId,
      });
    }
  }

  // Method to end a video call
  public endVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-call', {
        callId,
      });
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
