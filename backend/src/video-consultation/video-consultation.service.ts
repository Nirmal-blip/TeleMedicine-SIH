import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface CallSession {
  callId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'ended' | 'cancelled';
  participants: {
    userId: string;
    userType: 'doctor' | 'patient';
    joinedAt?: Date;
    leftAt?: Date;
  }[];
}

@Injectable()
export class VideoConsultationService {
  private activeCalls = new Map<string, CallSession>();

  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<any>,
    @InjectModel('Doctor') private doctorModel: Model<any>,
    @InjectModel('Patient') private patientModel: Model<any>,
  ) {}

  async createCallSession(appointmentId: string, doctorId: string, patientId: string): Promise<string> {
    // Verify the appointment exists and belongs to the doctor and patient
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('doctor')
      .populate('patient');

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.doctor._id.toString() !== doctorId || appointment.patient._id.toString() !== patientId) {
      throw new Error('Invalid appointment access');
    }

    // Generate unique call ID
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create call session
    const callSession: CallSession = {
      callId,
      appointmentId,
      doctorId,
      patientId,
      startTime: new Date(),
      status: 'active',
      participants: [
        { userId: doctorId, userType: 'doctor' },
        { userId: patientId, userType: 'patient' },
      ],
    };

    this.activeCalls.set(callId, callSession);

    // Update appointment status to indicate call has started
    await this.appointmentModel.findByIdAndUpdate(appointmentId, {
      status: 'In Progress',
      callId,
      callStartTime: new Date(),
    });

    return callId;
  }

  async endCallSession(callId: string, userId: string): Promise<void> {
    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      throw new Error('Call session not found');
    }

    // Mark the call as ended
    callSession.status = 'ended';
    callSession.endTime = new Date();

    // Update participant left time
    const participant = callSession.participants.find(p => p.userId === userId);
    if (participant) {
      participant.leftAt = new Date();
    }

    // Update appointment status
    await this.appointmentModel.findById(callSession.appointmentId).then(appointment => {
      if (appointment) {
        appointment.status = 'Completed';
        appointment.callEndTime = new Date();
        appointment.duration = Math.round(
          (callSession.endTime!.getTime() - callSession.startTime.getTime()) / (1000 * 60)
        ); // Duration in minutes
        return appointment.save();
      }
    });

    // Remove from active calls after a delay to allow cleanup
    setTimeout(() => {
      this.activeCalls.delete(callId);
    }, 5000);
  }

  async getCallSession(callId: string): Promise<CallSession | null> {
    return this.activeCalls.get(callId) || null;
  }

  async getActiveCallsForUser(userId: string): Promise<CallSession[]> {
    return Array.from(this.activeCalls.values()).filter(call =>
      call.participants.some(p => p.userId === userId) && call.status === 'active'
    );
  }

  async getUpcomingAppointmentsForCall(userId: string, userType: 'doctor' | 'patient'): Promise<any[]> {
    const query: any = { status: 'Scheduled' };
    const populateFields = userType === 'doctor' ? 'patient' : 'doctor';
    
    if (userType === 'doctor') {
      query.doctor = userId;
    } else {
      query.patient = userId;
    }

    // Get today's and future appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.date = { $gte: today };

    return this.appointmentModel
      .find(query)
      .populate(populateFields)
      .sort({ date: 1, time: 1 })
      .exec();
  }

  async updateAppointmentCallStatus(appointmentId: string, status: string, callData?: any): Promise<void> {
    const updateData: any = { status };
    
    if (callData) {
      Object.assign(updateData, callData);
    }

    await this.appointmentModel.findByIdAndUpdate(appointmentId, updateData);
  }

  async getCallHistory(userId: string, userType: 'doctor' | 'patient'): Promise<any[]> {
    const query: any = { 
      status: 'Completed',
      callId: { $exists: true }
    };
    
    if (userType === 'doctor') {
      query.doctor = userId;
    } else {
      query.patient = userId;
    }

    const populateField = userType === 'doctor' ? 'patient' : 'doctor';

    return this.appointmentModel
      .find(query)
      .populate(populateField)
      .sort({ callEndTime: -1 })
      .exec();
  }

  // Utility method to clean up old inactive calls
  async cleanupInactiveCalls(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [callId, session] of this.activeCalls.entries()) {
      if (session.startTime < cutoffTime && session.status === 'active') {
        session.status = 'ended';
        session.endTime = new Date();
        this.activeCalls.delete(callId);
      }
    }
  }
}
