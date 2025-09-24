# Real-Time Video Consultation Feature Implementation Guide

## Overview
This document provides a comprehensive guide for the implemented real-time video consultation feature in the TeleMedicine application. The feature allows patients to initiate video calls with doctors and enables peer-to-peer video communication using WebRTC technology.

## Architecture

### Backend Components
- **VideoCallGateway** (`backend/src/video-call/video-call.gateway.ts`): Handles Socket.IO signaling
- **VideoCallService** (`backend/src/video-call/video-call.service.ts`): Manages call sessions
- **VideoCallController** (`backend/src/video-call/video-call.controller.ts`): REST API endpoints

### Frontend Components
- **VideoCallService** (`frontend/src/utils/video-call.ts`): Socket.IO client wrapper
- **WebRTCManager** (`frontend/src/utils/webrtc.ts`): WebRTC peer-to-peer connection management
- **PatientVideoCall** (`frontend/src/Pages/Patient/VideoCall.tsx`): Patient video call interface
- **DoctorVideoConsultation** (`frontend/src/Pages/Doctor/VideoConsultation.tsx`): Doctor video call interface

## Implementation Details

### 1. Signaling Events (Socket.IO)

#### Patient Events
- `patient:call-doctor` - Patient initiates call request
- `patient:call-request-sent` - Confirmation that call request was sent
- `patient:call-accepted` - Doctor accepted the call
- `patient:call-rejected` - Doctor rejected the call

#### Doctor Events
- `doctor:incoming-call` - Doctor receives incoming call notification
- `doctor:accept-call` - Doctor accepts the call
- `doctor:reject-call` - Doctor rejects the call

#### WebRTC Signaling Events
- `webrtc:offer` - SDP offer exchange
- `webrtc:answer` - SDP answer exchange
- `webrtc:ice-candidate` - ICE candidate exchange

### 2. Call Flow

#### Patient Initiates Call
1. Patient clicks "Start Video Call" button on doctor's profile
2. Frontend emits `patient:call-doctor` event with doctor details
3. Backend creates call session and emits `doctor:incoming-call` to doctor
4. Backend sends confirmation `patient:call-request-sent` to patient

#### Doctor Responds
1. Doctor receives incoming call notification
2. Doctor can either:
   - **Accept**: Emits `doctor:accept-call` → Backend emits `patient:call-accepted`
   - **Reject**: Emits `doctor:reject-call` → Backend emits `patient:call-rejected`

#### WebRTC Connection Establishment
1. Both users join Socket.IO room using callId
2. Doctor (initiator) creates WebRTC offer
3. Patient receives offer and creates answer
4. ICE candidates are exchanged for NAT traversal
5. Peer-to-peer connection established

### 3. Key Features

#### Patient Features
- ✅ Initiate video calls to doctors
- ✅ Real-time video/audio communication
- ✅ Mute/unmute audio
- ✅ Enable/disable video
- ✅ End call functionality
- ✅ Call status indicators (connecting, connected, ended)

#### Doctor Features
- ✅ Receive incoming call notifications
- ✅ Accept or reject calls
- ✅ Real-time video/audio communication
- ✅ Mute/unmute audio
- ✅ Enable/disable video
- ✅ Write prescriptions during calls
- ✅ End call functionality
- ✅ Call status indicators

#### Technical Features
- ✅ WebRTC peer-to-peer connection
- ✅ STUN servers for NAT traversal
- ✅ Socket.IO signaling server
- ✅ Call session management
- ✅ Error handling and reconnection
- ✅ Media device management

## File Structure

```
backend/src/video-call/
├── video-call.gateway.ts    # Socket.IO gateway for signaling
├── video-call.service.ts    # Call session management
├── video-call.controller.ts  # REST API endpoints
└── video-call.module.ts     # Module configuration

frontend/src/
├── utils/
│   ├── video-call.ts       # Socket.IO client wrapper
│   └── webrtc.ts          # WebRTC connection management
├── Pages/
│   ├── Patient/
│   │   └── VideoCall.tsx   # Patient video call interface
│   └── Doctor/
│       └── VideoConsultation.tsx # Doctor video call interface
└── App.tsx                 # Route configuration
```

## Routes

### Patient Routes
- `/patient/video-call/:callId` - Patient video call page
- `/patient/video-consultation` - General video consultation page

### Doctor Routes
- `/doctor/video-call/:callId` - Doctor video call page
- `/doctor/video-consultation` - Doctor video consultation dashboard

## Testing Guide

### Prerequisites
1. Backend server running on `http://localhost:3000`
2. Frontend server running on `http://localhost:5173`
3. Two browser windows/tabs (one for patient, one for doctor)
4. Camera and microphone permissions enabled

### Test Scenarios

#### Scenario 1: Successful Video Call
1. **Patient Side**:
   - Login as patient
   - Navigate to `/patient/doctors`
   - Click "Start Video Call" on any doctor
   - Wait for call to be accepted

2. **Doctor Side**:
   - Login as doctor
   - Navigate to `/doctor/video-consultation`
   - Wait for incoming call notification
   - Click "Accept" button
   - Video call should start

3. **Expected Results**:
   - Both users see each other's video
   - Audio communication works
   - Controls (mute, video toggle, end call) function properly

#### Scenario 2: Call Rejection
1. **Patient Side**:
   - Initiate call as above

2. **Doctor Side**:
   - Click "Decline" button instead of "Accept"

3. **Expected Results**:
   - Patient receives rejection notification
   - Patient is redirected back to doctors list
   - Call session is cleaned up

#### Scenario 3: Doctor Offline
1. **Patient Side**:
   - Initiate call to doctor who is not connected

2. **Expected Results**:
   - Patient receives "Doctor unavailable" message
   - Call request is saved for when doctor comes online

### Debugging Tips

#### Check Console Logs
- Patient logs: Look for `🔥 PATIENT:` prefixed messages
- Doctor logs: Look for `🔥 DOCTOR:` prefixed messages
- WebRTC logs: Look for `🔧 WebRTC:` prefixed messages
- Backend logs: Look for `🔥 BACKEND:` prefixed messages

#### Common Issues
1. **Camera/Microphone Access Denied**:
   - Check browser permissions
   - Ensure HTTPS in production
   - Test with different browsers

2. **WebRTC Connection Failed**:
   - Check STUN server connectivity
   - Verify firewall settings
   - Test with different network conditions

3. **Socket.IO Connection Issues**:
   - Check CORS settings
   - Verify socket namespace (`/video-call`)
   - Check authentication tokens

## Security Considerations

1. **Authentication**: All video call routes are protected by JWT authentication
2. **Authorization**: Users can only access their own call sessions
3. **CORS**: Properly configured for development and production
4. **Media Permissions**: Browser-level security for camera/microphone access

## Performance Optimizations

1. **ICE Candidate Pool**: Pre-gathered ICE candidates for faster connection
2. **Video Quality**: Adaptive bitrate based on network conditions
3. **Connection State Monitoring**: Automatic reconnection on connection loss
4. **Resource Cleanup**: Proper cleanup of media streams and connections

## Future Enhancements

1. **Screen Sharing**: Allow doctors to share their screen
2. **Chat Integration**: Text chat during video calls
3. **Recording**: Optional call recording with consent
4. **Mobile Support**: Optimized for mobile devices
5. **Group Calls**: Support for multiple participants
6. **Call Scheduling**: Scheduled video consultations

## Troubleshooting

### Common Error Messages
- "Video call service not initialized": Check user authentication
- "Failed to get user media": Check camera/microphone permissions
- "WebRTC connection failed": Check network connectivity and STUN servers
- "Doctor not available": Doctor is offline or not connected to socket

### Browser Compatibility
- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support (iOS 11+)
- Edge: Full support

## Conclusion

The video consultation feature is now fully implemented with:
- ✅ Complete signaling system using Socket.IO
- ✅ WebRTC peer-to-peer video/audio communication
- ✅ User-friendly interfaces for both patients and doctors
- ✅ Proper error handling and edge case management
- ✅ Security and authentication integration
- ✅ Responsive design and modern UI

The implementation follows WebRTC best practices and provides a robust foundation for telemedicine video consultations.
