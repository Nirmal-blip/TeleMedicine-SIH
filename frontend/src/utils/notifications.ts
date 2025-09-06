import { toast } from 'react-toastify';

export interface NotificationData {
  type: 'video-call-request' | 'video-call-started' | 'video-call-ended' | 'video-call-accepted' | 'video-call-rejected' | 'appointment-booked';
  title: string;
  message: string;
  doctorId?: string;
  patientId?: string;
  appointmentId?: string;
  callId?: string;
  doctorName?: string;
  patientName?: string;
}

export class NotificationManager {
  static showNotification(data: NotificationData) {
    const { type, title, message } = data;
    
    switch (type) {
      case 'video-call-request':
        // Show both toast and browser notification for incoming calls
        toast.info(`📞 ${title}: ${message}. Click to join!`, {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => this.handleJoinCall(data),
        });
        
        // Show browser notification with action buttons
        this.showBrowserNotification(`📞 ${title}`, `${message}. Click to join the call!`);
        break;
        
      case 'video-call-started':
        toast.success(`🎥 ${title}: ${message}. Click to join!`, {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => this.handleJoinCall(data),
        });
        
        // Also show browser notification
        this.showBrowserNotification(`🎥 ${title}`, `${message}. Click to join!`);
        break;
        
      case 'appointment-booked':
        toast.success(`✅ ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        this.showBrowserNotification(`✅ ${title}`, message);
        break;
        
      case 'video-call-ended':
        toast.info(`${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        break;

      case 'video-call-accepted':
        toast.success(`✅ ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => this.handleJoinCall(data),
        });
        this.showBrowserNotification(`✅ ${title}`, `${message}. Click to join!`);
        break;

      case 'video-call-rejected':
        toast.error(`❌ ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        this.showBrowserNotification(`❌ ${title}`, message);
        break;
        
      default:
        toast.info(`${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
    }
  }

  static handleJoinCall(data: NotificationData) {
    if (data.callId) {
      // Store call data for the video consultation page
      localStorage.setItem('joinCallId', data.callId);
      localStorage.setItem('joinCallData', JSON.stringify(data));
      
      // Navigate to video consultation
      const userType = localStorage.getItem('userType') || 'patient';
      const videoCallUrl = userType === 'doctor' ? '/doctor/video-consultation' : '/video-consultation';
      window.location.href = videoCallUrl;
    }
  }

  static handleDeclineCall(data: NotificationData) {
    // Send decline signal to backend
    // This can be implemented later if needed
    toast.info('Call declined');
  }

  static requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }

  static showBrowserNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }
}

// Initialize notification permission on load
if (typeof window !== 'undefined') {
  NotificationManager.requestNotificationPermission();
}
