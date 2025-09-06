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

interface UserInfo {
  userId: string;
  userType: 'doctor' | 'patient';
  socketId: string;
}

interface VideoCallRequest {
  callId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;
  appointmentId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/video-call-notifications',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class VideoCallNotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UserInfo>();

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Video call notification client connected: ${client.id}`);
    
    // Extract user info from query params
    const userId = client.handshake.query.userId as string;
    const userType = client.handshake.query.userType as string;
    
    if (userId && userType) {
      this.connectedUsers.set(client.id, {
        userId,
        userType: userType as 'doctor' | 'patient',
        socketId: client.id,
      });
      
      console.log(`User ${userId} (${userType}) connected for video call notifications`);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Video call notification client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('request-video-call')
  async handleRequestVideoCall(
    @MessageBody() data: VideoCallRequest,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'patient') {
      client.emit('error', 'Unauthorized: Only patients can request video calls');
      return;
    }

    try {
      console.log(`Patient ${data.patientName} requesting video call with doctor ${data.doctorName}`);

      // Find doctor's socket connection
      const doctorSocketIds = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === data.doctorId && user.userType === 'doctor')
        .map(([socketId, _]) => socketId);

      if (doctorSocketIds.length === 0) {
        client.emit('call-error', { message: 'Doctor is not available online' });
        return;
      }

      // Create database notification for the doctor
      try {
        await this.notificationsService.createNotification({
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
      } catch (error) {
        console.error('Failed to create notification:', error);
      }

      // Send incoming call notification to doctor
      doctorSocketIds.forEach(socketId => {
        this.server.to(socketId).emit('incoming-video-call', {
          callId: data.callId,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          patientId: data.patientId,
          patientName: data.patientName,
          specialization: data.specialization,
          appointmentId: data.appointmentId,
          requestedAt: new Date().toISOString()
        });

        // Also emit a notification update event to refresh the notifications page
        this.server.to(socketId).emit('new-notification', {
          type: 'video_call_request',
          message: 'New video call request received'
        });
      });

      // Confirm to patient that call request was sent
      client.emit('call-request-sent', {
        callId: data.callId,
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
    @MessageBody() data: { callId: string; doctorId: string; patientId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'doctor') {
      client.emit('error', 'Unauthorized: Only doctors can accept calls');
      return;
    }

    try {
      console.log(`Doctor ${data.doctorId} accepting call ${data.callId}`);

      // Find patient's socket connection
      const patientSocketIds = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === data.patientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      if (patientSocketIds.length === 0) {
        client.emit('call-error', { message: 'Patient is not available online' });
        return;
      }

      // Create notification for patient about call acceptance
      try {
        await this.notificationsService.createNotification({
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
      } catch (error) {
        console.error('Failed to create acceptance notification:', error);
      }

      // Notify patient that doctor accepted the call
      patientSocketIds.forEach(socketId => {
        this.server.to(socketId).emit('call-accepted', {
          callId: data.callId,
          doctorId: data.doctorId,
          message: 'Doctor accepted your call. Please join the video consultation.',
          actionUrl: '/video-consultation'
        });
      });

      // Confirm to doctor that call was accepted
      client.emit('call-accepted-confirmation', {
        callId: data.callId,
        message: 'Call accepted successfully. Patient has been notified.'
      });

    } catch (error) {
      console.error('Error handling call acceptance:', error);
      client.emit('call-error', { message: 'Failed to accept call' });
    }
  }

  @SubscribeMessage('reject-video-call')
  async handleRejectVideoCall(
    @MessageBody() data: { callId: string; doctorId: string; patientId: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'doctor') {
      client.emit('error', 'Unauthorized: Only doctors can reject calls');
      return;
    }

    try {
      console.log(`Doctor ${data.doctorId} rejecting call ${data.callId}`);

      // Find patient's socket connection
      const patientSocketIds = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === data.patientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      if (patientSocketIds.length > 0) {
        // Create notification for patient about call rejection
        try {
          await this.notificationsService.createNotification({
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
        } catch (error) {
          console.error('Failed to create rejection notification:', error);
        }

        // Notify patient that doctor rejected the call
        patientSocketIds.forEach(socketId => {
          this.server.to(socketId).emit('call-rejected', {
            callId: data.callId,
            doctorId: data.doctorId,
            reason: data.reason || 'Doctor is not available',
            message: 'Doctor is not available at the moment. Please try again later.',
            redirectTo: '/dashboard'
          });
        });
      }

      // Confirm to doctor that call was rejected
      client.emit('call-rejected-confirmation', {
        callId: data.callId,
        message: 'Call rejected successfully. Patient has been notified.'
      });

    } catch (error) {
      console.error('Error handling call rejection:', error);
      client.emit('call-error', { message: 'Failed to reject call' });
    }
  }

  // Utility method to get connected users for debugging
  @SubscribeMessage('get-connected-users')
  handleGetConnectedUsers(@ConnectedSocket() client: Socket) {
    const users = Array.from(this.connectedUsers.values());
    client.emit('connected-users', users);
  }
}
