# Video Call System Testing Guide

## Overview
This guide will help you test the video call functionality from patient to doctor, including all the fixes we've implemented.

## Prerequisites
1. **Two separate browser tabs/windows** (or different devices)
2. **Valid patient and doctor accounts** on the production server
3. **Browser notifications enabled** for both tabs
4. **Stable internet connection**

## Test Accounts Setup
Before testing, ensure you have:
- One patient account logged in
- One doctor account logged in (preferably in different browser/device)

## Test Scenarios

### 1. Basic Video Call Flow Test

#### Step 1: Patient Initiates Call
1. **Open patient tab** and navigate to `/patient/doctors`
2. **Find a doctor** from the list
3. **Click "Video Call"** button
4. **Verify**: 
   - Call request modal appears
   - Patient name shows correctly (not "Sayantan Halder")
   - Loading state shows "Requesting video call..."

#### Step 2: Doctor Receives Notification
1. **In doctor tab**, you should see:
   - **Real-time notification popup** with patient details
   - **Browser notification** (if permissions granted)
   - **Incoming call interface** with Accept/Decline buttons
2. **Verify**:
   - Doctor name shows correctly in the interface
   - Patient name is displayed correctly
   - Call details are accurate

#### Step 3: Doctor Accepts Call
1. **Click "Accept"** button in doctor interface
2. **Verify**:
   - Doctor redirects to `/doctor/video-call/{callId}`
   - Video call interface loads properly
   - No error messages appear

#### Step 4: Patient Receives Acceptance
1. **In patient tab**, you should see:
   - **Success notification** "Doctor has accepted your call"
   - **Automatic redirect** to `/patient/video-call/{callId}`
   - Video call interface loads

### 2. Call Rejection Test

#### Step 1: Patient Initiates Call (Same as above)
1. Patient clicks "Video Call" on a doctor

#### Step 2: Doctor Rejects Call
1. **In doctor tab**, click "Decline" button
2. **Add reason** (optional): "Doctor is busy"

#### Step 3: Patient Receives Rejection
1. **In patient tab**, you should see:
   - **Rejection notification** with reason
   - **Redirect to dashboard** after 3 seconds

### 3. Cross-Device Testing

#### Setup:
- **Device 1**: Patient logged in
- **Device 2**: Doctor logged in (different browser/device)

#### Test:
1. **Patient initiates call** from Device 1
2. **Doctor receives notification** on Device 2
3. **Doctor accepts/rejects** from Device 2
4. **Patient receives response** on Device 1

### 4. Error Handling Tests

#### Test 1: Doctor Offline
1. **Patient initiates call** to doctor who's not logged in
2. **Verify**: Patient gets "Doctor will be notified when online" message

#### Test 2: Network Issues
1. **Disconnect internet** temporarily during call
2. **Reconnect**
3. **Verify**: System handles reconnection gracefully

#### Test 3: Multiple Calls
1. **Patient sends multiple calls** to same doctor
2. **Verify**: Doctor receives all notifications properly

## Expected Behaviors (After Fixes)

### ✅ Fixed Issues:
1. **Authentication**: Both users show correct names (not "Sayantan Halder")
2. **Notifications**: Real-time notifications work across devices
3. **Routing**: Proper redirects to video call pages
4. **Error Handling**: Clear error messages and proper fallbacks

### 🔍 What to Look For:

#### Console Logs (Open Developer Tools):
```
✅ FRONTEND: Video call service connected for patient/doctor
🔔 DOCTOR: Incoming video call: {call details}
🔥 DOCTOR: Accepting video call {callId}
✅ Patient received call acceptance
```

#### Network Tab:
- WebSocket connections to `wss://telemedicine-sih-8i5h.onrender.com/video-call`
- API calls to production server
- Proper authentication headers

#### UI Elements:
- Correct user names displayed
- Proper loading states
- Success/error notifications
- Smooth transitions between pages

## Troubleshooting

### Common Issues:

#### 1. "Video call service not initialized"
**Solution**: Refresh the page and ensure user is logged in

#### 2. "Doctor not connected via socket"
**Solution**: Check if doctor is logged in and page is active

#### 3. "Call request not found"
**Solution**: Wait a moment and try again, or refresh both tabs

#### 4. Names showing incorrectly
**Solution**: Check AuthContext is properly updated with fullname field

### Debug Steps:
1. **Check console logs** for error messages
2. **Verify WebSocket connections** in Network tab
3. **Check authentication** by calling `/api/auth/me`
4. **Test with different browsers/devices**

## Success Criteria

✅ **All tests pass if:**
- Patient can initiate video calls
- Doctor receives real-time notifications
- Doctor can accept/reject calls
- Proper redirects occur after acceptance
- Correct user names are displayed
- Cross-device functionality works
- Error handling is graceful

## Production Server URLs
- **Backend**: `https://telemedicine-sih-8i5h.onrender.com`
- **WebSocket**: `wss://telemedicine-sih-8i5h.onrender.com/video-call`
- **Frontend**: Your deployed frontend URL

## Manual Test Checklist

- [ ] Patient can see doctor list
- [ ] Patient can initiate video call
- [ ] Doctor receives notification
- [ ] Doctor can accept call
- [ ] Doctor redirects to video call page
- [ ] Patient receives acceptance notification
- [ ] Patient redirects to video call page
- [ ] Doctor can reject call
- [ ] Patient receives rejection notification
- [ ] Cross-device notifications work
- [ ] User names display correctly
- [ ] No console errors
- [ ] WebSocket connections stable

## Next Steps After Testing

If all tests pass:
1. **Deploy changes** to production
2. **Monitor logs** for any issues
3. **Test with real users**
4. **Document any additional issues**

If tests fail:
1. **Check console errors**
2. **Verify server logs**
3. **Test individual components**
4. **Apply additional fixes as needed**