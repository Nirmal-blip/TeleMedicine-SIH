import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaComments } from 'react-icons/fa';
import { VideoCallService, initializeVideoCallService } from '../../utils/video-call';
import axios from 'axios';

const VideoCall: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState<Array<{ userId: string; userType: string }>>([]);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!callId) {
      navigate('/patient/doctors');
      return;
    }

    initializeVideoCallService();
    setupMediaDevices();

    return () => {
      cleanup();
    };
  }, [callId]);

  const initializeVideoCallService = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true
      });
      
      const userId = response.data.id;
      const service = initializeVideoCallService(userId, 'patient');
      setVideoCallService(service);
      
      // Set up event listeners
      service.onJoinedVideoRoom((data) => {
        console.log('Joined video room:', data);
        setIsConnected(true);
        setCallStatus('connected');
      });
      
      service.onUserJoinedRoom((data) => {
        console.log('User joined room:', data);
        setParticipants(prev => [...prev.filter(p => p.userId !== data.userId), data]);
      });
      
      service.onUserLeftRoom((data) => {
        console.log('User left room:', data);
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      });
      
      service.onCallEnded((data) => {
        console.log('Call ended:', data);
        setCallStatus('ended');
        setTimeout(() => {
          navigate('/patient/doctors');
        }, 3000);
      });
      
      // Join the video room
      if (callId) {
        service.joinVideoRoom(callId);
      }
      
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
      navigate('/patient/doctors');
    }
  };

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (videoCallService && callId) {
      videoCallService.endVideoCall(callId);
    }
    cleanup();
    navigate('/patient/doctors');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoCallService) {
      if (callId) {
        videoCallService.leaveVideoRoom(callId);
      }
      videoCallService.disconnect();
    }
  };

  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
          <p className="text-gray-300 mb-4">Thank you for using our video consultation service</p>
          <p className="text-sm text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Video Area */}
      <div className="relative h-screen">
        {/* Remote Video (Doctor) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: participants.length > 0 ? 'block' : 'none' }}
        />
        
        {/* Waiting Message */}
        {participants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="animate-pulse text-6xl mb-4">👨‍⚕️</div>
              <h2 className="text-2xl font-bold mb-2">Waiting for Doctor</h2>
              <p className="text-gray-300">The doctor will join shortly...</p>
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
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
            >
              <FaComments className="text-white text-lg" />
            </button>

            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
            >
              <FaPhone className="text-white text-lg transform rotate-135" />
            </button>
          </div>
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {callStatus === 'connecting' ? 'Connecting...' : 'Connected'}
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Call ID: {callId}
          </div>
        </div>

        {/* Participants Count */}
        {participants.length > 0 && (
          <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-80 px-3 py-2 rounded-lg">
            <div className="text-white text-sm">
              👥 {participants.length + 1} participants
            </div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
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
  );
};

export default VideoCall;
