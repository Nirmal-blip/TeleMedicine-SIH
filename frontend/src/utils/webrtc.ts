import { io, Socket } from 'socket.io-client';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface WebRTCPeer {
  peerConnection: RTCPeerConnection;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
}

export class WebRTCManager {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string = '';
  private isConnected: boolean = false;
  private isInitiator: boolean = false;

  // Event callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;

  constructor() {
    this.setupDefaultConfig();
  }

  private setupDefaultConfig() {
    // Default ICE servers configuration
    const defaultConfig: WebRTCConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
  }

  // Initialize WebRTC connection
  public async initialize(
    socket: Socket,
    callId: string,
    isInitiator: boolean = false
  ): Promise<boolean> {
    try {
      this.socket = socket;
      this.callId = callId;
      this.isInitiator = isInitiator;

      console.log('🔧 WebRTC: Initializing with callId:', callId, 'isInitiator:', isInitiator);

      // Setup socket event listeners
      this.setupSocketListeners();

      // Get user media
      await this.getUserMedia();

      // Create peer connection
      this.createPeerConnection();

      return true;
    } catch (error) {
      console.error('❌ WebRTC: Failed to initialize:', error);
      return false;
    }
  }

  // Get user media (camera and microphone)
  public async getUserMedia(): Promise<MediaStream | null> {
    try {
      console.log('🎥 WebRTC: Requesting user media...');
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ WebRTC: User media obtained');

      // Notify callback
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('❌ WebRTC: Failed to get user media:', error);
      throw error;
    }
  }

  // Create peer connection
  private createPeerConnection(): void {
    console.log('🔗 WebRTC: Creating peer connection...');

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📺 WebRTC: Received remote stream');
      this.remoteStream = event.streams[0];
      
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        console.log('🧊 WebRTC: Sending ICE candidate');
        this.socket.emit('webrtc:ice-candidate', {
          callId: this.callId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('🔗 WebRTC: Connection state changed to:', this.peerConnection.connectionState);
        this.isConnected = this.peerConnection.connectionState === 'connected';
        
        if (this.onConnectionStateChangeCallback) {
          this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
        }
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('🧊 WebRTC: ICE connection state changed to:', this.peerConnection.iceConnectionState);
        
        if (this.onIceConnectionStateChangeCallback) {
          this.onIceConnectionStateChangeCallback(this.peerConnection.iceConnectionState);
        }
      }
    };

    console.log('✅ WebRTC: Peer connection created');
  }

  // Setup socket event listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Handle incoming offer
    this.socket.on('webrtc:offer', async (data: { callId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.callId === this.callId) {
        console.log('📥 WebRTC: Received offer');
        await this.handleOffer(data.offer);
      }
    });

    // Handle incoming answer
    this.socket.on('webrtc:answer', async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.callId === this.callId) {
        console.log('📥 WebRTC: Received answer');
        await this.handleAnswer(data.answer);
      }
    });

    // Handle incoming ICE candidate
    this.socket.on('webrtc:ice-candidate', async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      if (data.callId === this.callId && this.peerConnection) {
        console.log('📥 WebRTC: Received ICE candidate');
        await this.peerConnection.addIceCandidate(data.candidate);
      }
    });
  }

  // Create and send offer (for initiator)
  public async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.socket) {
      throw new Error('Peer connection or socket not initialized');
    }

    try {
      console.log('📤 WebRTC: Creating offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      // Send offer through socket
      this.socket.emit('webrtc:offer', {
        callId: this.callId,
        offer: offer
      });

      console.log('✅ WebRTC: Offer created and sent');
    } catch (error) {
      console.error('❌ WebRTC: Failed to create offer:', error);
      throw error;
    }
  }

  // Handle incoming offer (for receiver)
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('📥 WebRTC: Handling offer...');
      
      await this.peerConnection.setRemoteDescription(offer);
      
      // Create and send answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer through socket
      if (this.socket) {
        this.socket.emit('webrtc:answer', {
          callId: this.callId,
          answer: answer
        });
      }

      console.log('✅ WebRTC: Answer created and sent');
    } catch (error) {
      console.error('❌ WebRTC: Failed to handle offer:', error);
      throw error;
    }
  }

  // Handle incoming answer (for initiator)
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('📥 WebRTC: Handling answer...');
      await this.peerConnection.setRemoteDescription(answer);
      console.log('✅ WebRTC: Answer handled');
    } catch (error) {
      console.error('❌ WebRTC: Failed to handle answer:', error);
      throw error;
    }
  }

  // Start the call (for initiator)
  public async startCall(): Promise<void> {
    if (!this.isInitiator) {
      throw new Error('Only initiator can start the call');
    }

    try {
      console.log('🚀 WebRTC: Starting call...');
      await this.createOffer();
    } catch (error) {
      console.error('❌ WebRTC: Failed to start call:', error);
      throw error;
    }
  }

  // Toggle audio mute
  public toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🎤 WebRTC: Audio', audioTrack.enabled ? 'unmuted' : 'muted');
      return !audioTrack.enabled; // Return true if muted
    }
    return false;
  }

  // Toggle video
  public toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📹 WebRTC: Video', videoTrack.enabled ? 'enabled' : 'disabled');
      return !videoTrack.enabled; // Return true if disabled
    }
    return false;
  }

  // End the call
  public endCall(): void {
    console.log('📞 WebRTC: Ending call...');

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear remote stream
    this.remoteStream = null;
    this.isConnected = false;

    console.log('✅ WebRTC: Call ended');
  }

  // Event listeners
  public onLocalStream(callback: (stream: MediaStream) => void): void {
    this.onLocalStreamCallback = callback;
  }

  public onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  public onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  public onIceConnectionStateChange(callback: (state: RTCIceConnectionState) => void): void {
    this.onIceConnectionStateChangeCallback = callback;
  }

  // Getters
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  public getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null;
  }

  public isCallConnected(): boolean {
    return this.isConnected;
  }

  public getCallId(): string {
    return this.callId;
  }
}

// Global WebRTC manager instance
let webrtcManager: WebRTCManager | null = null;

export const initializeWebRTCManager = (): WebRTCManager => {
  if (webrtcManager) {
    webrtcManager.endCall();
  }
  webrtcManager = new WebRTCManager();
  return webrtcManager;
};

export const getWebRTCManager = (): WebRTCManager | null => {
  return webrtcManager;
};
