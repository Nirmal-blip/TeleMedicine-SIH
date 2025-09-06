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
import { VideoConsultationService } from '../video-consultation/video-consultation.service';
import { UseGuards } from '@nestjs/common';

interface CallData {
  callId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end-call' | 'join-call' | 'user-joined' | 'user-left';
  from: string;
  to: string;
  fromType: 'doctor' | 'patient';
  toType: 'doctor' | 'patient';
  appointmentId?: string;
}

interface UserInfo {
  userId: string;
  userType: 'doctor' | 'patient';
  socketId: string;
  callId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/video-consultation',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class VideoConsultationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UserInfo>();
  private activeCallRooms = new Map<string, Set<string>>();

  constructor(private readonly videoConsultationService: VideoConsultationService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user info from query params or auth headers
    const userId = client.handshake.query.userId as string;
    const userType = client.handshake.query.userType as string;
    
    if (userId && userType) {
      this.connectedUsers.set(client.id, {
        userId,
        userType: userType as 'doctor' | 'patient',
        socketId: client.id,
      });
      
      console.log(`User ${userId} (${userType}) connected with socket ${client.id}`);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo && userInfo.callId) {
      // Notify other participants that user left
      this.server.to(userInfo.callId).emit('user-left', {
        userId: userInfo.userId,
        userType: userInfo.userType,
      });
      
      // Remove from call room
      const callRoom = this.activeCallRooms.get(userInfo.callId);
      if (callRoom) {
        callRoom.delete(client.id);
        if (callRoom.size === 0) {
          this.activeCallRooms.delete(userInfo.callId);
        }
      }
    }
    
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join-call')
  async handleJoinCall(
    @MessageBody() data: { callId: string; appointmentId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) {
      client.emit('error', 'User not authenticated');
      return;
    }

    console.log(`User ${userInfo.userId} joining call ${data.callId}`);

    // Join the call room
    await client.join(data.callId);
    
    // Update user info with call ID
    userInfo.callId = data.callId;
    this.connectedUsers.set(client.id, userInfo);
    
    // Add to active call room
    if (!this.activeCallRooms.has(data.callId)) {
      this.activeCallRooms.set(data.callId, new Set());
    }
    this.activeCallRooms.get(data.callId)!.add(client.id);

    // Notify others in the call that a new user joined
    client.to(data.callId).emit('user-joined', {
      userId: userInfo.userId,
      userType: userInfo.userType,
    });

    // Send current participants to the new user
    const callRoom = this.activeCallRooms.get(data.callId);
    if (callRoom) {
      const participants = Array.from(callRoom)
        .filter(socketId => socketId !== client.id)
        .map(socketId => {
          const participantInfo = this.connectedUsers.get(socketId);
          return participantInfo ? {
            userId: participantInfo.userId,
            userType: participantInfo.userType,
          } : null;
        })
        .filter(Boolean);

      client.emit('existing-participants', participants);
    }
  }

  @SubscribeMessage('leave-call')
  async handleLeaveCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    console.log(`User ${userInfo.userId} leaving call ${data.callId}`);

    // Leave the call room
    await client.leave(data.callId);
    
    // Notify others that user left
    client.to(data.callId).emit('user-left', {
      userId: userInfo.userId,
      userType: userInfo.userType,
    });

    // Remove from tracking
    userInfo.callId = undefined;
    this.connectedUsers.set(client.id, userInfo);
    
    const callRoom = this.activeCallRooms.get(data.callId);
    if (callRoom) {
      callRoom.delete(client.id);
      if (callRoom.size === 0) {
        this.activeCallRooms.delete(data.callId);
      }
    }
  }

  @SubscribeMessage('webrtc-signal')
  async handleWebRTCSignal(
    @MessageBody() data: CallData,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) {
      client.emit('error', 'User not authenticated');
      return;
    }

    console.log(`WebRTC signal from ${userInfo.userId}: ${data.type}`);

    // Forward the signaling data to other participants in the call
    client.to(data.callId).emit('webrtc-signal', {
      ...data,
      from: userInfo.userId,
      fromType: userInfo.userType,
    });
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(
    @MessageBody() data: { callId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    // Broadcast chat message to all participants in the call
    this.server.to(data.callId).emit('chat-message', {
      userId: userInfo.userId,
      userType: userInfo.userType,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('start-call')
  async handleStartCall(
    @MessageBody() data: { appointmentId: string; patientId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo || userInfo.userType !== 'doctor') {
      client.emit('error', 'Only doctors can start calls');
      return;
    }

    try {
      // Create a new call session
      const result = await this.videoConsultationService.startCallForAppointment(
        data.appointmentId,
        data.patientId
      );
      
      if (!result.success) {
        client.emit('call-error', { message: 'Failed to start call' });
        return;
      }
      
      const callId = result.callId;

      // Get doctor and patient details from database
      const appointment = await this.videoConsultationService.getAppointmentDetails(data.appointmentId);
      
      if (!appointment) {
        client.emit('call-error', { message: 'Appointment not found' });
        return;
      }

      // Notify the patient about the incoming call
      const patientSocketIds = Array.from(this.connectedUsers.entries())
        .filter(([_, user]) => user.userId === data.patientId && user.userType === 'patient')
        .map(([socketId, _]) => socketId);

      patientSocketIds.forEach(socketId => {
        this.server.to(socketId).emit('incoming-call', {
          callId,
          appointmentId: data.appointmentId,
          doctorId: userInfo.userId,
          doctorName: appointment.doctor?.fullname || `Dr. ${appointment.doctor?.email}` || 'Doctor',
          patientId: data.patientId,
          patientName: appointment.patient?.fullname || 'Patient',
        });
      });

      // Also notify the doctor that call is initiated
      client.emit('call-started', { 
        callId,
        patientName: appointment.patient?.fullname || 'Patient',
      });
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  // Utility method to get connected users for debugging
  @SubscribeMessage('get-connected-users')
  handleGetConnectedUsers(@ConnectedSocket() client: Socket) {
    const users = Array.from(this.connectedUsers.values());
    client.emit('connected-users', users);
  }
}
