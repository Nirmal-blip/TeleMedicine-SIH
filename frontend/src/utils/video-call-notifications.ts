import { io, Socket } from 'socket.io-client';

export interface VideoCallRequestData {
  callId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  appointmentId?: string;
  requestedAt: string;
}

export interface VideoCallResponseData {
  callId: string;
  doctorId: string;
  message: string;
  actionUrl?: string;
  redirectTo?: string;
  reason?: string;
}

export class VideoCallNotificationService {
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
      // Connect to the video call notifications namespace
      this.socket = io('http://localhost:3000/video-call-notifications', {
        query: {
          userId: this.userId,
          userType: this.userType,
        },
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Video call notifications connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Video call notifications disconnected');
        this.isConnected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error('Video call notification socket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect video call notification service:', error);
    }
  }

  // Method to request a video call (for patients)
  public requestVideoCall(data: {
    doctorId: string;
    doctorName: string;
    patientName: string;
    specialization: string;
    appointmentId?: string;
  }) {
    if (this.socket && this.isConnected) {
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.socket.emit('request-video-call', {
        callId,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        patientId: this.userId,
        patientName: data.patientName,
        specialization: data.specialization,
        appointmentId: data.appointmentId,
      });

      return callId;
    }
    return null;
  }

  // Method to accept a video call (for doctors)
  public acceptVideoCall(callId: string, patientId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('accept-video-call', {
        callId,
        doctorId: this.userId,
        patientId,
      });
    }
  }

  // Method to reject a video call (for doctors)
  public rejectVideoCall(callId: string, patientId: string, reason?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('reject-video-call', {
        callId,
        doctorId: this.userId,
        patientId,
        reason,
      });
    }
  }

  // Event listeners
  public onIncomingVideoCall(callback: (data: VideoCallRequestData) => void) {
    if (this.socket) {
      this.socket.on('incoming-video-call', callback);
    }
  }

  public onCallAccepted(callback: (data: VideoCallResponseData) => void) {
    if (this.socket) {
      this.socket.on('call-accepted', callback);
    }
  }

  public onCallRejected(callback: (data: VideoCallResponseData) => void) {
    if (this.socket) {
      this.socket.on('call-rejected', callback);
    }
  }

  public onCallRequestSent(callback: (data: { callId: string; doctorName: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-request-sent', callback);
    }
  }

  public onCallAcceptedConfirmation(callback: (data: { callId: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-accepted-confirmation', callback);
    }
  }

  public onCallRejectedConfirmation(callback: (data: { callId: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-rejected-confirmation', callback);
    }
  }

  public onCallError(callback: (data: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-error', callback);
    }
  }

  public onNewNotification(callback: (data: { type: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
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
let videoCallNotificationService: VideoCallNotificationService | null = null;

export const initializeVideoCallNotificationService = (userId: string, userType: 'doctor' | 'patient') => {
  if (videoCallNotificationService) {
    videoCallNotificationService.disconnect();
  }
  videoCallNotificationService = new VideoCallNotificationService(userId, userType);
  return videoCallNotificationService;
};

export const getVideoCallNotificationService = (): VideoCallNotificationService | null => {
  return videoCallNotificationService;
};
