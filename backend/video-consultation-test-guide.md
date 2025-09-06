# Video Consultation Testing Guide

## 🎯 Overview
This guide helps you test the video consultation functionality from both doctor and patient perspectives.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
# Server should start on http://localhost:3000
```

### 2. Run Automated Tests
```bash
# Complete functionality test
node test-complete-video-consultation.js

# Call rejection specific test
node test-call-rejection.js
```

## 🧪 Manual Testing Scenarios

### Scenario 1: Patient-Initiated Call (Happy Path)

**Steps:**
1. **Patient connects** to WebSocket with:
   - userId: `patient123`
   - userType: `patient`

2. **Doctor connects** to WebSocket with:
   - userId: `doctor456` 
   - userType: `doctor`

3. **Patient starts call:**
   ```javascript
   patientSocket.emit('start-call', {
     appointmentId: '64b5f1234567890123456789',
     patientId: 'patient123',
     doctorId: 'doctor456'
   });
   ```

4. **Doctor receives** `incoming-call` event

5. **Doctor accepts** by joining:
   ```javascript
   doctorSocket.emit('join-call', { 
     callId: receivedCallId,
     appointmentId: appointmentId
   });
   ```

6. **Both parties exchange WebRTC signals:**
   ```javascript
   // Offer
   socket.emit('webrtc-signal', {
     callId: callId,
     type: 'offer',
     offer: rtcOffer
   });
   
   // Answer
   socket.emit('webrtc-signal', {
     callId: callId,
     type: 'answer', 
     answer: rtcAnswer
   });
   ```

7. **Chat during call:**
   ```javascript
   socket.emit('chat-message', {
     callId: callId,
     message: 'Hello!'
   });
   ```

8. **End call:**
   ```javascript
   socket.emit('leave-call', { callId: callId });
   ```

### Scenario 2: Doctor-Initiated Call

Same as above but doctor starts the call:
```javascript
doctorSocket.emit('start-call', {
  appointmentId: '64b5f1234567890123456789',
  patientId: 'patient123'
});
```

### Scenario 3: Call Rejection

1. **Patient initiates call** (as above)
2. **Doctor rejects:**
   ```javascript
   doctorSocket.emit('reject-call', {
     callId: receivedCallId,
     appointmentId: appointmentId,
     reason: 'Currently unavailable'
   });
   ```
3. **Patient receives** `call-rejected` event

### Scenario 4: Call Cancellation

1. **Patient initiates call**
2. **Patient cancels before doctor responds:**
   ```javascript
   patientSocket.emit('cancel-call', {
     callId: callId,
     appointmentId: appointmentId,
     reason: 'Changed mind'
   });
   ```
3. **Doctor receives** `call-cancelled` event

## 🔗 REST API Testing

### Using cURL:

**Start Call (Doctor only):**
```bash
curl -X POST http://localhost:3000/api/video-consultation/start-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "appointmentId": "64b5f1234567890123456789",
    "patientId": "patient123"
  }'
```

**Reject Call:**
```bash
curl -X PUT http://localhost:3000/api/video-consultation/reject-call/CALL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Currently unavailable"
  }'
```

**Cancel Call:**
```bash
curl -X PUT http://localhost:3000/api/video-consultation/cancel-call/CALL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Patient unavailable"
  }'
```

**End Call:**
```bash
curl -X PUT http://localhost:3000/api/video-consultation/end-call/CALL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Active Calls:**
```bash
curl -X GET http://localhost:3000/api/video-consultation/active-calls \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 Frontend Testing with Browser Console

### 1. Connect to WebSocket:
```javascript
// Patient connection
const patientSocket = io('http://localhost:3000/video-consultation', {
  query: { userId: 'patient123', userType: 'patient' },
  transports: ['websocket']
});

// Doctor connection  
const doctorSocket = io('http://localhost:3000/video-consultation', {
  query: { userId: 'doctor456', userType: 'doctor' },
  transports: ['websocket']
});
```

### 2. Set up event listeners:
```javascript
patientSocket.on('incoming-call', (data) => {
  console.log('Incoming call:', data);
});

patientSocket.on('call-rejected', (data) => {
  console.log('Call rejected:', data);
});

patientSocket.on('webrtc-signal', (data) => {
  console.log('WebRTC signal:', data);
});

patientSocket.on('chat-message', (data) => {
  console.log('Chat message:', data);
});
```

### 3. Test call flow:
```javascript
// Start call
patientSocket.emit('start-call', {
  appointmentId: '64b5f1234567890123456789',
  patientId: 'patient123',
  doctorId: 'doctor456'
});

// Accept call (when doctor receives incoming-call)
doctorSocket.emit('join-call', { 
  callId: 'received-call-id',
  appointmentId: '64b5f1234567890123456789'
});
```

## ✅ Expected Behaviors

### Successful Call Flow:
1. ✅ Patient/Doctor connects successfully
2. ✅ Call initiation creates session
3. ✅ Incoming call notification received
4. ✅ Call acceptance triggers WebRTC setup
5. ✅ Chat messages exchanged
6. ✅ Call termination cleans up properly

### Call Rejection Flow:
1. ✅ Call initiated
2. ✅ Rejection notification sent
3. ✅ Appointment status handled correctly
4. ✅ Call session cleaned up

### Error Scenarios:
1. ✅ Invalid appointment ID → Error response
2. ✅ User not authenticated → Error response  
3. ✅ Call to non-existent user → Timeout handling
4. ✅ Network disconnection → Proper cleanup

## 🐛 Troubleshooting

### Common Issues:

**WebSocket Connection Fails:**
- Check if backend server is running
- Verify CORS settings
- Check network connectivity

**Call Not Received:**
- Ensure both users are connected
- Verify user IDs match appointment data
- Check console for error messages

**WebRTC Issues:**
- Check browser WebRTC support
- Verify ICE candidate exchange
- Test with simple offer/answer

**Authentication Errors:**
- Verify JWT token is valid
- Check token format (Bearer prefix)
- Ensure user permissions are correct

## 📊 Monitoring & Debugging

### Backend Logs:
- Monitor console for connection logs
- Check call session creation/cleanup
- Watch for error messages

### Frontend Console:
- Monitor WebSocket events
- Check WebRTC peer connection state
- Verify chat message flow

### Network Tab:
- Verify WebSocket connection established
- Check HTTP request/response status
- Monitor real-time message exchange
