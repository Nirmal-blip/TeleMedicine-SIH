import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';

export interface CallSession {
  callId: string;
  appointmentId?: string;
  participants: Array<{
    userId: string;
    userType: 'doctor' | 'patient';
    socketId: string;
    joinTime: Date;
  }>;
  startTime: Date;
  endTime?: Date;
  status: 'waiting' | 'active' | 'ended';
  doctorId?: string;
  patientId?: string;
}

@Injectable()
export class VideoConsultationService {
  private activeCalls = new Map<string, CallSession>();

  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async createCallSession(callId: string, appointmentId?: string): Promise<CallSession> {
    const callSession: CallSession = {
      callId,
      appointmentId,
      participants: [],
      startTime: new Date(),
      status: 'waiting',
    };

    // If appointment ID provided, get appointment details
    if (appointmentId) {
      try {
        const appointment = await this.appointmentModel
          .findById(appointmentId)
          .populate('doctor')
          .populate('patient')
          .exec();

        if (appointment) {
          callSession.doctorId = appointment.doctor.toString();
          callSession.patientId = appointment.patient.toString();
          
          // Update appointment with call information
          await this.appointmentModel.findByIdAndUpdate(appointmentId, {
            callId,
            callStartTime: new Date(),
            status: 'In Progress',
            isVideoConsultation: true,
          });
        }
      } catch (error) {
        console.error('Error updating appointment for call:', error);
      }
    }

    this.activeCalls.set(callId, callSession);
    return callSession;
  }

  async endCallSession(callId: string): Promise<void> {
    const callSession = this.activeCalls.get(callId);
    if (callSession) {
      callSession.endTime = new Date();
      callSession.status = 'ended';

      // Update appointment if exists
      if (callSession.appointmentId) {
        try {
          const duration = Math.round((callSession.endTime.getTime() - callSession.startTime.getTime()) / 60000); // in minutes
          
          await this.appointmentModel.findByIdAndUpdate(callSession.appointmentId, {
            callEndTime: callSession.endTime,
            duration,
            status: 'Completed',
          });
        } catch (error) {
          console.error('Error updating appointment after call end:', error);
        }
      }

      this.activeCalls.delete(callId);
    }
  }

  addParticipant(callId: string, userId: string, userType: 'doctor' | 'patient', socketId: string): boolean {
    const callSession = this.activeCalls.get(callId);
    if (callSession) {
      // Remove existing participant with same userId (reconnection case)
      callSession.participants = callSession.participants.filter(p => p.userId !== userId);
      
      // Add new participant
      callSession.participants.push({
        userId,
        userType,
        socketId,
        joinTime: new Date(),
      });

      // Update call status if both participants are present
      if (callSession.participants.length >= 2 || 
          (callSession.participants.length === 1 && callSession.status === 'waiting')) {
        callSession.status = 'active';
      }

      return true;
    }
    return false;
  }

  removeParticipant(callId: string, userId: string): boolean {
    const callSession = this.activeCalls.get(callId);
    if (callSession) {
      callSession.participants = callSession.participants.filter(p => p.userId !== userId);
      
      // End call if no participants left
      if (callSession.participants.length === 0) {
        this.endCallSession(callId);
      }
      
      return true;
    }
    return false;
  }

  getCallSession(callId: string): CallSession | undefined {
    return this.activeCalls.get(callId);
  }

  getActiveCallsForUser(userId: string): CallSession[] {
    return Array.from(this.activeCalls.values()).filter(call =>
      call.participants.some(p => p.userId === userId)
    );
  }

  getAllActiveCalls(): CallSession[] {
    return Array.from(this.activeCalls.values());
  }

  async getUpcomingAppointmentsForCall(userId: string, userType: 'doctor' | 'patient'): Promise<any[]> {
    try {
      const query = userType === 'doctor' ? { doctor: userId } : { patient: userId };
      
      const appointments = await this.appointmentModel
        .find({
          ...query,
          status: { $in: ['Confirmed', 'Pending'] },
          date: { $gte: new Date() },
        })
        .populate('doctor', 'fullname specialization')
        .populate('patient', 'fullname')
        .sort({ date: 1, time: 1 })
        .exec();

      return appointments;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }

  async getCallHistory(userId: string, userType: 'doctor' | 'patient'): Promise<any[]> {
    try {
      const query = userType === 'doctor' ? { doctor: userId } : { patient: userId };
      
      const appointments = await this.appointmentModel
        .find({
          ...query,
          status: 'Completed',
          callId: { $exists: true, $ne: null },
        })
        .populate('doctor', 'fullname specialization')
        .populate('patient', 'fullname')
        .sort({ callEndTime: -1 })
        .exec();

      return appointments;
    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }

  async startCallForAppointment(appointmentId: string, patientId: string): Promise<{ callId: string; success: boolean }> {
    try {
      const appointment = await this.appointmentModel.findById(appointmentId);
      if (!appointment) {
        return { callId: '', success: false };
      }

      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create call session
      await this.createCallSession(callId, appointmentId);
      
      return { callId, success: true };
    } catch (error) {
      console.error('Error starting call for appointment:', error);
      return { callId: '', success: false };
    }
  }

  async getAppointmentDetails(appointmentId: string): Promise<any> {
    try {
      const appointment = await this.appointmentModel
        .findById(appointmentId)
        .populate('doctor', 'fullname specialization email')
        .populate('patient', 'fullname email')
        .exec();
      
      return appointment;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      return null;
    }
  }
}