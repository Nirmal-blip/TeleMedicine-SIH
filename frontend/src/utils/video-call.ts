import { io, Socket } from 'socket.io-client';

export interface VideoCallRequest {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  callId: string;
}

export interface VideoCallNotification {
  callId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  requestedAt: string;
}

export class VideoCallService {
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
      this.socket = io(`${(import.meta as any).env.VITE_BACKEND_URL}/video-call`, {
        query: {
          userId: this.userId,
          userType: this.userType,
        },
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log(`✅ FRONTEND: Video call service connected for ${this.userType} ${this.userId}`);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log(`❌ FRONTEND: Video call service disconnected for ${this.userType} ${this.userId}`);
        this.isConnected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error(`🚨 FRONTEND: Video call service error for ${this.userType} ${this.userId}:`, error);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error(`🚨 FRONTEND: Video call connection error for ${this.userType} ${this.userId}:`, error);
      });

    } catch (error) {
      console.error('Failed to connect video call service:', error);
    }
  }

  // Patient methods
  public requestVideoCall(data: {
    doctorId: string;
    doctorName: string;
    patientName: string;
    specialization: string;
  }): string | null {
    if (this.socket && this.isConnected && this.userType === 'patient') {
      const requestData = {
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        patientId: this.userId,
        patientName: data.patientName,
        specialization: data.specialization,
      };
      
      console.log('🚀 SENDING VIDEO CALL REQUEST:', requestData);
      console.log('🔌 Socket connected:', this.isConnected);
      console.log('👤 Patient ID:', this.userId);
      
      this.socket.emit('patient:call-doctor', requestData);
      return `call-${Date.now()}`;
    } else {
      console.error('❌ Cannot send video call request:', {
        hasSocket: !!this.socket,
        isConnected: this.isConnected,
        userType: this.userType
      });
    }
    return null;
  }

  // Doctor methods
  public acceptVideoCall(callId: string) {
    if (this.socket && this.isConnected && this.userType === 'doctor') {
      console.log(`🔥 DOCTOR: Accepting video call ${callId}`);
      this.socket.emit('doctor:accept-call', { callId });
    } else {
      console.error('❌ DOCTOR: Cannot accept call - socket not connected or not a doctor');
      console.error('Socket connected:', this.isConnected, 'User type:', this.userType);
    }
  }

  public rejectVideoCall(callId: string, reason?: string) {
    if (this.socket && this.isConnected && this.userType === 'doctor') {
      console.log(`❌ DOCTOR: Rejecting video call ${callId} with reason: ${reason}`);
      this.socket.emit('doctor:reject-call', { callId, reason });
    } else {
      console.error('❌ DOCTOR: Cannot reject call - socket not connected or not a doctor');
      console.error('Socket connected:', this.isConnected, 'User type:', this.userType);
    }
  }

  // Video room methods
  public joinVideoRoom(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-video-room', { callId });
    }
  }

  public leaveVideoRoom(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-video-room', { callId });
    }
  }

  public endVideoCall(callId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('end-video-call', { callId });
    }
  }

  // Event listeners for patients
  public onCallRequestSent(callback: (data: { callId: string; doctorName: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('patient:call-request-sent', callback);
    }
  }

  public onCallAccepted(callback: (data: { callId: string; doctorId: string; doctorName: string; message: string; videoCallUrl: string }) => void) {
    if (this.socket) {
      this.socket.on('patient:call-accepted', callback);
    }
  }

  public onCallRejected(callback: (data: { callId: string; doctorId: string; doctorName: string; reason: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('patient:call-rejected', callback);
    }
  }

  // Event listeners for doctors
  public onIncomingVideoCall(callback: (data: VideoCallNotification) => void) {
    if (this.socket) {
      this.socket.on('doctor:incoming-call', callback);
    }
  }

  public onCallAcceptedConfirmation(callback: (data: { callId: string; message: string; videoCallUrl: string }) => void) {
    if (this.socket) {
      this.socket.on('call-accepted-confirmation', callback);
    }
  }

  public onCallRejectedConfirmation(callback: (data: { callId: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-rejected-confirmation', callback);
    }
  }

  // Event listeners for video room
  public onJoinedVideoRoom(callback: (data: { callId: string; message: string }) => void) {
    if (this.socket) {
      this.socket.on('joined-video-room', callback);
    }
  }

  public onUserJoinedRoom(callback: (data: { userId: string; userType: string; joinedAt: string }) => void) {
    if (this.socket) {
      this.socket.on('user-joined-room', callback);
    }
  }

  public onUserLeftRoom(callback: (data: { userId: string; userType: string; leftAt: string }) => void) {
    if (this.socket) {
      this.socket.on('user-left-room', callback);
    }
  }

  public onCallEnded(callback: (data: { callId: string; endedBy: string; userType: string; endedAt: string }) => void) {
    if (this.socket) {
      this.socket.on('call-ended', callback);
    }
  }

  // General error handling
  public onCallError(callback: (data: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('call-error', callback);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Debug method to get socket for WebRTC
  public getSocket(): Socket | null {
    return this.socket;
  }

  public isServiceConnected(): boolean {
    return this.isConnected;
  }
}

// Global instance management
let videoCallService: VideoCallService | null = null;

export const initializeVideoCallService = (userId: string, userType: 'doctor' | 'patient') => {
  if (videoCallService) {
    videoCallService.disconnect();
  }
  videoCallService = new VideoCallService(userId, userType);
  return videoCallService;
};

export const getVideoCallService = (): VideoCallService | null => {
  return videoCallService;
};
