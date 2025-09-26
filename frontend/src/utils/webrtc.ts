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

      // Setup socket event listeners FIRST
      this.setupSocketListeners();

      // Get user media
      await this.getUserMedia();

      // Create peer connection
      this.createPeerConnection();

      // If we're the initiator, wait a bit for the other participant to be ready
      if (this.isInitiator) {
        console.log('🚀 WebRTC: Initiator - waiting for other participant to be ready...');
        // Wait for a signal that the other participant is ready
        await this.waitForOtherParticipant();
      }

      return true;
    } catch (error) {
      console.error('❌ WebRTC: Failed to initialize:', error);
      return false;
    }
  }

  // Wait for other participant to be ready
  private async waitForOtherParticipant(): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ WebRTC: Timeout waiting for other participant, proceeding anyway...');
        resolve();
      }, 3000); // Wait max 3 seconds

      // Listen for other participant ready signal
      if (this.socket) {
        const onOtherParticipantReady = () => {
          console.log('✅ WebRTC: Other participant is ready, proceeding with call...');
          clearTimeout(timeout);
          this.socket?.off('webrtc:participant-ready', onOtherParticipantReady);
          resolve();
        };
        
        this.socket.on('webrtc:participant-ready', onOtherParticipantReady);
      }
    });
  }

  // Signal that this participant is ready
  public signalParticipantReady(): void {
    if (this.socket && this.callId) {
      console.log('📢 WebRTC: Signaling that participant is ready');
      this.socket.emit('webrtc:participant-ready', { callId: this.callId });
    }
  }

  // Join call as non-initiator (receiver)
  public async joinCall(): Promise<void> {
    if (this.isInitiator) {
      throw new Error('Initiator should use startCall() instead');
    }

    try {
      console.log('🚀 WebRTC: Joining call as receiver...');
      console.log('🚀 WebRTC: Local stream available:', !!this.localStream);
      console.log('🚀 WebRTC: Local stream tracks:', this.localStream?.getTracks().length || 0);
      
      // Signal that this participant is ready
      this.signalParticipantReady();
      
      console.log('✅ WebRTC: Ready to receive offer from initiator');
      
    } catch (error) {
      console.error('❌ WebRTC: Failed to join call:', error);
      throw error;
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
      console.log('📺 WebRTC: Received remote stream event', event);
      console.log('📺 WebRTC: Number of streams:', event.streams.length);
      console.log('📺 WebRTC: Event details:', {
        streams: event.streams.length,
        track: event.track,
        trackKind: event.track?.kind,
        trackEnabled: event.track?.enabled,
        trackReadyState: event.track?.readyState
      });
      
      if (event.streams && event.streams.length > 0) {
        this.remoteStream = event.streams[0];
        console.log('📺 WebRTC: Remote stream set:', this.remoteStream);
        console.log('📺 WebRTC: Remote stream tracks:', this.remoteStream.getTracks().length);
        console.log('📺 WebRTC: Remote stream track details:', this.remoteStream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          id: t.id
        })));
        
        if (this.onRemoteStreamCallback) {
          console.log('📺 WebRTC: Calling remote stream callback');
          this.onRemoteStreamCallback(this.remoteStream);
        } else {
          console.warn('⚠️ WebRTC: No remote stream callback set');
        }
      } else {
        console.log('❌ WebRTC: No streams in track event');
      }
    };

    // Additional debugging for connection state
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 WebRTC: Connection state changed to:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        console.log('✅ WebRTC: Connection established successfully');
        // Check if we have remote streams
        setTimeout(() => {
          if (!this.remoteStream) {
            console.warn('⚠️ WebRTC: Connected but no remote stream yet, checking receivers...');
            const receivers = this.peerConnection?.getReceivers() || [];
            console.log('📺 WebRTC: Available receivers:', receivers.length);
            receivers.forEach((receiver, index) => {
              console.log(`📺 WebRTC: Receiver ${index}:`, {
                track: receiver.track?.kind,
                enabled: receiver.track?.enabled,
                readyState: receiver.track?.readyState
              });
            });
          }
        }, 1000);
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

    // Handle connection state changes (moved to above for better debugging)

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
      console.log('📥 WebRTC: Received offer event for callId:', data.callId, 'current callId:', this.callId);
      console.log('📥 WebRTC: Offer data:', data);
      console.log('📥 WebRTC: Peer connection exists:', !!this.peerConnection);
      console.log('📥 WebRTC: Local stream exists:', !!this.localStream);
      
      if (data.callId === this.callId) {
        console.log('📥 WebRTC: Processing offer...');
        await this.handleOffer(data.offer);
      } else {
        console.log('❌ WebRTC: CallId mismatch, ignoring offer');
      }
    });

    // Handle incoming answer
    this.socket.on('webrtc:answer', async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('📥 WebRTC: Received answer event for callId:', data.callId, 'current callId:', this.callId);
      console.log('📥 WebRTC: Answer data:', data);
      console.log('📥 WebRTC: Peer connection exists:', !!this.peerConnection);
      
      if (data.callId === this.callId) {
        console.log('📥 WebRTC: Processing answer...');
        await this.handleAnswer(data.answer);
      } else {
        console.log('❌ WebRTC: CallId mismatch, ignoring answer');
      }
    });

    // Handle incoming ICE candidate
    this.socket.on('webrtc:ice-candidate', async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      console.log('📥 WebRTC: Received ICE candidate for callId:', data.callId, 'current callId:', this.callId);
      if (data.callId === this.callId && this.peerConnection) {
        console.log('📥 WebRTC: Adding ICE candidate...');
        await this.peerConnection.addIceCandidate(data.candidate);
      } else {
        console.log('❌ WebRTC: CallId mismatch or no peer connection, ignoring ICE candidate');
      }
    });

    // Handle participant ready signal
    this.socket.on('webrtc:participant-ready', (data: { callId: string }) => {
      console.log('📥 WebRTC: Received participant ready signal for callId:', data.callId, 'current callId:', this.callId);
      if (data.callId === this.callId) {
        console.log('📥 WebRTC: Other participant is ready for callId:', this.callId);
      } else {
        console.log('❌ WebRTC: CallId mismatch, ignoring participant ready signal');
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
      console.log('📤 WebRTC: Local stream tracks:', this.localStream?.getTracks().length || 0);
      
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

      console.log('✅ WebRTC: Offer created and sent to room:', this.callId);
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
      console.log('📥 WebRTC: Handling offer...', offer);
      console.log('📥 WebRTC: Local stream available:', !!this.localStream);
      console.log('📥 WebRTC: Local stream tracks:', this.localStream?.getTracks().length || 0);
      
      await this.peerConnection.setRemoteDescription(offer);
      console.log('📥 WebRTC: Remote description set successfully');
      
      // Create and send answer
      const answer = await this.peerConnection.createAnswer();
      console.log('📥 WebRTC: Answer created:', answer);
      await this.peerConnection.setLocalDescription(answer);
      console.log('📥 WebRTC: Local description set successfully');

      // Send answer through socket
      if (this.socket) {
        this.socket.emit('webrtc:answer', {
          callId: this.callId,
          answer: answer
        });
        console.log('✅ WebRTC: Answer sent to room:', this.callId);
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
      console.log('📥 WebRTC: Handling answer...', answer);
      console.log('📥 WebRTC: Peer connection state:', this.peerConnection.connectionState);
      console.log('📥 WebRTC: ICE connection state:', this.peerConnection.iceConnectionState);
      
      await this.peerConnection.setRemoteDescription(answer);
      console.log('✅ WebRTC: Answer handled, connection should be established');
      console.log('📥 WebRTC: Peer connection state after answer:', this.peerConnection.connectionState);
      console.log('📥 WebRTC: ICE connection state after answer:', this.peerConnection.iceConnectionState);
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
      console.log('🚀 WebRTC: Local stream available:', !!this.localStream);
      console.log('🚀 WebRTC: Local stream tracks:', this.localStream?.getTracks().length || 0);
      console.log('🚀 WebRTC: Peer connection state:', this.peerConnection?.connectionState);
      
      // Signal that this participant is ready
      this.signalParticipantReady();
      
      // Wait a bit for the other participant to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.createOffer();
      
      // Set up a timeout to check if remote stream arrives
      setTimeout(() => {
        if (!this.remoteStream && this.peerConnection?.connectionState === 'connected') {
          console.warn('⚠️ WebRTC: Connected but no remote stream received after 5 seconds');
          // Try to get remote streams from the peer connection
          const receivers = this.peerConnection.getReceivers();
          console.log('📺 WebRTC: Available receivers:', receivers.length);
          receivers.forEach((receiver, index) => {
            console.log(`📺 WebRTC: Receiver ${index}:`, {
              track: receiver.track?.kind,
              enabled: receiver.track?.enabled,
              readyState: receiver.track?.readyState
            });
          });
        }
      }, 5000);
      
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

  // Force check for remote streams (useful for debugging)
  public checkRemoteStreams(): void {
    if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
      console.log('🔍 WebRTC: Manually checking for remote streams...');
      const receivers = this.peerConnection.getReceivers();
      console.log('📺 WebRTC: Available receivers:', receivers.length);
      
      receivers.forEach((receiver, index) => {
        console.log(`📺 WebRTC: Receiver ${index}:`, {
          track: receiver.track?.kind,
          enabled: receiver.track?.enabled,
          readyState: receiver.track?.readyState
        });
        
        if (receiver.track && receiver.track.kind === 'video' && !this.remoteStream) {
          console.log('📺 WebRTC: Found video track in receiver, creating stream...');
          // Create a new MediaStream with the track
          const stream = new MediaStream([receiver.track]);
          this.remoteStream = stream;
          
          if (this.onRemoteStreamCallback) {
            console.log('📺 WebRTC: Calling remote stream callback with manually found stream');
            this.onRemoteStreamCallback(this.remoteStream);
          }
        }
      });
    }
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
