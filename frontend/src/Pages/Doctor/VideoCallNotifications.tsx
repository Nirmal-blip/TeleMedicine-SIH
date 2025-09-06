import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaBell, 
  FaVideo, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaUser,
  FaStethoscope,
  FaPhone,
  FaExclamationTriangle
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";
import { getVideoCallNotificationService } from "../../utils/video-call-notifications";
import { useNavigate } from "react-router-dom";

interface VideoCallNotification {
  _id: string;
  type: 'video_call_request' | 'video_call_accepted' | 'video_call_rejected';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sender?: {
    _id: string;
    name: string;
    email: string;
  };
  metadata?: {
    callId?: string;
    patientName?: string;
    specialization?: string;
    requestedAt?: string;
    appointmentId?: string;
  };
}

const DoctorVideoCallNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<VideoCallNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoCallService, setVideoCallService] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    fetchVideoCallNotifications();
    initializeVideoCallService();
  }, []);

  const initializeVideoCallService = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true
      });
      
      const doctorId = response.data.user.userId;
      
      // Initialize the video call notification service
      const { initializeVideoCallNotificationService } = await import('../../utils/video-call-notifications');
      const service = initializeVideoCallNotificationService(doctorId, 'doctor');
      setVideoCallService(service);
      
      // Set up event listeners
      setupVideoCallListeners(service);
    } catch (error) {
      console.error('Error initializing video call service:', error);
    }
  };

  const setupVideoCallListeners = (service: any) => {
    service.onIncomingVideoCall((data: any) => {
      console.log('Incoming video call:', data);
      setIncomingCall(data);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Incoming Video Call', {
          body: `${data.patientName} is requesting a video consultation`,
          icon: '/favicon.ico'
        });
      }
      
      // Refresh notifications
      fetchVideoCallNotifications();
    });

    service.onCallAcceptedConfirmation((data: any) => {
      console.log('Call accepted confirmation:', data);
      setIncomingCall(null);
      fetchVideoCallNotifications();
    });

    service.onCallRejectedConfirmation((data: any) => {
      console.log('Call rejected confirmation:', data);
      setIncomingCall(null);
      fetchVideoCallNotifications();
    });

    service.onNewNotification((data: any) => {
      console.log('New notification:', data);
      fetchVideoCallNotifications();
    });
  };

  const fetchVideoCallNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/video-call-notifications/my-notifications', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching video call notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCall = (notification: VideoCallNotification) => {
    if (!videoCallService || !notification.metadata?.callId) return;
    
    // Accept the call
    videoCallService.acceptVideoCall(
      notification.metadata.callId,
      notification.sender?._id
    );
    
    // Mark notification as read
    markAsRead(notification._id);
    
    // Clear incoming call
    setIncomingCall(null);
    
    // Navigate to video consultation page
    setTimeout(() => {
      navigate('/doctor/video-consultation');
    }, 1000);
  };

  const handleRejectCall = (notification: VideoCallNotification) => {
    if (!videoCallService || !notification.metadata?.callId) return;
    
    // Reject the call
    videoCallService.rejectVideoCall(
      notification.metadata.callId,
      notification.sender?._id,
      'Doctor is not available'
    );
    
    // Mark notification as read
    markAsRead(notification._id);
    
    // Clear incoming call
    setIncomingCall(null);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post(`http://localhost:3000/api/video-call-notifications/mark-read/${notificationId}`, {}, {
        withCredentials: true
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'video_call_request':
        return <FaVideo className="text-blue-600" />;
      case 'video_call_accepted':
        return <FaCheck className="text-green-600" />;
      case 'video_call_rejected':
        return <FaTimes className="text-red-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'border-red-500 bg-red-50';
      case 'High':
        return 'border-orange-500 bg-orange-50';
      case 'Medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'Low':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <DoctorSidebar />
        <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Video Call Notifications</h1>
              <p className="text-gray-600">Manage incoming video call requests</p>
            </div>
            <div className="flex items-center gap-4">
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {notifications.filter(n => !n.isRead).length} unread
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Incoming Call Alert */}
        {incomingCall && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaPhone className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-800">Incoming Video Call</h3>
                  <p className="text-blue-600">
                    {incomingCall.patientName} is requesting a video consultation for {incomingCall.specialization}
                  </p>
                  <p className="text-sm text-blue-500 mt-1">
                    {formatTime(incomingCall.requestedAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAcceptCall({
                    _id: '',
                    type: 'video_call_request',
                    title: '',
                    message: '',
                    createdAt: '',
                    isRead: false,
                    priority: 'High',
                    metadata: { callId: incomingCall.callId },
                    sender: { _id: incomingCall.patientId, name: incomingCall.patientName, email: '' }
                  })}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors duration-300 font-medium flex items-center gap-2"
                >
                  <FaCheck />
                  Accept
                </button>
                <button
                  onClick={() => handleRejectCall({
                    _id: '',
                    type: 'video_call_request',
                    title: '',
                    message: '',
                    createdAt: '',
                    isRead: false,
                    priority: 'High',
                    metadata: { callId: incomingCall.callId },
                    sender: { _id: incomingCall.patientId, name: incomingCall.patientName, email: '' }
                  })}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-300 font-medium flex items-center gap-2"
                >
                  <FaTimes />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Video Call Notifications</h3>
              <p className="text-gray-500">You'll see incoming video call requests here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 rounded-2xl border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-white shadow-md' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-full">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        
                        {notification.metadata && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            {notification.metadata.patientName && (
                              <div className="flex items-center gap-1">
                                <FaUser />
                                <span>{notification.metadata.patientName}</span>
                              </div>
                            )}
                            {notification.metadata.specialization && (
                              <div className="flex items-center gap-1">
                                <FaStethoscope />
                                <span>{notification.metadata.specialization}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <FaClock />
                              <span>{formatTime(notification.createdAt)}</span>
                            </div>
                          </div>
                        )}

                        {notification.type === 'video_call_request' && !notification.isRead && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptCall(notification)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium flex items-center gap-2"
                            >
                              <FaCheck />
                              Accept Call
                            </button>
                            <button
                              onClick={() => handleRejectCall(notification)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 font-medium flex items-center gap-2"
                            >
                              <FaTimes />
                              Reject Call
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorVideoCallNotifications;
