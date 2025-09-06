import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import PrescriptionForm from '../../Components/PrescriptionForm'
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhone, FaPhoneSlash, FaUser, FaCalendar, FaClock, FaStethoscope, FaHeart, FaPaperclip, FaSmile, FaFileAlt, FaPills } from 'react-icons/fa'
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { EnhancedWebRTCService, generateCallId, isWebRTCSupported, ChatMessage } from "../../utils/enhanced-webrtc";
import { getVideoCallNotificationService } from "../../utils/video-call-notifications";

interface Consultation {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  duration: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  meetingId: string;
  reason: string;
  appointmentId: string;
  doctorId: string;
}

const VideoConsultation: React.FC = () => {
  const location = useLocation();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<Consultation | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [callId, setCallId] = useState<string>('');
  const [isWebRTCReady, setIsWebRTCReady] = useState<boolean>(false);
  const [waitingForDoctor, setWaitingForDoctor] = useState<boolean>(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [callingDoctor, setCallingDoctor] = useState<any>(null);
  const [isPatientInitiated, setIsPatientInitiated] = useState<boolean>(false);
  const [videoCallService, setVideoCallService] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState<boolean>(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcService = useRef<EnhancedWebRTCService | null>(null);

  const upcomingConsultation = consultations.find(c => c.status === 'Scheduled');

  useEffect(() => {
    fetchConsultations();
    getCurrentUser();
    checkForActiveAppointment();
    checkForDirectCall();
  }, []);

  const checkForDirectCall = () => {
    // Check if user came from direct doctor calling
    if (location.state?.callingDoctor && location.state?.isPatientInitiated) {
      const doctor = location.state.callingDoctor;
      setCallingDoctor(doctor);
      setIsPatientInitiated(true);
      setWaitingForDoctor(true);
      
      // Create a consultation object for the direct call
      setCurrentConsultation({
        id: `direct-${Date.now()}`,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        duration: '30 minutes',
        status: 'Scheduled',
        meetingId: `call-${Date.now()}`,
        reason: 'Direct consultation request',
        appointmentId: `direct-${Date.now()}`,
        doctorId: doctor.id
      });
    }
  };

  const checkForActiveAppointment = () => {
    // Check if user came from appointment booking
    const activeAppointmentData = localStorage.getItem('activeAppointment');
    if (activeAppointmentData) {
      try {
        const appointmentData = JSON.parse(activeAppointmentData);
        console.log('Found active appointment:', appointmentData);
        
        // Set up for immediate video consultation
        setCallId(appointmentData.callId);
        setCurrentConsultation({
          id: appointmentData.appointmentId,
          doctorName: appointmentData.doctorName,
          specialization: 'General Medicine',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          duration: '30 minutes',
          status: 'Scheduled',
          meetingId: appointmentData.callId,
          reason: 'Immediate consultation',
          appointmentId: appointmentData.appointmentId,
          doctorId: appointmentData.doctorId
        });
        
        // Clear the stored data
        localStorage.removeItem('activeAppointment');
        
        // Show notification that doctor will be notified
        setWaitingForDoctor(true);
        
        // Notify the doctor about the consultation request
        notifyDoctorForConsultation(appointmentData);
        
      } catch (error) {
        console.error('Error parsing active appointment data:', error);
        localStorage.removeItem('activeAppointment');
      }
    }
  };

  const notifyDoctorForConsultation = async (appointmentData: any) => {
    try {
      // Notify the doctor through the backend
      await axios.post('http://localhost:3000/api/video-consultation/start-call', {
        appointmentId: appointmentData.appointmentId,
        patientId: currentUserId,
        callId: appointmentData.callId
      }, {
        withCredentials: true
      });
      
      console.log('Doctor notified for consultation');
    } catch (error) {
      console.error('Failed to notify doctor:', error);
      setError('Failed to connect with doctor. Please try again.');
      setWaitingForDoctor(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      initializeWebRTC();
    }
  }, [currentUserId]);

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/patients/me', {
        withCredentials: true,
      });
      const userId = response.data._id;
      setCurrentUserId(userId);
      setPatientData(response.data);
      
      // Initialize video call notification service
      const { initializeVideoCallNotificationService } = await import('../../utils/video-call-notifications');
      const service = initializeVideoCallNotificationService(userId, 'patient');
      setVideoCallService(service);
      
      // Set up event listeners for call responses
      service.onCallAccepted((data: any) => {
        console.log('Call accepted by doctor:', data);
        setWaitingForDoctor(false);
        setIsCallActive(true);
        setCallId(data.callId);
        setConnectionStatus('connecting');
        
        // Initialize WebRTC for the accepted call
        if (webrtcService.current) {
          webrtcService.current.initializeCall(data.callId, true);
        }
      });
      
      service.onCallRejected((data: any) => {
        console.log('Call rejected by doctor:', data);
        setWaitingForDoctor(false);
        alert(`Call rejected: ${data.reason || 'Doctor is not available'}`);
        setCurrentConsultation(null);
        setCallingDoctor(null);
      });
      
      console.log('Video call notification service initialized for patient:', userId);
    } catch (error) {
      console.error('Failed to get current user:', error);
      setError('Failed to authenticate user');
    }
  };

  const openPrescriptionForm = () => {
    if (currentConsultation) {
      // Fetch doctor data for the current consultation
      fetchDoctorData(currentConsultation.doctorId);
      setIsPrescriptionFormOpen(true);
    } else {
      alert('No active consultation found. Please start a video call first.');
    }
  };

  const fetchDoctorData = async (doctorId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/doctors/${doctorId}`, {
        withCredentials: true,
      });
      setDoctorData(response.data);
    } catch (error) {
      console.error('Failed to fetch doctor data:', error);
      // Use consultation data as fallback
      setDoctorData({
        _id: currentConsultation?.doctorId,
        fullname: currentConsultation?.doctorName,
        specialization: currentConsultation?.specialization
      });
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
        
        // Send notification to patient about new prescription
        if (webrtcService.current) {
          webrtcService.current.sendChatMessage(`📋 Prescription has been written and saved. Prescription Number: ${response.data.prescriptionNumber}`);
        }
      }
    } catch (error) {
      console.error('Failed to create prescription:', error);
      alert('Failed to create prescription. Please try again.');
    }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      // Fetch upcoming appointments for video consultation
      const upcomingResponse = await axios.get('http://localhost:3000/api/video-consultation/upcoming-appointments', {
        withCredentials: true,
      });
      
      // Fetch consultation history
      const historyResponse = await axios.get('http://localhost:3000/api/video-consultation/call-history', {
        withCredentials: true,
      });

      // Transform appointments to consultation format
      const upcomingConsultations: Consultation[] = upcomingResponse.data.map((apt: any) => ({
        id: apt._id,
        doctorName: apt.doctor?.fullname || 'Unknown Doctor',
        specialization: apt.doctor?.specialization || 'General Medicine',
        date: new Date(apt.date).toISOString().split('T')[0],
        time: apt.time || '00:00',
        duration: apt.duration ? `${apt.duration} minutes` : '30 minutes',
        status: apt.status === 'Confirmed' ? 'Scheduled' : apt.status,
        meetingId: apt.callId || `MEET-${apt._id}`,
        reason: apt.reason || 'General consultation',
        appointmentId: apt._id,
        doctorId: apt.doctor?._id || ''
      }));

      // Transform history to consultation format
      const historyConsultations: Consultation[] = historyResponse.data.map((apt: any) => ({
        id: apt._id,
        doctorName: apt.doctor?.fullname || 'Unknown Doctor',
        specialization: apt.doctor?.specialization || 'General Medicine',
        date: new Date(apt.date).toISOString().split('T')[0],
        time: apt.time || '00:00',
        duration: apt.duration ? `${apt.duration} minutes` : '30 minutes',
        status: 'Completed',
        meetingId: apt.callId || `MEET-${apt._id}`,
        reason: apt.reason || 'General consultation',
        appointmentId: apt._id,
        doctorId: apt.doctor?._id || ''
      }));

      // Combine and sort consultations
      const allConsultations = [...upcomingConsultations, ...historyConsultations];
      setConsultations(allConsultations);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebRTC = () => {
    // Check WebRTC support
    if (!isWebRTCSupported()) {
      alert('WebRTC is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }
    
    setIsWebRTCReady(true);
    
    // Initialize Enhanced WebRTC service
    webrtcService.current = new EnhancedWebRTCService(currentUserId, 'patient');
    
    // Setup WebRTC event handlers
    if (webrtcService.current) {
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
          setWaitingForDoctor(false);
        }
      };
      
      webrtcService.current.onCallEnd = () => {
        handleCallEnd();
      };
      
      webrtcService.current.onError = (error) => {
        console.error('WebRTC Error:', error);
        alert('An error occurred during the call. Please try again.');
      };

      webrtcService.current.onChatMessage = (message) => {
        setChatMessages(prev => [...prev, message]);
      };

      webrtcService.current.onIncomingCall = (callData) => {
        setCallId(callData.callId);
        setWaitingForDoctor(true);
      };
    }

    return () => {
      if (webrtcService.current) {
        webrtcService.current.disconnect();
      }
    };
  };

  const startCall = async (consultation: Consultation) => {
    if (!webrtcService.current || !isWebRTCReady) {
      alert('WebRTC is not ready. Please refresh the page and try again.');
      return;
    }

    try {
      setCurrentConsultation(consultation);
      setIsCallActive(true);
      setConnectionStatus('connecting');
      setCallId(consultation.meetingId);

      // Patient joins the call using appointment ID
      await webrtcService.current.joinCall(consultation.meetingId, consultation.appointmentId);
      
      console.log('Joined call for appointment:', consultation.appointmentId);
    } catch (error) {
      console.error('Failed to join call:', error);
      alert('Failed to join the call. Please check your camera and microphone permissions.');
      handleCallEnd();
    }
  };

  const joinWaitingCall = async () => {
    if (!webrtcService.current || !callId) return;
    
    try {
      setIsCallActive(true);
      setConnectionStatus('connecting');
      
      await webrtcService.current.joinCall(callId);
      setWaitingForDoctor(false);
      
      console.log('Joined waiting call with ID:', callId);
    } catch (error) {
      console.error('Failed to join waiting call:', error);
      alert('Failed to join the call. Please try again.');
      setWaitingForDoctor(false);
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
    setCurrentConsultation(null);
    setConnectionStatus('disconnected');
    setCallId('');
    setWaitingForDoctor(false);
    
    // Clear local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    // Clear remote video  
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim() && webrtcService.current) {
      webrtcService.current.sendChatMessage(chatMessage);
      setChatMessage('');
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    if (webrtcService.current) {
      webrtcService.current.toggleVideo(newVideoState);
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    if (webrtcService.current) {
      webrtcService.current.toggleAudio(newAudioState);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isCallActive && currentConsultation) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          {/* Call Header */}
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <FaStethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">{currentConsultation.doctorName}</h2>
                <p className="text-gray-300 text-sm">{currentConsultation.specialization}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white text-sm">
                {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={endCall}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300"
              >
                <FaPhoneSlash className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Video Call Interface */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 relative bg-gray-800">
              {/* Remote Video (Doctor) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local Video (Patient) - Picture in Picture */}
              <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-emerald-500">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoOn && (
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
              {callId && (
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs">
                  Call ID: {callId}
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={toggleAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isAudioOn ? <FaMicrophone className="w-6 h-6 text-white" /> : <FaMicrophoneSlash className="w-6 h-6 text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoOn ? <FaVideo className="w-6 h-6 text-white" /> : <FaVideoSlash className="w-6 h-6 text-white" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300 animate-pulse"
                >
                  <FaPhoneSlash className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Chat</h3>
                  <button
                    onClick={openPrescriptionForm}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 text-sm"
                    title="Write Prescription"
                  >
                    <FaPills className="w-4 h-4" />
                    Write Prescription
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div key={`${msg.userId}-${msg.timestamp}-${index}`} className={`flex ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.userId === currentUserId 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-700 text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-emerald-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                  >
                    <IoChatbubbleEllipsesSharp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading video consultations...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Video Consultations</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError('');
                  fetchConsultations();
                }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaVideo className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">Video Consultation</h1>
              <p className="text-gray-600">Connect with doctors through secure video calls</p>
            </div>
          </div>
        </div>

        {/* Patient-initiated Call Waiting */}
        {waitingForDoctor && !isCallActive && isPatientInitiated && (
          <div className="card p-8 rounded-2xl mb-8 animate-fade-scale bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <FaPhone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">
                    Calling {callingDoctor?.name}...
                  </h3>
                  <p className="text-emerald-600">
                    Waiting for {callingDoctor?.name} to accept your call. Please wait...
                  </p>
                  <p className="text-sm text-emerald-500 mt-1">
                    Specialization: {callingDoctor?.specialization}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setWaitingForDoctor(false);
                    setCurrentConsultation(null);
                    setCallingDoctor(null);
                    setIsPatientInitiated(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <FaPhoneSlash className="w-5 h-5" />
                  Cancel Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Call Notification */}
        {waitingForDoctor && !isCallActive && !isPatientInitiated && (
          <div className="card p-8 rounded-2xl mb-8 animate-fade-scale bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-bounce">
                  <FaVideo className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">
                    {currentConsultation ? 'Calling Doctor...' : 'Doctor is calling!'}
                  </h3>
                  <p className="text-blue-600">
                    {currentConsultation 
                      ? `Connecting with ${currentConsultation.doctorName}. Please wait...`
                      : 'A doctor has started a video consultation. Click to join.'
                    }
                  </p>
                  <p className="text-sm text-blue-500 mt-1">Call ID: {callId}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={joinWaitingCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <FaVideo className="w-5 h-5" />
                  {currentConsultation ? 'Join When Ready' : 'Join Call'}
                </button>
                <button
                  onClick={() => {
                    setWaitingForDoctor(false);
                    setCurrentConsultation(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Find Available Doctors - Always Show */}
        {!waitingForDoctor && !isCallActive && (
          <div className="card p-8 rounded-2xl mb-8 animate-fade-scale bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <FaStethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Start Video Consultation</h2>
                <p className="text-gray-600">Connect with available doctors for immediate or scheduled consultations</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/patient/doctors'}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-300 font-medium"
              >
                <FaVideo className="w-5 h-5" />
                Find Available Doctors
              </button>
              <button
                onClick={() => window.location.href = '/appointments'}
                className="flex items-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors duration-300 font-medium"
              >
                <FaCalendar className="w-5 h-5" />
                View My Appointments
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Consultation */}
        {upcomingConsultation && !waitingForDoctor && (
          <div className="card p-8 rounded-2xl mb-8 animate-fade-scale">
            <div className="flex items-center gap-3 mb-6">
              <FaCalendar className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Consultation</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FaStethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">{upcomingConsultation.doctorName}</h3>
                  <p className="text-emerald-600 font-medium">{upcomingConsultation.specialization}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="w-4 h-4 text-emerald-500" />
                      <span>{new Date(upcomingConsultation.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="w-4 h-4 text-emerald-500" />
                      <span>{upcomingConsultation.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => startCall(upcomingConsultation)}
                  disabled={!isWebRTCReady}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaVideo className="w-4 h-4" />
                  {!isWebRTCReady ? 'Loading...' : 'Start Call'}
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <FaHeart className="w-4 h-4" />
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Consultation History */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-secondary">Consultation History</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {consultations.map((consultation, index) => (
              <div 
                key={consultation.id} 
                className="card card-hover p-6 rounded-2xl animate-fade-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <FaStethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{consultation.doctorName}</h3>
                      <p className="text-emerald-600 font-medium">{consultation.specialization}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consultation.status)}`}>
                    {consultation.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaCalendar className="w-4 h-4 text-emerald-500" />
                    <span>{new Date(consultation.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaClock className="w-4 h-4 text-emerald-500" />
                    <span>{consultation.time} • {consultation.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaHeart className="w-4 h-4 text-emerald-500" />
                    <span>{consultation.reason}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {consultation.status === 'Scheduled' && (
                    <button
                      onClick={() => startCall(consultation)}
                      disabled={!isWebRTCReady}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaVideo className="w-4 h-4" />
                      {!isWebRTCReady ? 'Loading...' : 'Join Call'}
                    </button>
                  )}
                  
                  {consultation.status === 'Completed' && (
                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                      <FaFileAlt className="w-4 h-4" />
                      View Report
                    </button>
                  )}
                  
                  <button className="btn-secondary flex items-center gap-2">
                    <FaPaperclip className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaSmile className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Video Consultation Tips</h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>• Ensure you have a stable internet connection before starting the call</p>
                <p>• Find a quiet, well-lit space for your consultation</p>
                <p>• Test your camera and microphone before the appointment</p>
                <p>• Have your medical records and questions ready</p>
                <p>• Be prepared to describe your symptoms clearly</p>
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  )
}

export default VideoConsultation