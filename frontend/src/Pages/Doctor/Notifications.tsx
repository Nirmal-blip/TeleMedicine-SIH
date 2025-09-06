import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaBell, 
  FaCalendar, 
  FaUser,
  FaStethoscope,
  FaPills,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaClock,
  FaVideo,
  FaFileAlt,
  FaPhone,
  FaTimes
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";
import { getNotificationService } from "../../utils/real-time-notifications";
import { VideoCallService, initializeVideoCallService, getVideoCallService } from "../../utils/video-call";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  type: 'appointment_booked' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder' | 'prescription_ready' | 'message_received' | 'payment_received' | 'profile_updated' | 'system_maintenance' | 'emergency_alert' | 'video_call_request' | 'video_call_accepted' | 'video_call_rejected' | 'video_call_ended';
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
  actionUrl?: string;
  actionText?: string;
  relatedEntity?: {
    entityType: 'Appointment' | 'Prescription' | 'Chat' | 'MedicalRecord';
    entityId: string;
  };
  metadata?: {
    callId?: string;
    patientName?: string;
    specialization?: string;
    requestedAt?: string;
  };
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [notificationService, setNotificationService] = useState<any>(null);
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);

  useEffect(() => {
    fetchNotifications();
    initializeNotificationService();
    initializeVideoCallServiceForDoctor();
  }, []);

  const initializeNotificationService = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true
      });
      
      const doctorId = response.data.user.userId;
      
      // Initialize notification service if not already done
      const service = getNotificationService();
      if (!service) {
        // Initialize the notification service
        const { initializeNotificationService } = await import('../../utils/real-time-notifications');
        const newService = initializeNotificationService(doctorId, 'doctor');
        setNotificationService(newService);
        
        // Set up event listeners
        setupNotificationListeners(newService);
      } else {
        setNotificationService(service);
        setupNotificationListeners(service);
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  };

  const initializeVideoCallServiceForDoctor = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true
      });
      
      const doctorId = response.data.user.userId;
      
      // Initialize video call service
      let service = getVideoCallService();
      if (!service) {
        service = initializeVideoCallService(doctorId, 'doctor');
      }
      setVideoCallService(service);
      
      // Set up video call event listeners
      setupVideoCallListeners(service);
    } catch (error) {
      console.error('Error initializing video call service:', error);
    }
  };

  const setupVideoCallListeners = (service: VideoCallService) => {
    console.log('Setting up video call listeners for doctor');
    
    // Listen for incoming video calls
    service.onIncomingVideoCall((data: any) => {
      console.log('🔥 INCOMING VIDEO CALL RECEIVED:', data);
      setIncomingCall(data);
      // Refresh notifications to include the new video call request
      fetchNotifications();
    });

    // Listen for call accepted confirmation
    service.onCallAcceptedConfirmation((data: any) => {
      console.log('Call accepted confirmation:', data);
      // Refresh notifications
      fetchNotifications();
    });

    // Listen for call rejected confirmation
    service.onCallRejectedConfirmation((data: any) => {
      console.log('Call rejected confirmation:', data);
      // Refresh notifications
      fetchNotifications();
    });

    // Listen for call errors
    service.onCallError((data: any) => {
      console.error('Video call error:', data);
      alert('Video call error: ' + data.message);
    });
  };

  const setupNotificationListeners = (service: any) => {
    // Listen for incoming video calls (backup from notification service)
    service.on('incoming-video-call', (data: any) => {
      console.log('Incoming video call notification (backup):', data);
      setIncomingCall(data);
      // Refresh notifications to include the new video call request
      fetchNotifications();
    });

    // Listen for new notifications in general
    service.on('new-notification', (data: any) => {
      console.log('New notification received:', data);
      // Refresh notifications list
      fetchNotifications();
    });

    // Listen for call accepted
    service.on('call-accepted-confirmation', (data: any) => {
      console.log('Call accepted:', data);
      // Refresh notifications
      fetchNotifications();
    });

    // Listen for call rejected
    service.on('call-rejected-confirmation', (data: any) => {
      console.log('Call rejected:', data);
      // Refresh notifications
      fetchNotifications();
    });
  };

  const acceptCall = () => {
    if (!incomingCall || !videoCallService) return;
    
    // Accept the video call using the video call service
    videoCallService.acceptVideoCall(incomingCall.callId);
    
    // Navigate to video consultation
    navigate('/doctor/video-consultation', {
      state: {
        callId: incomingCall.callId,
        patientId: incomingCall.patientId,
        patientName: incomingCall.patientName,
        isIncomingCall: true
      }
    });
    
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall || !videoCallService) return;
    
    // Reject the video call using the video call service
    videoCallService.rejectVideoCall(incomingCall.callId, 'Doctor is not available');
    
    setIncomingCall(null);
  };

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterStatus, searchQuery]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/notifications', {
        withCredentials: true,
      });
      
      // Handle both array response and object with notifications property
      const notificationsData = Array.isArray(response.data) ? response.data : response.data.notifications || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (notification.sender?.name && notification.sender.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'read' && notification.isRead) ||
                           (filterStatus === 'unread' && !notification.isRead);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort by timestamp (most recent first) and then by priority
    filtered.sort((a, b) => {
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      
      if (timeDiff === 0) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return timeDiff;
    });

    setFilteredNotifications(filtered);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_reminder':
        return <FaCalendar className="w-5 h-5" />;
      case 'prescription_ready':
        return <FaPills className="w-5 h-5" />;
      case 'emergency_alert':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'system_maintenance':
        return <FaInfoCircle className="w-5 h-5" />;
      case 'message_received':
        return <FaClock className="w-5 h-5" />;
      case 'payment_received':
        return <FaCheckCircle className="w-5 h-5" />;
      case 'video_call_request':
      case 'video_call_accepted':
      case 'video_call_rejected':
      case 'video_call_ended':
        return <FaVideo className="w-5 h-5" />;
      default:
        return <FaBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'Critical') return 'border-red-500 bg-red-50';
    if (priority === 'High') return 'border-orange-500 bg-orange-50';
    
    switch (type) {
      case 'appointment_booked':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_reminder':
        return 'border-blue-500 bg-blue-50';
      case 'prescription_ready':
        return 'border-purple-500 bg-purple-50';
      case 'emergency_alert':
        return 'border-red-500 bg-red-50';
      case 'system_maintenance':
        return 'border-gray-500 bg-gray-50';
      case 'message_received':
        return 'border-yellow-500 bg-yellow-50';
      case 'payment_received':
        return 'border-green-500 bg-green-50';
      case 'video_call_request':
        return 'border-emerald-500 bg-emerald-50';
      case 'video_call_accepted':
        return 'border-green-500 bg-green-50';
      case 'video_call_rejected':
        return 'border-red-500 bg-red-50';
      case 'video_call_ended':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'Critical') return 'text-red-600';
    if (priority === 'High') return 'text-orange-600';
    
    switch (type) {
      case 'appointment_booked':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_reminder':
        return 'text-blue-600';
      case 'prescription_ready':
        return 'text-purple-600';
      case 'emergency_alert':
        return 'text-red-600';
      case 'system_maintenance':
        return 'text-gray-600';
      case 'message_received':
        return 'text-yellow-600';
      case 'payment_received':
        return 'text-green-600';
      case 'video_call_request':
        return 'text-emerald-600';
      case 'video_call_accepted':
        return 'text-green-600';
      case 'video_call_rejected':
        return 'text-red-600';
      case 'video_call_ended':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      
      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/notifications/${id}`, {
        withCredentials: true,
      });
      
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:3000/api/notifications/mark-all-read', {}, {
        withCredentials: true,
      });
      
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleVideoCallAction = (notification: Notification) => {
    if (notification.type === 'video_call_request' && notification.metadata?.callId) {
      // Accept the video call directly
      if (videoCallService) {
        videoCallService.acceptVideoCall(notification.metadata.callId);
        
        // Navigate to video consultation
        navigate('/doctor/video-consultation', {
          state: {
            callId: notification.metadata.callId,
            patientId: notification.sender?._id,
            patientName: notification.metadata.patientName,
            isIncomingCall: true
          }
        });
        
        // Mark notification as read
        markAsRead(notification._id);
      }
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const rejectCallFromNotification = (notification: Notification) => {
    if (!notification.metadata?.callId || !videoCallService) return;
    
    // Reject the video call using the video call service
    videoCallService.rejectVideoCall(notification.metadata.callId, 'Doctor is not available');
    
    // Mark notification as read
    markAsRead(notification._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Notifications</h1>
              <p className="text-gray-600">Stay updated with important alerts and reminders</p>
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </div>
              )}
              <button
                onClick={markAllAsRead}
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors duration-300 text-sm font-medium"
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="appointment_booked">Appointment Booked</option>
                <option value="appointment_confirmed">Appointment Confirmed</option>
                <option value="appointment_cancelled">Appointment Cancelled</option>
                <option value="appointment_reminder">Appointment Reminder</option>
                <option value="prescription_ready">Prescription Ready</option>
                <option value="emergency_alert">Emergency Alert</option>
                <option value="message_received">Message Received</option>
                <option value="payment_received">Payment Received</option>
                <option value="profile_updated">Profile Updated</option>
                <option value="system_maintenance">System Maintenance</option>
                <option value="video_call_request">Video Call Request</option>
                <option value="video_call_accepted">Video Call Accepted</option>
                <option value="video_call_rejected">Video Call Rejected</option>
                <option value="video_call_ended">Video Call Ended</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaEye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-emerald-50 rounded-xl px-4 py-3">
              <span className="text-emerald-700 font-medium">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <div 
                key={notification._id} 
                className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 animate-fade-scale ${
                  getNotificationColor(notification.type, notification.priority)
                } ${!notification.isRead ? 'bg-opacity-75' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.priority === 'Critical' ? 'bg-red-100' :
                    notification.priority === 'High' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    <span className={getIconColor(notification.type, notification.priority)}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        )}
                        {notification.priority === 'Critical' && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            CRITICAL
                          </span>
                        )}
                        {notification.priority === 'High' && (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            HIGH
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>

                    <p className={`text-sm mb-3 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>

                    {notification.sender?.name && (
                      <div className="flex items-center gap-2 mb-3">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">From: {notification.sender.name}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(notification.actionUrl || notification.type === 'video_call_request') && (
                          <div className="flex gap-2">
                            {notification.type === 'video_call_request' ? (
                              <>
                                <button 
                                  onClick={() => rejectCallFromNotification(notification)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                >
                                  <FaTimes className="w-4 h-4" />
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleVideoCallAction(notification)}
                                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                >
                                  <FaPhone className="w-4 h-4" />
                                  Accept
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleVideoCallAction(notification)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                              >
                                {notification.type.includes('appointment') && <FaVideo className="w-4 h-4" />}
                                {notification.type === 'prescription_ready' && <FaPills className="w-4 h-4" />}
                                {notification.type === 'emergency_alert' && <FaStethoscope className="w-4 h-4" />}
                                {notification.actionText || 'Take Action'}
                              </button>
                            )}
                          </div>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors duration-300 text-sm font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-300 p-2"
                        title="Delete notification"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Incoming Call Notification Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPhone className="w-10 h-10 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Incoming Call</h3>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">{incomingCall.patientName}</span> is requesting a video consultation
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Specialization: {incomingCall.specialization}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300"
                >
                  <FaTimes />
                  Reject
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300"
                >
                  <FaVideo />
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
