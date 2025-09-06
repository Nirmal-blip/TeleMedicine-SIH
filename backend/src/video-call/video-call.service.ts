import { Injectable } from '@nestjs/common';

export interface VideoCallSession {
  callId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  status: 'pending' | 'active' | 'ended' | 'rejected';
  startTime: Date;
  endTime?: Date;
  participants: Array<{
    userId: string;
    userType: 'doctor' | 'patient';
    joinTime: Date;
    leaveTime?: Date;
  }>;
}

@Injectable()
export class VideoCallService {
  private videoCallSessions = new Map<string, VideoCallSession>();

  createVideoCallSession(data: {
    callId: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    specialization: string;
  }): VideoCallSession {
    const session: VideoCallSession = {
      ...data,
      status: 'pending',
      startTime: new Date(),
      participants: []
    };

    this.videoCallSessions.set(data.callId, session);
    console.log(`✅ Video call session created: ${data.callId}`);
    
    return session;
  }

  getVideoCallSession(callId: string): VideoCallSession | undefined {
    return this.videoCallSessions.get(callId);
  }

  updateSessionStatus(callId: string, status: VideoCallSession['status']): boolean {
    const session = this.videoCallSessions.get(callId);
    if (session) {
      session.status = status;
      if (status === 'ended') {
        session.endTime = new Date();
      }
      return true;
    }
    return false;
  }

  addParticipant(callId: string, userId: string, userType: 'doctor' | 'patient'): boolean {
    const session = this.videoCallSessions.get(callId);
    if (session) {
      // Remove existing participant entry if reconnecting
      session.participants = session.participants.filter(p => p.userId !== userId);
      
      // Add new participant entry
      session.participants.push({
        userId,
        userType,
        joinTime: new Date()
      });

      // Update session status to active if both doctor and patient joined
      const hasDoctor = session.participants.some(p => p.userType === 'doctor' && !p.leaveTime);
      const hasPatient = session.participants.some(p => p.userType === 'patient' && !p.leaveTime);
      
      if (hasDoctor && hasPatient && session.status === 'pending') {
        session.status = 'active';
      }

      return true;
    }
    return false;
  }

  removeParticipant(callId: string, userId: string): boolean {
    const session = this.videoCallSessions.get(callId);
    if (session) {
      const participant = session.participants.find(p => p.userId === userId && !p.leaveTime);
      if (participant) {
        participant.leaveTime = new Date();
      }
      return true;
    }
    return false;
  }

  endVideoCallSession(callId: string): boolean {
    const session = this.videoCallSessions.get(callId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      
      // Mark all active participants as left
      session.participants.forEach(participant => {
        if (!participant.leaveTime) {
          participant.leaveTime = new Date();
        }
      });

      console.log(`✅ Video call session ended: ${callId}`);
      return true;
    }
    return false;
  }

  getAllActiveSessions(): VideoCallSession[] {
    return Array.from(this.videoCallSessions.values())
      .filter(session => session.status === 'active' || session.status === 'pending');
  }

  getSessionsForUser(userId: string): VideoCallSession[] {
    return Array.from(this.videoCallSessions.values())
      .filter(session => 
        session.doctorId === userId || 
        session.patientId === userId
      );
  }

  deleteSession(callId: string): boolean {
    return this.videoCallSessions.delete(callId);
  }
}
