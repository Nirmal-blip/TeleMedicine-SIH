# WebRTC Video Consultation Implementation

## Overview

This implementation provides real-time video calling functionality between doctors and patients using WebRTC (Web Real-Time Communication). The system uses a peer-to-peer connection with a simple signaling mechanism.

## Architecture

### Components

1. **WebRTC Service** (`webrtc.ts`)
   - Handles peer connection management
   - Manages local and remote streams
   - Provides signaling functionality
   - Supports audio/video controls and screen sharing

2. **Doctor VideoConsultation** 
   - Initiates video calls
   - Acts as the call host
   - Manages patient connections

3. **Patient VideoConsultation**
   - Joins video calls
   - Receives call notifications
   - Responds to doctor-initiated calls

## How It Works

### Call Flow

1. **Doctor starts a call:**
   - Doctor clicks "Start Call" button
   - WebRTC service initializes with `isInitiator: true`
   - Creates a unique call ID
   - Stores call ID in localStorage for patient discovery
   - Sets up local media stream (camera/microphone)
   - Creates RTCPeerConnection and waits for patient

2. **Patient joins the call:**
   - Patient's app periodically checks localStorage for active calls
   - When active call found, shows "Doctor is calling!" notification
   - Patient clicks "Join Call"
   - WebRTC service initializes with `isInitiator: false`
   - Sets up local media stream and connects to peer

3. **WebRTC Connection Establishment:**
   - Doctor creates offer and sends via signaling
   - Patient receives offer, creates answer
   - ICE candidates exchanged for optimal connection
   - Direct peer-to-peer connection established

### Signaling Implementation

For this demo, we use **localStorage-based signaling**:

```javascript
// Send signaling message
localStorage.setItem(`webrtc-signal-${to}-${timestamp}`, JSON.stringify(data));

// Listen for signaling messages
window.addEventListener('storage', (event) => {
  if (event.key?.startsWith('webrtc-signal-')) {
    handleSignalingMessage(JSON.parse(event.newValue));
  }
});
```

**Note:** In production, replace this with a proper WebSocket signaling server.

## Features

### Video Controls
- **Toggle Video:** Enable/disable camera
- **Toggle Audio:** Mute/unmute microphone  
- **Screen Sharing:** Share doctor's screen with patient
- **End Call:** Terminate the connection

### Chat System
- Real-time text messaging during calls
- Message history preserved during session
- Emerald theme integration

### Connection Management
- Connection status indicators
- Automatic reconnection handling
- Call ID display for debugging
- Error handling and user feedback

## Browser Support

### Requirements
- Modern browser with WebRTC support
- Camera and microphone permissions
- Secure context (HTTPS) for getUserMedia

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Setup Instructions

### 1. Install Dependencies
No additional dependencies needed - uses browser's native WebRTC APIs.

### 2. Enable Camera/Microphone
Ensure users grant camera and microphone permissions when prompted.

### 3. HTTPS Requirement
WebRTC requires secure context (HTTPS) in production. For development:
- Use `localhost` (automatically secure)
- Or set up HTTPS for your dev server

## Production Considerations

### Signaling Server
Replace localStorage signaling with a proper WebSocket server:

```javascript
// Example WebSocket signaling
const socket = new WebSocket('wss://your-signaling-server.com');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleSignalingMessage(data);
};

const sendSignalingMessage = (data) => {
  socket.send(JSON.stringify(data));
};
```

### STUN/TURN Servers
Configure ICE servers for production:

```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

### Security
- Implement authentication for signaling server
- Validate call permissions (doctor-patient matching)
- Add session management and timeouts
- Monitor and log call quality metrics

## API Reference

### WebRTCService Class

#### Methods

- `initializeCall(callId: string, isInitiator: boolean)`: Initialize a call
- `toggleVideo(enabled: boolean)`: Enable/disable video
- `toggleAudio(enabled: boolean)`: Enable/disable audio  
- `startScreenShare()`: Start screen sharing
- `stopScreenShare()`: Stop screen sharing
- `endCall()`: End the call and cleanup

#### Events

- `onLocalStream`: Triggered when local media stream is ready
- `onRemoteStream`: Triggered when remote stream is received
- `onConnectionStateChange`: Connection state updates
- `onCallEnd`: Call ended by remote peer
- `onError`: Error occurred during call

## Troubleshooting

### Common Issues

1. **"WebRTC not supported"**
   - Update browser to latest version
   - Ensure HTTPS/localhost usage

2. **Camera/microphone not working**
   - Check browser permissions
   - Verify device availability
   - Try refreshing the page

3. **Connection fails**
   - Check internet connectivity
   - Verify STUN server accessibility
   - May need TURN server for restrictive networks

4. **No video/audio from remote peer**
   - Both users need working cameras/microphones
   - Check connection status indicators
   - Verify WebRTC connection is established

### Debug Tools

- Browser DevTools Console for WebRTC logs
- `chrome://webrtc-internals/` for detailed debugging
- Connection status indicators in the UI
- Call ID display for tracking sessions

## Future Enhancements

- Recording functionality
- File sharing during calls
- Multiple participants support
- Call quality indicators
- Bandwidth optimization
- Mobile app support
- Integration with calendar systems
