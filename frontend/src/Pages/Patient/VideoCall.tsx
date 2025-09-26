import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaComments, FaUserMd, FaTimes, FaCheck } from 'react-icons/fa';
import { VideoCallService, initializeVideoCallService, VideoCallNotification } from '../../utils/video-call';
import { WebRTCManager, initializeWebRTCManager } from '../../utils/webrtc';
import Sidebar from '../../Components/Sidebar';
import axios from 'axios';

const PatientVideoCall: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [webrtcManager, setWebrtcManager] = useState<WebRTCManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'incoming'>('idle');
  const [patientId, setPatientId] = useState<string>('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [incomingCall, setIncomingCall] = useState<VideoCallNotification | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    console.log('🔥 PATIENT: VideoCall component mounted with callId:', callId);
    initializeVideoCallServiceForPatient();
    return () => {
      cleanup();
    };
  }, [callId]);

  // Separate useEffect to handle WebRTC initialization when service is ready
  useEffect(() => {
    if (callId && videoCallService) {
      // Check if service is already connected
      if (videoCallService.isServiceConnected()) {
        console.log('🔥 PATIENT: Service is already connected, initializing WebRTC for callId:', callId);
        initializeWebRTCForCall();
      } else {
        // Wait for connection with a timeout
        console.log('🔥 PATIENT: Waiting for service connection...');
        const checkConnection = () => {
          if (videoCallService.isServiceConnected()) {
            console.log('🔥 PATIENT: Service connected, initializing WebRTC for callId:', callId);
            initializeWebRTCForCall();
          } else {
            setTimeout(checkConnection, 100); // Check every 100ms
          }
        };
        setTimeout(checkConnection, 100);
      }
    }
  }, [callId, videoCallService]);

  // Timer for call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (callStatus === 'connected' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callStartTimeRef.current!.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const initializeVideoCallServiceForPatient = async () => {
    try {
      let patientId: string | null = null;
      
      // Try to get patient ID from localStorage/sessionStorage first
      const storedPatientId = localStorage.getItem('patientId') || sessionStorage.getItem('patientId') || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      if (storedPatientId) {
        patientId = storedPatientId;
      } else {
        // Fallback: try API or use test ID
        try {
          const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/patients/me`, {
            withCredentials: true
          });
          patientId = response.data.patientId || response.data._id || response.data.id;
        } catch (apiError) {
          // For testing: use a hardcoded patient ID (custom patientId, not MongoDB ObjectId)
          patientId = 'PATIENT001'; // Test patient ID
        }
      }
      
      if (!patientId) {
        console.error('❌ PATIENT: No patient ID found');
        return;
      }
      
      setPatientId(patientId);
      console.log('🔥 PATIENT: Initializing video call service with ID:', patientId);
      const service = initializeVideoCallService(patientId, 'patient');
      setVideoCallService(service);
      
      // Set up event listeners
      service.onCallAccepted((data) => {
        console.log('✅ PATIENT: Call accepted by doctor:', data);
        setCallStatus('connected');
        callStartTimeRef.current = new Date();
      });
      
      service.onCallRejected((data) => {
        console.log('❌ PATIENT: Call rejected by doctor:', data);
        alert(`Call rejected: ${data.reason}`);
        setCallStatus('ended');
        navigate('/patient/doctors');
      });
      
      service.onCallEnded((data) => {
        console.log('📞 PATIENT: Call ended:', data);
        setCallStatus('ended');
        cleanup();
      });

      // Listen for incoming video calls from doctors
      service.onIncomingVideoCall((callData) => {
        console.log('🔔 PATIENT: Incoming video call from doctor:', callData);
        setIncomingCall(callData);
        setCallStatus('incoming');
        setDoctorInfo({
          name: callData.doctorName,
          specialization: callData.specialization
        });
      });
      
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
    }
  };

  const initializeWebRTCForCall = async () => {
    if (!callId || !videoCallService) {
      console.error('❌ PATIENT: Missing callId or videoCallService');
      return;
    }

    try {
      console.log('🔧 PATIENT: Initializing WebRTC for call:', callId);
      
      // Initialize WebRTC manager
      const webrtc = initializeWebRTCManager();
      setWebrtcManager(webrtc);

      // Get socket from video call service
      const socket = videoCallService.getSocket();
      if (!socket) {
        console.error('❌ PATIENT: No socket available from video call service');
        throw new Error('No socket available');
      }

      // Set up WebRTC event listeners BEFORE initialization
      webrtc.onLocalStream((stream) => {
        console.log('🎥 PATIENT: Local stream received', stream);
        console.log('🎥 PATIENT: Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('🎥 PATIENT: Local video element updated');
          // Force video to play
          localVideoRef.current.play().catch(console.error);
        } else {
          console.error('❌ PATIENT: localVideoRef.current is null');
        }
        setIsVideoCallActive(true);
      });

      webrtc.onRemoteStream((stream) => {
        console.log('📺 PATIENT: Remote stream received', stream);
        console.log('📺 PATIENT: Remote stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          console.log('📺 PATIENT: Remote video element updated');
          // Force video to play
          remoteVideoRef.current.play().catch(console.error);
        } else {
          console.error('❌ PATIENT: remoteVideoRef.current is null');
        }
        setCallStatus('connected');
        setIsConnected(true);
        setIsVideoCallActive(true);
      });

      webrtc.onConnectionStateChange((state) => {
        console.log('🔗 PATIENT: Connection state:', state);
        setIsConnected(state === 'connected');
        if (state === 'connected') {
          setCallStatus('connected');
          console.log('✅ PATIENT: Connected to doctor');
        } else if (state === 'disconnected' || state === 'failed') {
          setCallStatus('ended');
          console.log('❌ PATIENT: Connection lost');
        }
      });

      // Initialize WebRTC with socket and callId AFTER setting up listeners
      const success = await webrtc.initialize(
        socket,
        callId,
        true // Patient is the initiator
      );

      if (!success) {
        throw new Error('Failed to initialize WebRTC');
      }

      // Join the video room first
      videoCallService.joinVideoRoom(callId);
      
      // Start the call as initiator
      try {
        console.log('🚀 PATIENT: Starting call as initiator...');
        await webrtc.startCall();
        setCallStatus('connecting');
      } catch (error) {
        console.error('❌ PATIENT: Failed to start call:', error);
      }

    } catch (error) {
      console.error('❌ PATIENT: Failed to initialize WebRTC:', error);
      alert('Failed to initialize video call. Please try again.');
      navigate('/patient/doctors');
    }
  };

  const toggleMute = () => {
    if (webrtcManager) {
      const isMuted = webrtcManager.toggleAudio();
      setIsMuted(isMuted);
    }
  };

  const toggleVideo = () => {
    if (webrtcManager) {
      const isVideoOff = webrtcManager.toggleVideo();
      setIsVideoOff(isVideoOff);
    }
  };

  const retryVideoConnection = async () => {
    if (retryCount < maxRetries && webrtcManager && callId) {
      console.log(`🔄 PATIENT: Retrying video connection (attempt ${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      
      try {
        // Reinitialize WebRTC for the call
        await initializeWebRTCForCall();
      } catch (error) {
        console.error('❌ PATIENT: Retry failed:', error);
        if (retryCount + 1 >= maxRetries) {
          alert('Video connection failed after multiple attempts. Please try again.');
          navigate('/patient/doctors');
        }
      }
    }
  };

  const acceptIncomingCall = async () => {
    if (incomingCall && videoCallService) {
      console.log('✅ PATIENT: Accepting incoming call:', incomingCall.callId);
      setCallStatus('connecting');
      callStartTimeRef.current = new Date();
      
      // Initialize WebRTC for the incoming call
      await initializeWebRTCForCall();
      
      // Accept the call
      videoCallService.acceptVideoCall(incomingCall.callId);
      setIncomingCall(null);
    }
  };

  const rejectIncomingCall = () => {
    if (incomingCall && videoCallService) {
      console.log('❌ PATIENT: Rejecting incoming call:', incomingCall.callId);
      videoCallService.rejectVideoCall(incomingCall.callId, 'Patient is not available');
      setCallStatus('idle');
      setIncomingCall(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    console.log('📞 PATIENT: Ending call...');
    
    // End WebRTC call
    if (webrtcManager) {
      webrtcManager.endCall();
    }

    // Clear video elements and reset state
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.load(); // Reset video element
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.load(); // Reset video element
    }

    // Reset video call state
    setIsVideoCallActive(false);
    setCallStatus('ended');
    setIsMuted(false);
    setIsVideoOff(false);

    // Notify through WebSocket
    if (videoCallService && callId) {
      videoCallService.endVideoCall(callId);
    }

    // Navigate back to doctors list
    navigate('/patient/doctors');
    
    console.log('✅ Call ended');
  };

  const cleanup = () => {
    if (webrtcManager) {
      webrtcManager.endCall();
    }
    if (videoCallService) {
      videoCallService.disconnect();
    }
  };

  // Render incoming call notification
  if (callStatus === 'incoming' && incomingCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="animate-bounce text-6xl mb-6">📞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Incoming Video Call</h2>
              <p className="text-lg text-blue-600 font-medium mb-2">{doctorInfo?.name}</p>
              <p className="text-gray-600 mb-6">{doctorInfo?.specialization}</p>
              <p className="text-sm text-gray-500 mb-8">
                Requested at: {new Date(incomingCall.requestedAt).toLocaleTimeString()}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={rejectIncomingCall}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
                >
                  <FaTimes />
                  Decline
                </button>
                <button
                  onClick={acceptIncomingCall}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaCheck />
                  Accept
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render call ended state
  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">📞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Call Ended</h2>
              <p className="text-gray-600 mb-4">Thank you for using our video consultation service</p>
              <p className="text-sm text-gray-400 mb-8">Returning to doctors list...</p>
              <button
                onClick={() => navigate('/patient/doctors')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                Back to Doctors
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render video call interface
  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Sidebar />
      
      {/* Video Area */}
      <div className="relative h-screen lg:ml-80">
        {/* Remote Video (Doctor) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover"
          style={{ display: isVideoCallActive ? 'block' : 'none' }}
          onLoadedMetadata={() => console.log('📺 PATIENT: Remote video metadata loaded')}
          onCanPlay={() => console.log('📺 PATIENT: Remote video can play')}
          onError={(e) => console.error('❌ PATIENT: Remote video error:', e)}
        />
        
        {/* Waiting Message */}
        {!isVideoCallActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="animate-pulse text-6xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold mb-2">
                {callStatus === 'connecting' ? 'Connecting to Doctor...' : 'Waiting for Doctor'}
              </h2>
              <p className="text-gray-300 mb-4">
                Your video consultation will begin shortly
              </p>
              {retryCount > 0 && retryCount < maxRetries && (
                <button
                  onClick={retryVideoConnection}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Retry Connection ({retryCount}/{maxRetries})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Local Video (Patient) */}
        <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => console.log('🎥 PATIENT: Local video metadata loaded')}
            onCanPlay={() => console.log('🎥 PATIENT: Local video can play')}
            onError={(e) => console.error('❌ PATIENT: Local video error:', e)}
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <FaVideoSlash className="text-white text-2xl" />
            </div>
          )}
        </div>

        {/* Video Status Indicator */}
        {isVideoCallActive && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Video Active
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-gray-800 bg-opacity-90 px-6 py-3 rounded-full shadow-lg">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all duration-200 ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <FaMicrophoneSlash className="text-white text-lg" />
              ) : (
                <FaMicrophone className="text-white text-lg" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all duration-200 ${
                isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? (
                <FaVideoSlash className="text-white text-lg" />
              ) : (
                <FaVideo className="text-white text-lg" />
              )}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
              title="Toggle chat"
            >
              <FaComments className="text-white text-lg" />
            </button>

            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
              title="End call"
            >
              <FaPhone className="text-white text-lg transform rotate-135" />
            </button>
          </div>
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {callStatus === 'connecting' ? 'Connecting...' : 'Connected'}
            </span>
            {callStatus === 'connected' && callDuration > 0 && (
              <span className="text-sm text-gray-300 ml-2">
                {formatDuration(callDuration)}
              </span>
            )}
          </div>
          {doctorInfo && (
            <div className="text-xs text-gray-300 mt-1">
              Doctor: {doctorInfo.name}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300">
            <div className="p-4 border-b bg-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="h-full p-4">
              <div className="text-center text-gray-500 mt-20">
                <FaComments className="text-4xl mx-auto mb-2" />
                <p>Chat feature coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVideoCall;