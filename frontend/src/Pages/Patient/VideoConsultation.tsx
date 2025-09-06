import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../Components/Sidebar'
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhone, FaPhoneSlash, FaUser, FaCalendar, FaClock, FaStethoscope, FaHeart, FaPaperclip, FaSmile, FaFileAlt } from 'react-icons/fa'
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

interface Consultation {
  id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  duration: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  meetingId: string;
  reason: string;
}

const VideoConsultation: React.FC = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<Consultation | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: number, sender: string, message: string, timestamp: string}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const consultations: Consultation[] = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "45 minutes",
      status: "Scheduled",
      meetingId: "MEET-001",
      reason: "Regular Checkup"
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialization: "Dermatologist",
      date: "2024-01-18",
      time: "2:30 PM",
      duration: "30 minutes",
      status: "Scheduled",
      meetingId: "MEET-002",
      reason: "Skin Consultation"
    }
  ];

  const upcomingConsultation = consultations.find(c => c.status === 'Scheduled');

  const startCall = (consultation: Consultation) => {
    setCurrentConsultation(consultation);
    setIsCallActive(true);
    // Simulate starting video call
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          videoRef.current!.srcObject = stream;
        })
        .catch(err => console.error('Error accessing media devices:', err));
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCurrentConsultation(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'You',
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
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
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Doctor Video Placeholder */}
              <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold">{currentConsultation.doctorName}</p>
                  <p className="text-sm text-gray-300">Connecting...</p>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isAudioOn ? <FaMicrophone className="w-6 h-6 text-white" /> : <FaMicrophoneSlash className="w-6 h-6 text-white" />}
                </button>
                
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoOn ? <FaVideo className="w-6 h-6 text-white" /> : <FaVideoSlash className="w-6 h-6 text-white" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300"
                >
                  <FaPhoneSlash className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Chat</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.sender === 'You' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-700 text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
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

        {/* Upcoming Consultation */}
        {upcomingConsultation && (
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
                  className="btn-primary flex items-center gap-2"
                >
                  <FaVideo className="w-4 h-4" />
                  Start Call
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
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <FaVideo className="w-4 h-4" />
                      Join Call
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