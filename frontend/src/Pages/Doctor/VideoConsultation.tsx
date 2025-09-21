import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaComments, FaCheck, FaTimes, FaBell, FaPills } from 'react-icons/fa';
import { VideoCallService, initializeVideoCallService, VideoCallNotification } from '../../utils/video-call';
import DoctorSidebar from '../../Components/DoctorSidebar';
import PrescriptionForm from '../../Components/PrescriptionForm';
import axios from 'axios';

const DoctorVideoConsultation: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState<Array<{ userId: string; userType: string }>>([]);
  const [callStatus, setCallStatus] = useState<'idle' | 'incoming' | 'connecting' | 'connected' | 'ended'>('idle');
  const [incomingCall, setIncomingCall] = useState<VideoCallNotification | null>(null);
  const [doctorId, setDoctorId] = useState<string>('');
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  useEffect(() => {
    initializeVideoCallServiceForDoctor();
    fetchDoctorData();
    return () => {
      cleanup();
    };
  }, []);

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/doctors/me', {
        withCredentials: true
      });
      setDoctorData(response.data);
      console.log('Doctor data loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch doctor data:', error);
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

  const createPeerConnection = () => {
    console.log('🔗 Creating peer connection...');
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && videoCallService) {
        console.log('🧊 Sending ICE candidate');
        // Send ICE candidate through WebSocket
        // videoCallService.sendIceCandidate(event.candidate);
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const startVideoCall = async () => {
    try {
      console.log('🚀 Starting video call...');
      
      // Start local video
      const stream = await startLocalVideo();
      if (!stream) return;

      // Create peer connection
      const peerConnection = createPeerConnection();

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log('📤 Created offer, waiting for answer...');
      setIsVideoCallActive(true);
      setCallStatus('connecting');

      // Send offer through WebSocket
      // videoCallService?.sendOffer(offer);

    } catch (error) {
      console.error('❌ Error starting video call:', error);
      alert('Failed to start video call');
    }
  };

  const openPrescriptionForm = () => {
    if (incomingCall) {
      // Set current patient data from the call
      setCurrentPatient({
        _id: incomingCall.patientId, // This might need to be fetched separately
        patientId: incomingCall.patientId,
        fullname: incomingCall.patientName
      });
      setIsPrescriptionFormOpen(true);
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData: any) => {
    try {
      console.log('Submitting prescription:', prescriptionData);
      
      const response = await axios.post('http://localhost:3000/api/prescriptions', prescriptionData, {
        withCredentials: true
      });
      
      console.log('Prescription created successfully:', response.data);
      alert('Prescription created successfully!');
      setIsPrescriptionFormOpen(false);
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      alert('Failed to create prescription: ' + (error.response?.data?.message || error.message));
    }
  };

  const initializeVideoCallServiceForDoctor = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true
      });
      
      const userId = response.data.user.id;
      setDoctorId(userId);
      const service = initializeVideoCallService(userId, 'doctor');
      setVideoCallService(service);
      
      console.log('🔥 DOCTOR: Video call service initialized for doctor:', userId);
      
      // Set up event listeners for incoming calls
      service.onIncomingVideoCall((callData) => {
        console.log('🔔 DOCTOR: Incoming video call:', callData);
        setIncomingCall(callData);
        setCallStatus('incoming');
      });
      
      service.onCallAcceptedConfirmation((data) => {
        console.log('✅ DOCTOR: Call accepted confirmation:', data);
        setCallStatus('connected');
        setIncomingCall(null);
        if (data.callId) {
          setupMediaDevices();
          service.joinVideoRoom(data.callId);
        }
      });
      
      service.onCallRejectedConfirmation((data) => {
        console.log('❌ DOCTOR: Call rejected confirmation:', data);
        setCallStatus('idle');
        setIncomingCall(null);
      });
      
      service.onJoinedVideoRoom((data) => {
        console.log('🎥 DOCTOR: Joined video room:', data);
        setIsConnected(true);
      });
      
      service.onUserJoinedRoom((data) => {
        console.log('👤 DOCTOR: User joined room:', data);
        setParticipants(prev => [...prev.filter(p => p.userId !== data.userId), data]);
      });
      
      service.onUserLeftRoom((data) => {
        console.log('👋 DOCTOR: User left room:', data);
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      });
      
      service.onCallEnded((data) => {
        console.log('📞 DOCTOR: Call ended:', data);
        setCallStatus('ended');
        setTimeout(() => {
          setCallStatus('idle');
          setIncomingCall(null);
        }, 3000);
      });
      
      service.onCallError((data) => {
        console.error('❌ DOCTOR: Call error:', data);
        alert(data.message);
        setCallStatus('idle');
        setIncomingCall(null);
      });
      
    } catch (error) {
      console.error('Failed to initialize video call service for doctor:', error);
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

  const acceptCall = async () => {
    if (videoCallService && incomingCall) {
      console.log('✅ DOCTOR: Accepting call:', incomingCall.callId);
      
      try {
        // Start video call when accepting
        await startVideoCall();
        
        videoCallService.acceptVideoCall(incomingCall.callId);
        setCallStatus('connected');
        
        // Join the video room
        videoCallService.joinVideoRoom(incomingCall.callId);
        
        console.log('✅ Call accepted and video started');
      } catch (error) {
        console.error('❌ Error accepting call:', error);
        alert('Failed to start video call');
      }
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
    console.log('📞 Ending call...');
    
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
    if (videoCallService && incomingCall) {
      videoCallService.endVideoCall(incomingCall.callId);
    }

    console.log('✅ Call ended');
  };

  const rejectCall = (reason?: string) => {
    if (videoCallService && incomingCall) {
      console.log('❌ DOCTOR: Rejecting call:', incomingCall.callId);
      videoCallService.rejectVideoCall(incomingCall.callId, reason || 'Doctor is not available');
      setCallStatus('idle');
      setIncomingCall(null);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoCallService && incomingCall) {
      videoCallService.leaveVideoRoom(incomingCall.callId);
    }
  };

  // Render incoming call notification
  if (callStatus === 'incoming' && incomingCall) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="animate-bounce text-6xl mb-6">📞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Incoming Video Call</h2>
              <p className="text-lg text-emerald-600 font-medium mb-2">{incomingCall.patientName}</p>
              <p className="text-gray-600 mb-6">{incomingCall.specialization}</p>
              <p className="text-sm text-gray-500 mb-8">
                Requested at: {new Date(incomingCall.requestedAt).toLocaleTimeString()}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => rejectCall('Doctor is busy')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
                >
                  <FaTimes />
                  Decline
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200"
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

  // Render video call interface
  if (callStatus === 'connecting' || callStatus === 'connected') {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        {/* Video Area */}
        <div className="relative h-screen">
                    {/* Remote Video (Patient) */}
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
                <div className="animate-pulse text-6xl mb-4">👨‍⚕️</div>
                <h2 className="text-2xl font-bold mb-2">
                  {callStatus === 'connecting' ? 'Connecting...' : 'Waiting for Patient'}
                </h2>
                <p className="text-gray-300">
                  {incomingCall ? `Call with ${incomingCall.patientName}` : 'Video consultation in progress'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video (Doctor) */}
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
                onClick={openPrescriptionForm}
                className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
                title="Write Prescription"
                  >
                <FaPills className="text-white text-lg" />
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
            {incomingCall && (
              <div className="text-xs text-gray-300 mt-1">
                Patient: {incomingCall.patientName}
                  </div>
            )}
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

        {/* Prescription Form Modal */}
        {isPrescriptionFormOpen && currentPatient && doctorData && (
          <PrescriptionForm
            isOpen={isPrescriptionFormOpen}
            onClose={() => setIsPrescriptionFormOpen(false)}
            onSubmit={handlePrescriptionSubmit}
            patientData={currentPatient}
            doctorData={doctorData}
            appointmentId={incomingCall?.callId || ''}
          />
        )}
      </div>
    );
  }

  // Render call ended state
  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
          <p className="text-gray-300 mb-4">Thank you for the consultation</p>
          <p className="text-sm text-gray-400">Returning to dashboard...</p>
        </div>
      </div>
    );
  }

  // Render idle state (waiting for calls)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-6">🎥</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Video Consultation</h1>
              <p className="text-gray-600 mb-8">
                Ready to receive video call requests from patients
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <FaBell className="text-xl" />
                  <span className="font-medium">Waiting for incoming calls...</span>
                </div>
                <p className="text-emerald-600 text-sm mt-2">
                  You will be notified when a patient requests a video consultation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">📞</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Instant Calls</h3>
                  <p className="text-sm text-gray-600">Accept or decline incoming video calls</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">💊</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Prescriptions</h3>
                  <p className="text-sm text-gray-600">Write prescriptions during consultations</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Records</h3>
                  <p className="text-sm text-gray-600">Access patient history and notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorVideoConsultation;
