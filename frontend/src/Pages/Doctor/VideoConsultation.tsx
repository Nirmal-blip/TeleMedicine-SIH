import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaPhone,
  FaComments,
  FaFileAlt,
  FaClock,
  FaUser,
  FaCamera,
  FaDesktop,
  FaVolumeUp,
  FaCog,
  FaPhoneSlash,
  FaPills
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";
import PrescriptionForm from "../../Components/PrescriptionForm";
import { EnhancedWebRTCService, generateCallId, isWebRTCSupported } from "../../utils/enhanced-webrtc";
import { getVideoCallNotificationService } from "../../utils/video-call-notifications";

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  appointmentTime: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  message: string;
  timestamp: Date;
}

const VideoConsultation: React.FC = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [callId, setCallId] = useState<string>('');
  const [isWebRTCReady, setIsWebRTCReady] = useState<boolean>(false);
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState<boolean>(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [videoCallService, setVideoCallService] = useState<any>(null);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<Date | null>(null);
  const webrtcService = useRef<EnhancedWebRTCService | null>(null);

  const fetchTodaysPatients = async () => {
    try {
      // Fetch today's appointments
      const response = await axios.get('http://localhost:3000/api/appointments/my/upcoming', {
        withCredentials: true,
      });
      
      const today = new Date().toISOString().split('T')[0];
      const todaysAppointments = response.data.filter((apt: any) => 
        new Date(apt.date).toISOString().split('T')[0] === today
      );
      
      if (todaysAppointments.length > 0) {
        const nextAppointment = todaysAppointments[0];
        const patient: Patient = {
          id: nextAppointment.patient?._id || 'unknown',
          name: nextAppointment.patient?.fullname || 'Patient',
          age: nextAppointment.patient?.age || 30,
          condition: nextAppointment.reason || 'General Consultation',
          appointmentTime: nextAppointment.time || '00:00'
        };
        setCurrentPatient(patient);
        setCurrentAppointmentId(nextAppointment._id || '');
      } else {
        // Default patient if no appointments
        setCurrentPatient({
          id: 'demo',
          name: 'Demo Patient',
          age: 30,
          condition: 'Video Call Demo',
          appointmentTime: 'Now'
        });
      }
    } catch (error) {
      console.error('Failed to fetch today\'s appointments:', error);
      // Fallback patient
      setCurrentPatient({
        id: 'demo',
        name: 'Demo Patient',
        age: 30,
        condition: 'Video Call Demo',
        appointmentTime: 'Now'
      });
    }
  };

  // Fetch current doctor data
  const fetchDoctorData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/doctors/me', {
        withCredentials: true,
      });
      setDoctorData(response.data);
    } catch (error) {
      console.error('Failed to fetch doctor data:', error);
    }
  };

  const openPrescriptionForm = () => {
    if (currentPatient) {
      setIsPrescriptionFormOpen(true);
    } else {
      alert('Please start a consultation with a patient first.');
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData: any) => {
    try {
      const response = await axios.post('http://localhost:3000/api/prescriptions', prescriptionData, {
        withCredentials: true,
      });
      
      if (response.status === 201) {
        alert('Prescription created successfully!');
        setIsPrescriptionFormOpen(false);
        
        // Add prescription notification to chat
        const prescriptionMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'doctor',
          message: `📋 Prescription has been written and saved. Prescription Number: ${response.data.prescriptionNumber}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, prescriptionMessage]);
      }
    } catch (error) {
      console.error('Failed to create prescription:', error);
      alert('Failed to create prescription. Please try again.');
    }
  };

  useEffect(() => {
    fetchTodaysPatients();
    fetchDoctorData();
    
    // Check WebRTC support
    if (!isWebRTCSupported()) {
      alert('WebRTC is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }
    
    setIsWebRTCReady(true);
    
    // Initialize Enhanced WebRTC service for doctors
    const initializeWebRTC = async () => {
      try {
        // Get current doctor ID
        const response = await axios.get('http://localhost:3000/api/doctors/me', {
          withCredentials: true,
        });
        const doctorId = response.data._id;
        
        webrtcService.current = new EnhancedWebRTCService(doctorId, 'doctor');
        
        // Initialize video call notification service
        const { initializeVideoCallNotificationService } = await import('../../utils/video-call-notifications');
        const videoCallService = initializeVideoCallNotificationService(doctorId, 'doctor');
        setVideoCallService(videoCallService);
        
        // Setup WebRTC event handlers
        webrtcService.current.onLocalStream = (stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        };
        
        webrtcService.current.onRemoteStream = (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        };
        
        webrtcService.current.onConnectionStateChange = (state) => {
          setConnectionStatus(state);
          if (state === 'connected') {
            console.log('WebRTC connection established');
          }
        };
        
        webrtcService.current.onCallEnd = () => {
          handleCallEnd();
        };
        
        webrtcService.current.onError = (error) => {
          console.error('WebRTC Error:', error);
          alert('An error occurred during the call. Please try again.');
        };

        webrtcService.current.onIncomingCall = (callData) => {
          console.log('Doctor received incoming call:', callData);
          // Handle incoming call through notification system instead
          handleIncomingCallFromNotification(callData);
        };

        webrtcService.current.onChatMessage = (message) => {
          const chatMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: message.userType === 'doctor' ? 'doctor' : 'patient',
            message: message.message,
            timestamp: new Date(message.timestamp)
          };
          setChatMessages(prev => [...prev, chatMessage]);
        };

        // Setup video call notification listeners
        videoCallService.onIncomingVideoCall((data: any) => {
          console.log('Incoming video call notification:', data);
          // Show notification and handle the call
          handleIncomingCallFromNotification(data);
        });
        
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        alert('Failed to initialize video call service. Please refresh the page.');
      }
    };

    initializeWebRTC();
    
    return () => {
      if (webrtcService.current) {
        webrtcService.current.disconnect();
      }
      if (videoCallService) {
        videoCallService.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isCallActive && callStartTime.current) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callStartTime.current!.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    if (webrtcService.current) {
      webrtcService.current.toggleVideo(newVideoState);
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    if (webrtcService.current) {
      webrtcService.current.toggleAudio(newAudioState);
    }
  };

  // Handle incoming call from video call notification
  const handleIncomingCallFromNotification = async (callData: any) => {
    if (!webrtcService.current || !isWebRTCReady) {
      alert('WebRTC is not ready. Please refresh the page and try again.');
      return;
    }

    try {
      // Update patient information
      const patient: Patient = {
        id: callData.patientId,
        name: callData.patientName,
        age: 30, // Default age, could be fetched from API
        condition: callData.specialization || 'Video Consultation',
        appointmentTime: 'Now'
      };
      setCurrentPatient(patient);
      setCurrentAppointmentId(callData.appointmentId || '');

      setCallId(callData.callId);
      setIsCallActive(true);
      callStartTime.current = new Date();
      setCallDuration(0);
      setConnectionStatus('connecting');

      // Doctor joins the call initiated by patient
      await webrtcService.current.initializeCall(callData.callId, false);
      
      console.log('Doctor joined call from notification with ID:', callData.callId);
    } catch (error) {
      console.error('Failed to join call from notification:', error);
      alert('Failed to join the call. Please check your camera and microphone permissions.');
      handleCallEnd();
    }
  };

  const endCall = () => {
    if (webrtcService.current) {
      webrtcService.current.endCall();
    }
    handleCallEnd();
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    callStartTime.current = null;
    setCallDuration(0);
    setConnectionStatus('disconnected');
    setCallId('');
    
    // Clear local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    // Clear active call ID
    localStorage.removeItem('activeCallId');
  };

  const toggleScreenShare = async () => {
    if (!webrtcService.current) return;

    try {
      if (!isScreenSharing) {
        await webrtcService.current.startScreenShare();
        setIsScreenSharing(true);
      } else {
        await webrtcService.current.stopScreenShare();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      alert('Failed to toggle screen sharing.');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'doctor',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, message]);
      
      // Send message through WebRTC service
      if (webrtcService.current) {
        webrtcService.current.sendChatMessage(newMessage);
      }
      
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Video Consultation</h1>
          <p className="text-gray-600">Conduct secure video consultations with your patients</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Area */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Patient Info Header */}
              {currentPatient && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FaUser className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{currentPatient.name}</h3>
                        <p className="text-emerald-100">{currentPatient.age} years • {currentPatient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-100">Scheduled: {currentPatient.appointmentTime}</p>
                      {isCallActive && (
                        <p className="font-bold flex items-center gap-2">
                          <FaClock className="w-4 h-4" />
                          {formatDuration(callDuration)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900">
                {isCallActive ? (
                  <>
                    {/* Remote Video (Patient) */}
                    <video
                      ref={remoteVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    
                    {/* Local Video (Doctor) - Picture in Picture */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-emerald-500">
                      <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <FaVideoSlash className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-medium">
                        You
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                      connectionStatus === 'connected' ? 'bg-green-500 text-white' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {connectionStatus === 'connected' ? 'Connected' :
                       connectionStatus === 'connecting' ? 'Connecting...' :
                       'Disconnected'}
                    </div>

                    {/* Call ID Display */}
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs">
                      Call ID: {callId}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaVideo className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Waiting for patient calls</h3>
                      <p className="text-gray-300 mb-6">
                        {!isWebRTCReady ? 'Initializing WebRTC...' : 'Patients can call you directly. You will receive notifications when they do.'}
                      </p>
                      <div className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto opacity-75">
                        <FaVideo className="w-5 h-5" />
                        Ready to Receive Calls
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isAudioEnabled
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <FaMicrophone className="w-6 h-6" />
                    ) : (
                      <FaMicrophoneSlash className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isVideoEnabled
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <FaCamera className="w-6 h-6" />
                    ) : (
                      <FaVideoSlash className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    disabled={!isCallActive}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isScreenSharing
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <FaDesktop className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-14 h-14 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center transition-all duration-300"
                  >
                    <FaComments className="w-6 h-6" />
                  </button>

                  {isCallActive && (
                    <button
                      onClick={endCall}
                      className="w-14 h-14 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all duration-300 animate-pulse"
                    >
                      <FaPhoneSlash className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Patient Details */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Patient Information</h3>
              {currentPatient && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{currentPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{currentPatient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Consultation Type</p>
                    <p className="font-medium">{currentPatient.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Appointment Time</p>
                    <p className="font-medium">{currentPatient.appointmentTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={openPrescriptionForm}
                  className="w-full bg-emerald-500 text-white py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors duration-300 flex items-center gap-2"
                >
                  <FaPills className="w-4 h-4" />
                  Write Prescription
                </button>
                <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 flex items-center gap-2">
                  <FaClock className="w-4 h-4" />
                  Schedule Follow-up
                </button>
                <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2">
                  <FaFileAlt className="w-4 h-4" />
                  Medical Notes
                </button>
              </div>
            </div>

            {/* Chat */}
            {showChat && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">Chat</h3>
                <div className="h-60 border border-gray-200 rounded-xl p-4 mb-4 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet</p>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-xl ${
                              msg.sender === 'doctor'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors duration-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Prescription Form Modal */}
      <PrescriptionForm
        isOpen={isPrescriptionFormOpen}
        onClose={() => setIsPrescriptionFormOpen(false)}
        patientData={currentPatient}
        doctorData={doctorData}
        appointmentId={currentAppointmentId}
        onSubmit={handlePrescriptionSubmit}
      />
    </div>
  );
};

export default VideoConsultation;
