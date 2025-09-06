import { io, Socket } from 'socket.io-client';

export interface CallData {
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

export interface ChatMessage {
  userId: string;
  userType: 'doctor' | 'patient';
  message: string;
  timestamp: string;
}

export class EnhancedWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: Socket | null = null;
  private isInitiator: boolean = false;
  private callId: string = '';
  private userId: string = '';
  private userType: 'doctor' | 'patient' = 'patient';
  
  // Event handlers
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onCallEnd?: () => void;
  public onError?: (error: any) => void;
  public onChatMessage?: (message: ChatMessage) => void;
  public onUserJoined?: (user: { userId: string; userType: string }) => void;
  public onUserLeft?: (user: { userId: string; userType: string }) => void;
  public onIncomingCall?: (callData: { callId: string; appointmentId: string; doctorId: string; doctorName: string }) => void;

  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  constructor(userId: string, userType: 'doctor' | 'patient') {
    this.userId = userId;
    this.userType = userType;
    this.setupSignalingConnection();
  }

  private setupSignalingConnection() {
    try {
      // Connect to the WebSocket signaling server
      this.socket = io('http://localhost:3000/video-consultation', {
        query: {
          userId: this.userId,
          userType: this.userType,
        },
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server');
      });

      this.socket.on('webrtc-signal', (data: CallData) => {
        this.handleSignalingMessage(data);
      });

      this.socket.on('chat-message', (message: ChatMessage) => {
        this.onChatMessage?.(message);
      });

      this.socket.on('user-joined', (user: { userId: string; userType: string }) => {
        console.log('User joined:', user);
        this.onUserJoined?.(user);
      });

      this.socket.on('user-left', (user: { userId: string; userType: string }) => {
        console.log('User left:', user);
        this.onUserLeft?.(user);
      });

      this.socket.on('incoming-call', (callData: { callId: string; appointmentId: string; doctorId: string; doctorName: string }) => {
        console.log('Incoming call:', callData);
        this.onIncomingCall?.(callData);
      });

      this.socket.on('existing-participants', (participants: any[]) => {
        console.log('Existing participants:', participants);
        // Handle existing participants in the call
      });

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error);
        this.onError?.(error);
      });

    } catch (error) {
      console.error('Failed to setup signaling connection:', error);
      this.onError?.(error);
    }
  }

  private async handleSignalingMessage(data: CallData) {
    if (!this.peerConnection) {
      console.warn('Received signaling message but no peer connection exists');
      return;
    }

    // Only process messages from the other party
    if (data.from === this.userId) {
      console.log('Ignoring signaling message from self');
      return;
    }

    console.log(`Handling WebRTC signal: ${data.type} from ${data.from} (${data.fromType})`);

    try {
      switch (data.type) {
        case 'offer':
          await this.handleOffer(data);
          break;
        case 'answer':
          await this.handleAnswer(data);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(data);
          break;
        case 'end-call':
          this.endCall();
          break;
        default:
          console.warn('Unknown signaling message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
      this.onError?.(error);
    }
  }

  async initializeCall(callId: string, isInitiator: boolean = false): Promise<void> {
    this.callId = callId;
    this.isInitiator = isInitiator;

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.onLocalStream?.(this.localStream);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.config);
      this.setupPeerConnectionHandlers();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Join the call room first
      this.socket?.emit('join-call', { callId });

      // Wait for socket confirmation before proceeding
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Socket join-call timeout, proceeding anyway');
          resolve();
        }, 2000);

        this.socket?.once('joined-call', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      if (this.isInitiator) {
        // Wait a bit for the other party to join
        setTimeout(() => {
          this.createOffer();
        }, 1500);
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      this.onError?.(error);
      throw error;
    }
  }

  private setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(this.remoteStream);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('webrtc-signal', {
          callId: this.callId,
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
          from: this.userId,
          to: '',
          fromType: this.userType,
          toType: this.userType === 'doctor' ? 'patient' : 'doctor'
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('Connection state:', state);
      this.onConnectionStateChange?.(state);
      
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.endCall();
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection!.iceConnectionState);
    };
  }

  private async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      this.socket?.emit('webrtc-signal', {
        callId: this.callId,
        type: 'offer',
        offer: offer,
        from: this.userId,
        to: '',
        fromType: this.userType,
        toType: this.userType === 'doctor' ? 'patient' : 'doctor'
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      this.onError?.(error);
    }
  }

  private async handleOffer(data: CallData) {
    if (!this.peerConnection || !data.offer) return;

    try {
      await this.peerConnection.setRemoteDescription(data.offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket?.emit('webrtc-signal', {
        callId: this.callId,
        type: 'answer',
        answer: answer,
        from: this.userId,
        to: data.from,
        fromType: this.userType,
        toType: data.fromType
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      this.onError?.(error);
    }
  }

  private async handleAnswer(data: CallData) {
    if (!this.peerConnection || !data.answer) return;

    try {
      await this.peerConnection.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError?.(error);
    }
  }

  private async handleIceCandidate(data: CallData) {
    if (!this.peerConnection || !data.candidate) {
      console.warn('Cannot handle ICE candidate: no peer connection or candidate data');
      return;
    }

    try {
      console.log('Adding ICE candidate:', data.candidate);
      await this.peerConnection.addIceCandidate(data.candidate);
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      // Don't throw error for ICE candidate failures as they're common
      // Some ICE candidates might be invalid or duplicates
    }
  }

  startCall(appointmentId: string, patientId: string): void {
    if (this.userType !== 'doctor') {
      throw new Error('Only doctors can start calls');
    }

    this.socket?.emit('start-call', { appointmentId, patientId });
  }

  async joinCall(callId: string, appointmentId?: string): Promise<void> {
    await this.initializeCall(callId, false);
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  sendChatMessage(message: string): void {
    if (this.socket && this.callId) {
      this.socket.emit('chat-message', {
        callId: this.callId,
        message
      });
    }
  }

  endCall(): void {
    // Leave the call room
    if (this.socket && this.callId) {
      this.socket.emit('leave-call', { callId: this.callId });
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = '';
    this.onCallEnd?.();
  }

  disconnect(): void {
    this.endCall();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  // Screen sharing functionality
  async startScreenShare(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track with screen share
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track?.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Handle screen share end
      videoTrack.onended = async () => {
        await this.stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      this.onError?.(error);
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.peerConnection || !this.localStream) return;

    try {
      // Get the original video track
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track?.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
      this.onError?.(error);
    }
  }
}

// Utility function to generate call ID
export function generateCallId(): string {
  return `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to check WebRTC support
export function isWebRTCSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window !== 'undefined' &&
    window.RTCPeerConnection
  );
}
