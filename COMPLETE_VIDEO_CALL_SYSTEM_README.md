# Complete Video Call System Implementation

This document describes the complete implementation of the video call notification and WebRTC system for the TeleMedicine application.

## System Overview

The video call system consists of two main components:
1. **Video Call Notification System** - Handles call requests, acceptances, and rejections
2. **WebRTC Video Consultation** - Handles actual video/audio communication

## Architecture

### Backend Components

#### Video Call Notifications Module
- **VideoCallNotificationsGateway** - Socket.IO gateway for real-time notifications
- **VideoCallNotificationsService** - Service layer for notification operations
- **VideoCallNotificationsController** - REST API endpoints
- **VideoCallNotificationsModule** - NestJS module configuration

#### WebRTC Signaling Module
- **VideoConsultationGateway** - Socket.IO gateway for WebRTC signaling
- **VideoConsultationService** - Service layer for call management
- **VideoConsultationController** - REST API endpoints

### Frontend Components

#### Video Call Notification Service
- **VideoCallNotificationService** - Client-side Socket.IO service
- Handles call requests, acceptances, and rejections
- Manages real-time communication with backend

#### WebRTC Service
- **EnhancedWebRTCService** - WebRTC peer-to-peer communication
- Handles video/audio streams, signaling, and chat
- Manages connection states and error handling

#### UI Components
- **Patient Video Consultation** - Patient interface for video calls
- **Doctor Video Consultation** - Doctor interface for video calls
- **Doctor Video Call Notifications** - Doctor notification management
- **Appointment Booking** - Patient call initiation

## Complete Flow Description

### 1. Patient Initiates Video Call

1. **Patient clicks "Start Video Call"** in appointment booking modal
2. **System creates immediate appointment** in database
3. **Patient's frontend initializes** video call notification service
4. **Socket.IO emits `request-video-call`** event to backend
5. **Backend creates notification** record in database
6. **Backend emits `incoming-video-call`** event to connected doctors
7. **Doctor receives notification** in video call notifications page

### 2. Doctor Receives and Responds

1. **Doctor sees notification** with patient details and call information
2. **Doctor clicks "Accept Call"** button
3. **Frontend calls `acceptVideoCall()`** method
4. **Socket.IO emits `accept-video-call`** event to backend
5. **Backend creates acceptance notification** for patient
6. **Backend emits `call-accepted`** event to patient
7. **Patient's frontend navigates** to video consultation page

### 3. WebRTC Connection Establishment

1. **Both parties navigate** to their respective video consultation pages
2. **WebRTC services initialize** with user media (camera/microphone)
3. **Socket.IO connection** established for signaling
4. **Peer connection created** with STUN servers
5. **Offer/Answer exchange** through signaling server
6. **ICE candidates exchanged** for NAT traversal
7. **Video/audio streams** established between peers

### 4. Video Consultation Features

1. **Real-time video/audio** communication
2. **Chat messaging** during consultation
3. **Video/audio controls** (mute, camera on/off)
4. **Screen sharing** capability
5. **Prescription writing** during consultation
6. **Call duration tracking**
7. **Connection status monitoring**

### 5. Call Termination

1. **Either party ends call** by clicking end button
2. **WebRTC connection closed** and streams stopped
3. **Socket.IO rooms left** and connections cleaned up
4. **Call session recorded** in database
5. **Users redirected** to appropriate pages

## API Endpoints

### Video Call Notifications
- `POST /api/video-call-notifications/request-call` - Request a video call
- `POST /api/video-call-notifications/accept-call` - Accept a video call
- `POST /api/video-call-notifications/reject-call` - Reject a video call
- `GET /api/video-call-notifications/my-notifications` - Get user's notifications
- `POST /api/video-call-notifications/mark-read/:notificationId` - Mark as read

### Video Consultation
- `GET /api/video-consultation/upcoming-appointments` - Get upcoming appointments
- `GET /api/video-consultation/call-history` - Get call history
- `POST /api/video-consultation/start-call` - Start a call session

## Socket.IO Events

### Video Call Notifications Namespace (`/video-call-notifications`)

#### Client to Server
- `request-video-call` - Patient requests video call
- `accept-video-call` - Doctor accepts video call
- `reject-video-call` - Doctor rejects video call

#### Server to Client
- `incoming-video-call` - Doctor receives call request
- `call-accepted` - Patient receives call acceptance
- `call-rejected` - Patient receives call rejection
- `call-request-sent` - Patient receives request confirmation
- `call-accepted-confirmation` - Doctor receives acceptance confirmation
- `call-rejected-confirmation` - Doctor receives rejection confirmation
- `call-error` - Error in call process
- `new-notification` - New notification available

### Video Consultation Namespace (`/video-consultation`)

#### Client to Server
- `join-call` - Join a video call room
- `leave-call` - Leave a video call room
- `webrtc-signal` - WebRTC signaling data
- `chat-message` - Send chat message
- `start-call` - Start a call session

#### Server to Client
- `joined-call` - Confirmation of joining call
- `user-joined` - Another user joined the call
- `user-left` - User left the call
- `webrtc-signal` - WebRTC signaling data
- `chat-message` - Receive chat message
- `existing-participants` - List of existing participants

## Database Schema

### Notification Document
```typescript
{
  recipient: string;           // User ID receiving notification
  recipientType: 'Doctor' | 'Patient';
  sender: string;             // User ID sending notification
  senderType: 'Doctor' | 'Patient';
  title: string;              // Notification title
  message: string;            // Notification message
  type: 'video_call_request' | 'video_call_accepted' | 'video_call_rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  actionUrl?: string;         // URL for action button
  actionText?: string;        // Text for action button
  metadata?: {
    callId?: string;
    patientName?: string;
    specialization?: string;
    requestedAt?: string;
    appointmentId?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    reason?: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment Document
```typescript
{
  _id: string;
  doctor: ObjectId;           // Reference to Doctor
  patient: ObjectId;          // Reference to Patient
  date: string;               // Appointment date
  time: string;               // Appointment time
  reason: string;             // Reason for consultation
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  callId?: string;            // WebRTC call ID
  isVideoConsultation?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Service Integration

### Video Call Notification Service
```typescript
// Initialize service
const service = initializeVideoCallNotificationService(userId, userType);

// Request video call (patients)
const callId = service.requestVideoCall({
  doctorId: 'doctor123',
  doctorName: 'Dr. Smith',
  patientName: 'John Doe',
  specialization: 'Cardiology',
  appointmentId: 'apt123'
});

// Accept call (doctors)
service.acceptVideoCall(callId, patientId);

// Reject call (doctors)
service.rejectVideoCall(callId, patientId, 'Not available');

// Event listeners
service.onCallAccepted((data) => {
  // Handle call acceptance
});

service.onCallRejected((data) => {
  // Handle call rejection
});
```

### WebRTC Service
```typescript
// Initialize service
const webrtcService = new EnhancedWebRTCService(userId, userType);

// Initialize call
await webrtcService.initializeCall(callId, isInitiator);

// Join existing call
await webrtcService.joinCall(callId, appointmentId);

// Control media
webrtcService.toggleVideo(enabled);
webrtcService.toggleAudio(enabled);

// Send chat message
webrtcService.sendChatMessage('Hello!');

// End call
webrtcService.endCall();

// Event handlers
webrtcService.onLocalStream = (stream) => {
  // Handle local video stream
};

webrtcService.onRemoteStream = (stream) => {
  // Handle remote video stream
};

webrtcService.onConnectionStateChange = (state) => {
  // Handle connection state changes
};
```

## Setup Instructions

### Backend Setup
1. Ensure both modules are imported in `app.module.ts`
2. Configure Socket.IO namespaces
3. Set up STUN servers for WebRTC
4. Configure CORS for frontend connections

### Frontend Setup
1. Install required dependencies:
   ```bash
   npm install socket.io-client
   ```
2. Initialize services in components
3. Set up event listeners
4. Handle user media permissions
5. Configure WebRTC constraints

## Testing

### Manual Testing
1. **Start both backend and frontend servers**
2. **Open two browser windows** (one for patient, one for doctor)
3. **Login as patient and doctor** in separate windows
4. **Patient clicks "Start Video Call"** in appointment booking
5. **Doctor receives notification** and accepts/rejects
6. **Verify WebRTC connection** and video/audio
7. **Test chat functionality** during call
8. **Test call termination** and cleanup

### Automated Testing
Run the comprehensive test script:
```bash
node test-complete-video-call-flow.js
```

## Features Implemented

### ✅ Core Features
- Real-time video call notifications
- WebRTC peer-to-peer video/audio
- Accept/reject call functionality
- Automatic navigation based on call response
- Browser notifications (with permission)
- Database persistence of notifications
- Error handling and user feedback

### ✅ Advanced Features
- Chat messaging during calls
- Video/audio controls (mute, camera on/off)
- Screen sharing capability
- Call duration tracking
- Connection status monitoring
- Prescription writing during consultation
- Call history and session recording
- Multiple call support
- Clean separation of concerns

### ✅ Technical Features
- TypeScript support throughout
- Socket.IO real-time communication
- WebRTC with STUN servers
- Responsive UI design
- Error recovery mechanisms
- Connection state management
- Memory leak prevention
- Cross-browser compatibility

## Security Considerations

- All Socket.IO connections require authentication
- JWT tokens validated for API endpoints
- User types verified for appropriate actions
- Input validation on all endpoints
- CORS properly configured
- Media permissions handled securely
- Call sessions properly cleaned up

## Performance Optimizations

- Efficient Socket.IO room management
- WebRTC connection pooling
- Lazy loading of video components
- Optimized media constraints
- Proper cleanup on component unmount
- Memory management for streams
- Connection state caching

## Future Enhancements

- Call recording capabilities
- Push notifications for mobile
- Call quality indicators
- Multiple participant support
- File sharing during calls
- Call scheduling improvements
- Analytics and reporting
- Mobile app integration

## Troubleshooting

### Common Issues
1. **WebRTC not connecting**: Check STUN servers and firewall
2. **Audio/video not working**: Verify media permissions
3. **Notifications not received**: Check Socket.IO connection
4. **Call not starting**: Verify user authentication
5. **UI not updating**: Check event listeners

### Debug Tools
- Browser developer tools
- Socket.IO debug mode
- WebRTC connection inspector
- Network tab monitoring
- Console logging enabled

This complete implementation provides a robust, scalable video consultation system with proper separation of concerns, real-time communication, and excellent user experience.
