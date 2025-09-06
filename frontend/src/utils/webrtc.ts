// WebRTC Service for Video Calls
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface CallData {
  callId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end-call';
  from: string;
  to: string;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: WebSocket | null = null;
  private isInitiator: boolean = false;
  private callId: string = '';
  
  // Event handlers
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onCallEnd?: () => void;
  public onError?: (error: any) => void;

  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  constructor() {
    this.setupSignalingConnection();
  }

  private setupSignalingConnection() {
    // In a real application, you would connect to your signaling server
    // For demo purposes, we'll simulate the signaling server
    try {
      // Simulate WebSocket connection - replace with your actual signaling server
      // this.socket = new WebSocket('ws://localhost:3001/signaling');
      console.log('WebRTC Service initialized - using simulated signaling for demo');
      
      // For demo, we'll use localStorage to simulate signaling
      this.setupLocalStorageSignaling();
    } catch (error) {
      console.error('Failed to setup signaling connection:', error);
    }
  }

  private setupLocalStorageSignaling() {
    // Listen for signaling messages via localStorage (demo only)
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('webrtc-signal-')) {
        const data = JSON.parse(event.newValue || '{}') as CallData;
        this.handleSignalingMessage(data);
      }
    });
  }

  private sendSignalingMessage(data: CallData) {
    // In production, send via WebSocket to signaling server
    // For demo, use localStorage
    const key = `webrtc-signal-${data.to}-${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Clean up old messages
    setTimeout(() => {
      localStorage.removeItem(key);
    }, 5000);
  }

  private async handleSignalingMessage(data: CallData) {
    if (!this.peerConnection) return;

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
        video: { width: 1280, height: 720 },
        audio: true
      });

      this.onLocalStream?.(this.localStream);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.config);
      this.setupPeerConnectionHandlers();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      if (this.isInitiator) {
        await this.createOffer();
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
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(this.remoteStream);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          callId: this.callId,
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
          from: this.isInitiator ? 'doctor' : 'patient',
          to: this.isInitiator ? 'patient' : 'doctor'
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

      this.sendSignalingMessage({
        callId: this.callId,
        type: 'offer',
        offer: offer,
        from: 'doctor',
        to: 'patient'
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

      this.sendSignalingMessage({
        callId: this.callId,
        type: 'answer',
        answer: answer,
        from: 'patient',
        to: 'doctor'
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
    if (!this.peerConnection || !data.candidate) return;

    try {
      await this.peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.onError?.(error);
    }
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

  endCall(): void {
    // Send end call signal
    if (this.callId) {
      this.sendSignalingMessage({
        callId: this.callId,
        type: 'end-call',
        from: this.isInitiator ? 'doctor' : 'patient',
        to: this.isInitiator ? 'patient' : 'doctor'
      });
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
  return !!(navigator.mediaDevices && 
           navigator.mediaDevices.getUserMedia && 
           window.RTCPeerConnection);
}
