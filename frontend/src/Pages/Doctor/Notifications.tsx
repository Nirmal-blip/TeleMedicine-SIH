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
  FaFileAlt
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";

interface Notification {
  id: string;
  type: 'appointment' | 'prescription' | 'emergency' | 'system' | 'reminder' | 'review';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  patientName?: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterStatus, searchQuery]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.get('http://localhost:3000/api/doctors/notifications', {
      //   withCredentials: true,
      // });
      
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Upcoming Appointment',
          message: 'You have an appointment with John Doe in 30 minutes.',
          timestamp: '2024-01-15T09:30:00Z',
          isRead: false,
          priority: 'high',
          patientName: 'John Doe',
          actionRequired: true,
          actionUrl: '/doctor/video-consultation'
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Prescription Refill Request',
          message: 'Jane Smith has requested a refill for Metformin 500mg.',
          timestamp: '2024-01-15T08:45:00Z',
          isRead: false,
          priority: 'medium',
          patientName: 'Jane Smith',
          actionRequired: true,
          actionUrl: '/doctor/prescribed-patients'
        },
        {
          id: '3',
          type: 'emergency',
          title: 'Emergency Consultation Request',
          message: 'Bob Johnson is requesting an emergency consultation for severe chest pain.',
          timestamp: '2024-01-15T07:15:00Z',
          isRead: true,
          priority: 'urgent',
          patientName: 'Bob Johnson',
          actionRequired: true,
          actionUrl: '/doctor/video-consultation'
        },
        {
          id: '4',
          type: 'review',
          title: 'Patient Review Received',
          message: 'Alice Brown left a 5-star review for your consultation.',
          timestamp: '2024-01-14T16:30:00Z',
          isRead: true,
          priority: 'low',
          patientName: 'Alice Brown',
          actionRequired: false
        },
        {
          id: '5',
          type: 'reminder',
          title: 'Follow-up Reminder',
          message: 'Schedule follow-up appointment for Mike Wilson within 2 weeks.',
          timestamp: '2024-01-14T14:20:00Z',
          isRead: false,
          priority: 'medium',
          patientName: 'Mike Wilson',
          actionRequired: true,
          actionUrl: '/doctor/patient-list'
        },
        {
          id: '6',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled system maintenance tonight from 11 PM to 2 AM.',
          timestamp: '2024-01-14T10:00:00Z',
          isRead: true,
          priority: 'low',
          actionRequired: false
        },
        {
          id: '7',
          type: 'appointment',
          title: 'Appointment Cancelled',
          message: 'Sarah Davis has cancelled her appointment scheduled for tomorrow.',
          timestamp: '2024-01-13T18:45:00Z',
          isRead: false,
          priority: 'medium',
          patientName: 'Sarah Davis',
          actionRequired: false
        }
      ];
      
      setNotifications(mockNotifications);
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
                           (notification.patientName && notification.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'read' && notification.isRead) ||
                           (filterStatus === 'unread' && !notification.isRead);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort by timestamp (most recent first) and then by priority
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      
      if (timeDiff === 0) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return timeDiff;
    });

    setFilteredNotifications(filtered);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <FaCalendar className="w-5 h-5" />;
      case 'prescription':
        return <FaPills className="w-5 h-5" />;
      case 'emergency':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'system':
        return <FaInfoCircle className="w-5 h-5" />;
      case 'reminder':
        return <FaClock className="w-5 h-5" />;
      case 'review':
        return <FaCheckCircle className="w-5 h-5" />;
      default:
        return <FaBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-red-500 bg-red-50';
    if (priority === 'high') return 'border-orange-500 bg-orange-50';
    
    switch (type) {
      case 'appointment':
        return 'border-blue-500 bg-blue-50';
      case 'prescription':
        return 'border-purple-500 bg-purple-50';
      case 'emergency':
        return 'border-red-500 bg-red-50';
      case 'system':
        return 'border-gray-500 bg-gray-50';
      case 'reminder':
        return 'border-yellow-500 bg-yellow-50';
      case 'review':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    switch (type) {
      case 'appointment':
        return 'text-blue-600';
      case 'prescription':
        return 'text-purple-600';
      case 'emergency':
        return 'text-red-600';
      case 'system':
        return 'text-gray-600';
      case 'reminder':
        return 'text-yellow-600';
      case 'review':
        return 'text-green-600';
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
      // await axios.patch(`http://localhost:3000/api/doctors/notifications/${id}/read`, {}, {
      //   withCredentials: true,
      // });
      
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // await axios.delete(`http://localhost:3000/api/doctors/notifications/${id}`, {
      //   withCredentials: true,
      // });
      
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // await axios.patch('http://localhost:3000/api/doctors/notifications/mark-all-read', {}, {
      //   withCredentials: true,
      // });
      
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                <option value="appointment">Appointments</option>
                <option value="prescription">Prescriptions</option>
                <option value="emergency">Emergency</option>
                <option value="reminder">Reminders</option>
                <option value="review">Reviews</option>
                <option value="system">System</option>
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
                key={notification.id} 
                className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 animate-fade-scale ${
                  getNotificationColor(notification.type, notification.priority)
                } ${!notification.isRead ? 'bg-opacity-75' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.priority === 'urgent' ? 'bg-red-100' :
                    notification.priority === 'high' ? 'bg-orange-100' :
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
                        {notification.priority === 'urgent' && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            URGENT
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            HIGH
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    <p className={`text-sm mb-3 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>

                    {notification.patientName && (
                      <div className="flex items-center gap-2 mb-3">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Patient: {notification.patientName}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {notification.actionRequired && notification.actionUrl && (
                          <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2">
                            {notification.type === 'appointment' && <FaVideo className="w-4 h-4" />}
                            {notification.type === 'prescription' && <FaPills className="w-4 h-4" />}
                            {notification.type === 'reminder' && <FaCalendar className="w-4 h-4" />}
                            {notification.type === 'emergency' && <FaStethoscope className="w-4 h-4" />}
                            Take Action
                          </button>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors duration-300 text-sm font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
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
    </div>
  );
};

export default Notifications;
