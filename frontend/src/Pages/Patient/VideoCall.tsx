import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from 'react-icons/fa';
import { VideoCallService, initializeVideoCallService } from '../../utils/video-call';
import Sidebar from '../../Components/Sidebar';
import axios from 'axios';

const PatientVideoCall: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [patientId, setPatientId] = useState<string>('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    initializeVideoCallServiceForPatient();
    if (callId) {
      startVideoCall();
    }
    return () => {
      cleanup();
    };
  }, [callId]);

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
          const response = await axios.get('http://localhost:3000/api/patients/me', {
            withCredentials: true
          });
          patientId = response.data._id || response.data.id;
        } catch (apiError) {
          // For testing: use a hardcoded patient ID
          patientId = '68bb0972d6ac0c5ddcba5ec8'; // Test patient ID
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
      
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
    }
  };

  // WebRTC Functions
  const startLocalVideo = async () => {
    try {
      console.log('🎥 Starting local video...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('✅ Local video started');
      return stream;
    } catch (error) {
      console.error('❌ Error accessing camera/microphone:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      return null;
    }
  };

  const startVideoCall = async () => {
    try {
      console.log('🚀 PATIENT: Starting video call...');
      setCallStatus('connecting');
      
      // Start local video
      const stream = await startLocalVideo();
      if (!stream) return;

      setIsVideoCallActive(true);
      
      // Join the video room if we have a callId
      if (callId && videoCallService) {
        videoCallService.joinVideoRoom(callId);
      }

    } catch (error) {
      console.error('❌ Error starting video call:', error);
      alert('Failed to start video call');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('🎤 Audio', audioTrack.enabled ? 'unmuted' : 'muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log('📹 Video', videoTrack.enabled ? 'enabled' : 'disabled');
      }
    }
  };

  const endCall = () => {
    console.log('📞 PATIENT: Ending call...');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Update state
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (videoCallService) {
      videoCallService.disconnect();
    }
  };

  // Render video call interface
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 relative bg-gray-900">
        {/* Video Area */}
        <div className="relative h-full">
          {/* Remote Video (Doctor) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ display: isVideoCallActive ? 'block' : 'none' }}
          />
          
          {/* Waiting Message */}
          {!isVideoCallActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <div className="animate-pulse text-6xl mb-4">🏥</div>
                <h2 className="text-2xl font-bold mb-2">
                  {callStatus === 'connecting' ? 'Connecting to Doctor...' : 'Waiting for Doctor'}
                </h2>
                <p className="text-gray-300">
                  Your video consultation will begin shortly
                </p>
              </div>
            </div>
          )}

          {/* Local Video (Patient) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <FaVideoSlash className="text-white text-2xl" />
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-gray-800 bg-opacity-80 px-6 py-3 rounded-full">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
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
              >
                {isVideoOff ? (
                  <FaVideoSlash className="text-white text-lg" />
                ) : (
                  <FaVideo className="text-white text-lg" />
                )}
              </button>

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
              >
                <FaPhone className="text-white text-lg transform rotate-135" />
              </button>
            </div>
          </div>

          {/* Call Status */}
          <div className="absolute top-4 left-4">
            <div className="bg-gray-800 bg-opacity-80 px-4 py-2 rounded-lg">
              <p className="text-white text-sm">
                Status: <span className="capitalize">{callStatus}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVideoCall;