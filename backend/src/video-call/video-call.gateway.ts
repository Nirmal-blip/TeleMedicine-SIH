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
import { NotificationsService } from '../notifications/notifications.service';

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
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
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
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Video call client connected: ${client.id}`);
    
    const userId = client.handshake.query.userId as string;
    const userType = client.handshake.query.userType as string;
    
    if (userId && userType) {
      this.connectedUsers.set(client.id, {
        userId,
        userType: userType as 'doctor' | 'patient',
        socketId: client.id,
      });
      
      console.log(`🔥 BACKEND: User ${userId} (${userType}) connected for video calls`);
      console.log(`📊 BACKEND: Total connected users: ${this.connectedUsers.size}`);
    } else {
      console.log(`❌ BACKEND: Invalid connection - missing userId or userType`);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Video call client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('request-video-call')
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
      console.log(`🔍 BACKEND: Looking for doctor with ID: ${data.doctorId}`);
      console.log(`👥 BACKEND: Connected users:`, Array.from(this.connectedUsers.values()));

      // Find doctor's socket connections
      const doctorSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === data.doctorId && user.userType === 'doctor')
        .map(([socketId, _]) => socketId);

      console.log(`🔌 BACKEND: Found ${doctorSockets.length} doctor socket(s) for ID ${data.doctorId}`);

      if (doctorSockets.length === 0) {
        console.log(`❌ BACKEND: Doctor not available online`);
        client.emit('call-error', { message: 'Doctor is not available online' });
        this.activeCalls.delete(callId);
        return;
      }

      // Create database notification for the doctor
      try {
        await this.notificationsService.createNotification({
          doctorId: data.doctorId,
          recipientType: 'Doctor',
          senderPatientId: data.patientId,
          senderType: 'Patient',
          title: 'Incoming Video Call Request',
          message: `${data.patientName} is requesting a video consultation for ${data.specialization}`,
          type: 'video_call_request',
          priority: 'High',
          actionUrl: `/doctor/dashboard`,
          actionText: 'Answer Call',
          metadata: {
            callId,
            patientName: data.patientName,
            specialization: data.specialization,
            requestedAt: new Date().toISOString()
          }
        });
        console.log(`✅ Notification created for doctor ${data.doctorId}`);
      } catch (error) {
        console.error('Failed to create notification:', error);
      }

      // Send call request notification to doctor
      doctorSockets.forEach(socketId => {
        this.server.to(socketId).emit('incoming-video-call', {
          ...videoCallRequest,
          requestedAt: new Date().toISOString()
        });
      });

      // Confirm to patient that call request was sent
      client.emit('call-request-sent', {
        callId,
        doctorName: data.doctorName,
        message: 'Call request sent to doctor. Waiting for response...'
      });

    } catch (error) {
      console.error('Error handling video call request:', error);
      client.emit('call-error', { message: 'Failed to send call request' });
    }
  }

  @SubscribeMessage('accept-video-call')
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

      // Find patient's socket connections
      const patientSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === callRequest.patientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      if (patientSockets.length === 0) {
        client.emit('call-error', { message: 'Patient is no longer available' });
        this.activeCalls.delete(data.callId);
        return;
      }

      // Create notification for patient about call acceptance
      try {
        await this.notificationsService.createNotification({
          patientId: callRequest.patientId,
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
        console.log(`✅ Acceptance notification created for patient ${callRequest.patientId}`);
      } catch (error) {
        console.error('Failed to create acceptance notification:', error);
      }

      // Notify patient that doctor accepted the call
      patientSockets.forEach(socketId => {
        this.server.to(socketId).emit('call-accepted', {
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

  @SubscribeMessage('reject-video-call')
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

      // Find patient's socket connections
      const patientSockets = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === callRequest.patientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      // Create notification for patient about call rejection
      try {
        await this.notificationsService.createNotification({
          patientId: callRequest.patientId,
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
        console.log(`✅ Rejection notification created for patient ${callRequest.patientId}`);
      } catch (error) {
        console.error('Failed to create rejection notification:', error);
      }

      // Notify patient that doctor rejected the call
      if (patientSockets.length > 0) {
        patientSockets.forEach(socketId => {
          this.server.to(socketId).emit('call-rejected', {
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

  // Utility method for debugging
  @SubscribeMessage('get-active-calls')
  handleGetActiveCalls(@ConnectedSocket() client: Socket) {
    const calls = Array.from(this.activeCalls.values());
    client.emit('active-calls', calls);
  }
}
