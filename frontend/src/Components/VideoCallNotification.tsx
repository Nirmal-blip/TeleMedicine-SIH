import React, { useState, useEffect } from 'react';
import { FaVideo, FaPhone, FaUser, FaClock } from 'react-icons/fa';
import { VideoCallService, VideoCallNotification, initializeVideoCallService } from '../utils/video-call';
import axios from 'axios';

interface VideoCallNotificationProps {
  isDoctor?: boolean;
}

const VideoCallNotificationComponent: React.FC<VideoCallNotificationProps> = ({ isDoctor = true }) => {
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [incomingCalls, setIncomingCalls] = useState<VideoCallNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isDoctor) {
      initializeVideoCallService();
    }

    return () => {
      if (videoCallService) {
        videoCallService.disconnect();
      }
    };
  }, []);

  const initializeVideoCallService = async () => {
    try {
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      
      const userId = response.data.user.userId;
      const service = initializeVideoCallService(userId, 'doctor');
      setVideoCallService(service);
      setIsInitialized(true);
      
      // Set up event listeners for incoming calls
      service.onIncomingVideoCall((data) => {
        console.log('Incoming video call:', data);
        setIncomingCalls(prev => [...prev, data]);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('Incoming Video Call', {
            body: `${data.patientName} is requesting a video consultation for ${data.specialization}`,
            icon: '/user.jpg'
          });
        }
      });
      
      service.onCallAcceptedConfirmation((data) => {
        console.log('Call accepted confirmation:', data);
        // Remove from incoming calls and navigate to video call
        setIncomingCalls(prev => prev.filter(call => call.callId !== data.callId));
        window.location.href = data.videoCallUrl;
      });
      
      service.onCallRejectedConfirmation((data) => {
        console.log('Call rejected confirmation:', data);
        // Remove from incoming calls
        setIncomingCalls(prev => prev.filter(call => call.callId !== data.callId));
      });
      
      // Request notification permission
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
    }
  };

  const acceptCall = (callId: string) => {
    if (videoCallService) {
      videoCallService.acceptVideoCall(callId);
    }
  };

  const rejectCall = (callId: string, reason?: string) => {
    if (videoCallService) {
      videoCallService.rejectVideoCall(callId, reason);
      setIncomingCalls(prev => prev.filter(call => call.callId !== callId));
    }
  };

  if (!isDoctor || !isInitialized) {
    return null;
  }

  return (
    <>
      {/* Incoming Call Notifications */}
      {incomingCalls.map((call) => (
        <div
          key={call.callId}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-96 animate-slide-in"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{call.patientName}</h3>
              <p className="text-sm text-gray-600">{call.specialization}</p>
            </div>
            <div className="text-right">
              <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mb-1"></div>
              <p className="text-xs text-gray-500">Incoming call</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FaClock className="text-xs" />
              <span>Requested: {new Date(call.requestedAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-gray-700">
              Patient is requesting a video consultation for <strong>{call.specialization}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => rejectCall(call.callId, 'Doctor is busy')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <FaPhone className="transform rotate-135" />
              Decline
            </button>
            <button
              onClick={() => acceptCall(call.callId)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              <FaVideo />
              Accept
            </button>
          </div>

          <button
            onClick={() => setIncomingCalls(prev => prev.filter(c => c.callId !== call.callId))}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        </div>
      ))}

      {/* Connection Status Indicator */}
      {isInitialized && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Video calls enabled
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default VideoCallNotificationComponent;
