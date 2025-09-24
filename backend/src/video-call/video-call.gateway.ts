import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';

interface UserConnection {
  userId: string;
  userType: 'doctor' | 'patient';
  socketId: string;
}

interface VideoCallRequest {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  callId: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:3001', 
      'http://localhost:3000',
      'https://telemedicine-sih-frontend.vercel.app',
      'https://telemedicine-sih-8i5h.onrender.com'
    ],
    credentials: true,
  },
  namespace: '/video-call',
  transports: ['websocket', 'polling'],
})
export class VideoCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UserConnection>();
  private activeCalls = new Map<string, VideoCallRequest>();

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`🔌 BACKEND: Video call client connected: ${client.id}`);
    console.log(`🔍 BACKEND: Connection query:`, client.handshake.query);
    console.log(`🔍 BACKEND: Connection headers:`, client.handshake.headers);
    console.log(`🔍 BACKEND: Connection origin:`, client.handshake.headers.origin);
    
    const userId = client.handshake.query.userId as string;
    const userType = client.handshake.query.userType as string;
    
    if (userId && userType && userId !== 'undefined') {
      // If it's a doctor, handle both MongoDB ObjectId and custom doctorId
      if (userType === 'doctor') {
        try {
          let doctor;
          let customDoctorId;
          
          // Check if userId is a MongoDB ObjectId (24 hex characters) or custom doctorId
          if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId
            doctor = await this.doctorModel.findById(userId);
            if (doctor && doctor.doctorId) {
              customDoctorId = doctor.doctorId;
            } else {
              console.log(`❌ BACKEND: Doctor ${userId} not found or missing doctorId`);
              return;
            }
          } else {
            // It's a custom doctorId, find doctor by doctorId field
            doctor = await this.doctorModel.findOne({ doctorId: userId });
            if (doctor) {
              customDoctorId = doctor.doctorId;
            } else {
              console.log(`❌ BACKEND: Doctor with custom ID ${userId} not found`);
              return;
            }
          }
          
          this.connectedUsers.set(client.id, {
            userId: customDoctorId, // Store custom doctorId
            userType: userType as 'doctor' | 'patient',
            socketId: client.id,
          });
          console.log(`✅ BACKEND: Doctor ${doctor.fullname} connected with custom ID ${customDoctorId} (Input: ${userId})`);
        } catch (error) {
          console.error('❌ BACKEND: Error fetching doctor:', error);
          return;
        }
      } else if (userType === 'patient') {
        // If it's a patient, handle both MongoDB ObjectId and custom patientId
        try {
          let patient;
          let customPatientId;
          
          // Check if userId is a MongoDB ObjectId (24 hex characters) or custom patientId
          if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId
            patient = await this.patientModel.findById(userId);
            if (patient && patient.patientId) {
              customPatientId = patient.patientId;
            } else {
              console.log(`❌ BACKEND: Patient ${userId} not found or missing patientId`);
              return;
            }
          } else {
            // It's a custom patientId, find patient by patientId field
            patient = await this.patientModel.findOne({ patientId: userId });
            if (patient) {
              customPatientId = patient.patientId;
            } else {
              console.log(`❌ BACKEND: Patient with custom ID ${userId} not found`);
              return;
            }
          }
          
          this.connectedUsers.set(client.id, {
            userId: customPatientId, // Store custom patientId
            userType: userType as 'doctor' | 'patient',
            socketId: client.id,
          });
          console.log(`✅ BACKEND: Patient ${patient.fullname} connected with custom ID ${customPatientId} (Input: ${userId})`);
        } catch (error) {
          console.error('❌ BACKEND: Error fetching patient:', error);
          return;
        }
      }
      
      console.log(`📊 BACKEND: Total connected users: ${this.connectedUsers.size}`);
      console.log(`👥 BACKEND: All connected users:`, Array.from(this.connectedUsers.values()));
    } else {
      console.log(`❌ BACKEND: Invalid connection - missing userId (${userId}) or userType (${userType}), or userId is undefined`);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Video call client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('patient:call-doctor')
  async handleRequestVideoCall(
    @MessageBody() data: Omit<VideoCallRequest, 'callId'>,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'patient') {
      client.emit('error', 'Unauthorized: Only patients can request video calls');
      return;
    }

    try {
      // Generate unique call ID
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const videoCallRequest: VideoCallRequest = {
        ...data,
        callId
      };

      // Store the call request
      this.activeCalls.set(callId, videoCallRequest);

      console.log(`🔥 BACKEND: Patient ${data.patientName} requesting video call with doctor ${data.doctorName}`);
      console.log(`🔍 BACKEND: Looking for doctor with MongoDB ID: ${data.doctorId}`);
      console.log(`👥 BACKEND: Connected users:`, Array.from(this.connectedUsers.values()));

      // First, get the doctor's custom doctorId from MongoDB ObjectId
      let targetDoctorId = data.doctorId;
      try {
        const doctor = await this.doctorModel.findById(data.doctorId).select('doctorId');
        if (doctor && doctor.doctorId) {
          targetDoctorId = doctor.doctorId;
          console.log(`🆔 BACKEND: Converted MongoDB ID ${data.doctorId} to custom doctorId ${targetDoctorId}`);
        } else {
          console.log(`❌ BACKEND: Could not find custom doctorId for MongoDB ID ${data.doctorId}`);
        }
      } catch (error) {
        console.error('❌ BACKEND: Error fetching doctor for ID conversion:', error);
      }

      // Find doctor's socket connections using custom doctorId
      const doctorSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === targetDoctorId && user.userType === 'doctor')
        .map(([socketId, _]) => socketId);

      console.log(`🔌 BACKEND: Found ${doctorSockets.length} doctor socket(s) for custom ID ${targetDoctorId}`);

      // Always send real-time notification to all connected doctor sockets
      if (doctorSockets.length > 0) {
        console.log(`📡 BACKEND: Sending real-time notification to ${doctorSockets.length} doctor socket(s)`);
        doctorSockets.forEach(socketId => {
          this.server.to(socketId).emit('doctor:incoming-call', {
            ...videoCallRequest,
            requestedAt: new Date().toISOString()
          });
        });
      } else {
        console.log(`📝 BACKEND: Doctor not connected via socket, creating notification only`);
        // The doctor will see the notification when they check their notifications page
      }

      // Get custom IDs for notification
      let customDoctorId = data.doctorId;
      let customPatientId = data.patientId;
      
      try {
        // Get doctor's custom ID
        const doctor = await this.doctorModel.findById(data.doctorId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customDoctorId = doctor.doctorId;
        }
        
        // Get patient's custom ID  
        const patient = await this.patientModel.findById(data.patientId).select('patientId');
        if (patient && patient.patientId) {
          customPatientId = patient.patientId;
        }
        
        console.log(`🆔 ID Conversion: Doctor ${data.doctorId} -> ${customDoctorId}, Patient ${data.patientId} -> ${customPatientId}`);
      } catch (idError) {
        console.error('Error fetching custom IDs:', idError);
      }

      // Create database notification for the doctor
      try {
        await this.notificationsService.createNotification({
          doctorId: customDoctorId,
          recipientType: 'Doctor',
          senderPatientId: customPatientId,
          senderType: 'Patient',
          title: '📹 Video Call Request',
          message: `${data.patientName} is requesting a video consultation for ${data.specialization}`,
          type: 'video_call_request',
          priority: 'High',
          actionUrl: `/doctor/video-consultation`,
          actionText: 'Answer Call',
          metadata: {
            callId,
            patientName: data.patientName,
            doctorName: data.doctorName,
            specialization: data.specialization,
            requestedAt: new Date().toISOString()
          }
        });
        console.log(`✅ Notification created for doctor ${customDoctorId} (MongoDB: ${data.doctorId})`);
      } catch (error) {
        console.error('Failed to create notification:', error);
      }

      // Confirm to patient that call request was sent
      client.emit('patient:call-request-sent', {
        callId,
        doctorName: data.doctorName,
        message: doctorSockets.length > 0 
          ? 'Call request sent to doctor. Waiting for response...'
          : 'Call request saved. Doctor will be notified when they come online.'
      });

    } catch (error) {
      console.error('Error handling video call request:', error);
      client.emit('call-error', { message: 'Failed to send call request' });
    }
  }

  @SubscribeMessage('doctor:accept-call')
  async handleAcceptVideoCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'doctor') {
      client.emit('error', 'Unauthorized: Only doctors can accept calls');
      return;
    }

    try {
      const callRequest = this.activeCalls.get(data.callId);
      if (!callRequest) {
        client.emit('call-error', { message: 'Call request not found' });
        return;
      }

      console.log(`Doctor ${userInfo.userId} accepting call ${data.callId}`);

      // Convert patient MongoDB ObjectId to custom patientId for socket lookup
      let targetPatientId = callRequest.patientId;
      try {
        const patient = await this.patientModel.findById(callRequest.patientId).select('patientId');
        if (patient && patient.patientId) {
          targetPatientId = patient.patientId;
          console.log(`🆔 BACKEND: Converted patient MongoDB ID ${callRequest.patientId} to custom patientId ${targetPatientId}`);
        } else {
          console.log(`❌ BACKEND: Could not find custom patientId for MongoDB ID ${callRequest.patientId}`);
        }
      } catch (error) {
        console.error('❌ BACKEND: Error fetching patient for ID conversion:', error);
      }

      // Find patient's socket connections using custom patientId
      const patientSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === targetPatientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      console.log(`🔌 BACKEND: Found ${patientSockets.length} patient socket(s) for custom ID ${targetPatientId}`);

      if (patientSockets.length === 0) {
        client.emit('call-error', { message: 'Patient is no longer available' });
        this.activeCalls.delete(data.callId);
        return;
      }

      // Create notification for patient about call acceptance
      try {
        await this.notificationsService.createNotification({
          patientId: targetPatientId,
          recipientType: 'Patient',
          senderDoctorId: callRequest.doctorId,
          senderType: 'Doctor',
          title: 'Video Call Accepted',
          message: `Dr. ${callRequest.doctorName} has joined your video call`,
          type: 'video_call_accepted',
          priority: 'High',
          actionUrl: `/patient/video-call/${data.callId}`,
          actionText: 'Join Call',
          metadata: {
            callId: data.callId,
            acceptedAt: new Date().toISOString()
          }
        });
        console.log(`✅ Acceptance notification created for patient ${targetPatientId}`);
      } catch (error) {
        console.error('Failed to create acceptance notification:', error);
      }

      // Notify patient that doctor accepted the call
      patientSockets.forEach(socketId => {
        this.server.to(socketId).emit('patient:call-accepted', {
          callId: data.callId,
          doctorId: callRequest.doctorId,
          doctorName: callRequest.doctorName,
          message: 'Doctor has joined the call',
          videoCallUrl: `/patient/video-call/${data.callId}`
        });
      });

      // Confirm to doctor that call was accepted
      client.emit('call-accepted-confirmation', {
        callId: data.callId,
        message: 'Call accepted successfully',
        videoCallUrl: `/doctor/video-call/${data.callId}`
      });

      // Keep the call active for video room management
      console.log(`✅ Video call ${data.callId} is now active`);

    } catch (error) {
      console.error('Error handling call acceptance:', error);
      client.emit('call-error', { message: 'Failed to accept call' });
    }
  }

  @SubscribeMessage('doctor:reject-call')
  async handleRejectVideoCall(
    @MessageBody() data: { callId: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'doctor') {
      client.emit('error', 'Unauthorized: Only doctors can reject calls');
      return;
    }

    try {
      const callRequest = this.activeCalls.get(data.callId);
      if (!callRequest) {
        client.emit('call-error', { message: 'Call request not found' });
        return;
      }

      console.log(`Doctor ${userInfo.userId} rejecting call ${data.callId}`);

      // Convert patient MongoDB ObjectId to custom patientId for socket lookup
      let targetPatientId = callRequest.patientId;
      try {
        const patient = await this.patientModel.findById(callRequest.patientId).select('patientId');
        if (patient && patient.patientId) {
          targetPatientId = patient.patientId;
          console.log(`🆔 BACKEND: Converted patient MongoDB ID ${callRequest.patientId} to custom patientId ${targetPatientId}`);
        } else {
          console.log(`❌ BACKEND: Could not find custom patientId for MongoDB ID ${callRequest.patientId}`);
        }
      } catch (error) {
        console.error('❌ BACKEND: Error fetching patient for ID conversion:', error);
      }

      // Find patient's socket connections using custom patientId
      const patientSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === targetPatientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      console.log(`🔌 BACKEND: Found ${patientSockets.length} patient socket(s) for custom ID ${targetPatientId}`);

      // Create notification for patient about call rejection
      try {
        await this.notificationsService.createNotification({
          patientId: targetPatientId,
          recipientType: 'Patient',
          senderDoctorId: callRequest.doctorId,
          senderType: 'Doctor',
          title: 'Video Call Declined',
          message: data.reason || 'Doctor is not available at the moment. Please try again later.',
          type: 'video_call_rejected',
          priority: 'Medium',
          actionUrl: '/patient/doctors',
          actionText: 'Find Another Doctor',
          metadata: {
            callId: data.callId,
            rejectedAt: new Date().toISOString(),
            reason: data.reason
          }
        });
        console.log(`✅ Rejection notification created for patient ${targetPatientId}`);
      } catch (error) {
        console.error('Failed to create rejection notification:', error);
      }

      // Notify patient that doctor rejected the call
      if (patientSockets.length > 0) {
        patientSockets.forEach(socketId => {
          this.server.to(socketId).emit('patient:call-rejected', {
            callId: data.callId,
            doctorId: callRequest.doctorId,
            doctorName: callRequest.doctorName,
            reason: data.reason || 'Doctor is not available',
            message: 'Doctor declined the call'
          });
        });
      }

      // Confirm to doctor that call was rejected
      client.emit('call-rejected-confirmation', {
        callId: data.callId,
        message: 'Call rejected successfully'
      });

      // Remove the call request
      this.activeCalls.delete(data.callId);

    } catch (error) {
      console.error('Error handling call rejection:', error);
      client.emit('call-error', { message: 'Failed to reject call' });
    }
  }

  @SubscribeMessage('join-video-room')
  async handleJoinVideoRoom(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) {
      client.emit('error', 'User not authenticated');
      return;
    }

    const callRequest = this.activeCalls.get(data.callId);
    if (!callRequest) {
      client.emit('call-error', { message: 'Call not found' });
      return;
    }

    // Join the video room
    await client.join(data.callId);
    
    console.log(`User ${userInfo.userId} (${userInfo.userType}) joined video room ${data.callId}`);

    // Notify others in the room
    client.to(data.callId).emit('user-joined-room', {
      userId: userInfo.userId,
      userType: userInfo.userType,
      joinedAt: new Date().toISOString()
    });

    // Confirm to user
    client.emit('joined-video-room', {
      callId: data.callId,
      message: 'Successfully joined video call'
    });
  }

  @SubscribeMessage('leave-video-room')
  async handleLeaveVideoRoom(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    await client.leave(data.callId);
    
    console.log(`User ${userInfo.userId} left video room ${data.callId}`);

    // Notify others in the room
    client.to(data.callId).emit('user-left-room', {
      userId: userInfo.userId,
      userType: userInfo.userType,
      leftAt: new Date().toISOString()
    });
  }

  @SubscribeMessage('end-video-call')
  async handleEndVideoCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    const callRequest = this.activeCalls.get(data.callId);
    if (callRequest) {
      // Notify all participants that call ended
      this.server.to(data.callId).emit('call-ended', {
        callId: data.callId,
        endedBy: userInfo.userId,
        userType: userInfo.userType,
        endedAt: new Date().toISOString()
      });

      // Remove the call
      this.activeCalls.delete(data.callId);
      
      console.log(`Video call ${data.callId} ended by ${userInfo.userType} ${userInfo.userId}`);
    }
  }

  @SubscribeMessage('webrtc:participant-ready')
  async handleParticipantReady(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    console.log(`📢 WebRTC: ${userInfo.userType} ${userInfo.userId} is ready for call ${data.callId}`);
    console.log(`📢 WebRTC: Broadcasting participant ready to room ${data.callId}`);

    // Broadcast participant ready signal to other participants in the room
    client.to(data.callId).emit('webrtc:participant-ready', {
      callId: data.callId
    });
    
    console.log(`📢 WebRTC: Participant ready signal broadcasted to room ${data.callId}`);
  }

  @SubscribeMessage('webrtc:offer')
  async handleWebRTCOffer(
    @MessageBody() data: { callId: string; offer: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    console.log(`📤 WebRTC: ${userInfo.userType} ${userInfo.userId} sending offer for call ${data.callId}`);
    console.log(`📤 WebRTC: Forwarding offer to room ${data.callId}`);

    // Forward offer to other participants in the room
    client.to(data.callId).emit('webrtc:offer', {
      callId: data.callId,
      offer: data.offer
    });
    
    console.log(`📤 WebRTC: Offer forwarded to room ${data.callId}`);
  }

  @SubscribeMessage('webrtc:answer')
  async handleWebRTCAnswer(
    @MessageBody() data: { callId: string; answer: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    console.log(`📤 WebRTC: ${userInfo.userType} ${userInfo.userId} sending answer for call ${data.callId}`);
    console.log(`📤 WebRTC: Forwarding answer to room ${data.callId}`);

    // Forward answer to other participants in the room
    client.to(data.callId).emit('webrtc:answer', {
      callId: data.callId,
      answer: data.answer
    });
    
    console.log(`📤 WebRTC: Answer forwarded to room ${data.callId}`);
  }

  @SubscribeMessage('webrtc:ice-candidate')
  async handleWebRTCIceCandidate(
    @MessageBody() data: { callId: string; candidate: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    console.log(`🧊 WebRTC: ${userInfo.userType} ${userInfo.userId} sending ICE candidate for call ${data.callId}`);

    // Forward ICE candidate to other participants in the room
    client.to(data.callId).emit('webrtc:ice-candidate', {
      callId: data.callId,
      candidate: data.candidate
    });
  }
}
