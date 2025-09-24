# Video Call Testing Guide - Patient to Doctor

## 🚀 Quick Start Testing

### Prerequisites
✅ Backend server running on `http://localhost:3000`
✅ Frontend server running on `http://localhost:5173`
✅ Two browser windows/tabs (one for patient, one for doctor)

## 📋 Step-by-Step Testing Process

### Step 1: Patient Side Setup
1. **Open Browser Tab 1** → Navigate to `http://localhost:5173`
2. **Login as Patient**:
   - Use existing patient credentials
   - Or create a new patient account
3. **Navigate to Doctors List**:
   - Go to `/patient/doctors`
   - You should see a list of available doctors

### Step 2: Doctor Side Setup
1. **Open Browser Tab 2** → Navigate to `http://localhost:5173`
2. **Login as Doctor**:
   - Use existing doctor credentials
   - Or create a new doctor account
3. **Navigate to Video Consultation**:
   - Go to `/doctor/video-consultation`
   - You should see "Waiting for incoming calls..." message

### Step 3: Initiate Video Call
1. **In Patient Tab**:
   - Find any doctor from the list
   - Click the **"Start Video Call"** button
   - You should see a modal with "Sending call request..." status

### Step 4: Doctor Response
1. **In Doctor Tab**:
   - You should see an **"Incoming Video Call"** notification
   - The notification should show:
     - Patient name
     - Specialization
     - "Accept" and "Decline" buttons

### Step 5: Accept Call
1. **Click "Accept"** in the doctor tab
2. **Expected Results**:
   - Patient modal should show "Call Accepted!"
   - Both users should be redirected to video call pages
   - Video streams should start (if camera permissions granted)

## 🔍 What to Look For

### ✅ Success Indicators
- [ ] Patient can see "Start Video Call" button
- [ ] Clicking button shows "Sending call request..." modal
- [ ] Doctor receives incoming call notification
- [ ] Doctor can accept/decline the call
- [ ] Both users navigate to video call interface
- [ ] Camera/microphone permissions requested
- [ ] Video streams appear (local and remote)

### ❌ Common Issues to Check
- [ ] Console errors in browser developer tools
- [ ] Socket.IO connection errors
- [ ] WebRTC permission denials
- [ ] Network connectivity issues

## 🛠️ Debugging Steps

### Check Browser Console
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for these log messages**:

**Patient Side:**
```
🔥 PATIENT: Initializing video call service with ID: [patientId]
🔥 PATIENT: Starting video call with doctor: [doctorName]
🔥 PATIENT: Video call request result: [callId]
```

**Doctor Side:**
```
🔥 DOCTOR: Video call service initialized for doctor: [doctorId]
🔔 DOCTOR: Incoming video call: [callData]
✅ DOCTOR: Accepting call: [callId]
```

### Check Network Tab
1. **Open Developer Tools** → **Network tab**
2. **Look for WebSocket connections**:
   - Should see connection to `ws://localhost:3000/video-call`
   - Status should be "101 Switching Protocols"

### Check Backend Logs
1. **In backend terminal**, look for:
```
🔌 BACKEND: Video call client connected: [socketId]
🔥 BACKEND: Patient [patientName] requesting video call with doctor [doctorName]
📤 BACKEND: Doctor [doctorId] sending offer for call [callId]
```

## 🧪 Test Scenarios

### Scenario 1: Successful Call
- Patient initiates call → Doctor accepts → Video call starts
- **Expected**: Both users see each other's video

### Scenario 2: Call Rejection
- Patient initiates call → Doctor declines
- **Expected**: Patient sees "Call Declined" message

### Scenario 3: Doctor Offline
- Patient initiates call to offline doctor
- **Expected**: Patient sees "Doctor unavailable" message

### Scenario 4: Permission Denial
- User denies camera/microphone access
- **Expected**: Appropriate error message shown

## 🔧 Troubleshooting

### If Video Call Button Doesn't Appear
1. Check if user is logged in as patient
2. Verify doctors are loaded from API
3. Check console for JavaScript errors

### If Doctor Doesn't Receive Call
1. Verify doctor is logged in
2. Check if doctor is on video consultation page
3. Verify Socket.IO connection in Network tab

### If Video Doesn't Start
1. Check camera/microphone permissions
2. Verify WebRTC support in browser
3. Check console for WebRTC errors

### If Call Gets Stuck
1. Refresh both browser tabs
2. Check backend server logs
3. Restart backend server if needed

## 📱 Browser Compatibility
- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅
- **Edge**: Full support ✅

## 🎯 Expected Final Result
When everything works correctly:
1. Patient clicks "Start Video Call"
2. Doctor receives notification and accepts
3. Both users see video call interface
4. Local and remote video streams appear
5. Audio/video controls work (mute, video toggle, end call)

## 📞 Next Steps After Testing
1. **Report any issues** found during testing
2. **Test different scenarios** (rejection, offline doctor, etc.)
3. **Verify call controls** (mute, video toggle, end call)
4. **Test on different browsers** if needed
5. **Test mobile responsiveness** if applicable

---

**Ready to test?** Follow the steps above and let me know what you observe!
