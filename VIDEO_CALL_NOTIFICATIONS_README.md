# Video Call Notification System

This document describes the implementation of the video call notification feature for the TeleMedicine application.

## Overview

The video call notification system enables real-time communication between patients and doctors for video consultations. When a patient requests an immediate video consultation, the system sends notifications to the doctor, who can then accept or reject the call request.

## Architecture

### Backend Components

1. **VideoCallNotificationsGateway** (`backend/src/video-call-notifications/video-call-notifications.gateway.ts`)
   - WebSocket gateway handling real-time video call notifications
   - Manages Socket.IO connections for patients and doctors
   - Handles video call requests, acceptances, and rejections

2. **VideoCallNotificationsService** (`backend/src/video-call-notifications/video-call-notifications.service.ts`)
   - Service layer for video call notification operations
   - Creates and manages notification records in the database
   - Handles notification CRUD operations

3. **VideoCallNotificationsController** (`backend/src/video-call-notifications/video-call-notifications.controller.ts`)
   - REST API endpoints for video call notifications
   - Handles HTTP requests for notification management

4. **VideoCallNotificationsModule** (`backend/src/video-call-notifications/video-call-notifications.module.ts`)
   - NestJS module configuration
   - Imports required dependencies and exports services

### Frontend Components

1. **VideoCallNotificationService** (`frontend/src/utils/video-call-notifications.ts`)
   - Client-side Socket.IO service for video call notifications
   - Manages real-time communication with the backend
   - Provides methods for requesting, accepting, and rejecting calls

2. **DoctorVideoCallNotifications** (`frontend/src/Pages/Doctor/VideoCallNotifications.tsx`)
   - Doctor interface for managing video call requests
   - Displays incoming call notifications with accept/reject buttons
   - Real-time updates for new call requests

3. **Updated Patient Components**
   - **AppointmentBooking**: Updated to use new video call notification service
   - **Patient Notifications**: Enhanced to handle video call responses

## Flow Description

### 1. Patient Initiates Video Call

1. Patient clicks "Start Video Call" button in the appointment booking modal
2. System creates an immediate appointment
3. Patient's frontend calls `requestVideoCall()` method
4. Socket.IO emits `request-video-call` event to backend
5. Backend creates notification record in database
6. Backend emits `incoming-video-call` event to connected doctors

### 2. Doctor Receives Notification

1. Doctor's frontend receives `incoming-video-call` event
2. Notification appears in doctor's video call notifications page
3. Browser notification is shown (if permission granted)
4. Doctor sees patient details and call information

### 3. Doctor Accepts Call

1. Doctor clicks "Accept Call" button
2. Frontend calls `acceptVideoCall()` method
3. Socket.IO emits `accept-video-call` event to backend
4. Backend creates acceptance notification for patient
5. Backend emits `call-accepted` event to patient
6. Patient's frontend navigates to video consultation page

### 4. Doctor Rejects Call

1. Doctor clicks "Reject Call" button
2. Frontend calls `rejectVideoCall()` method
3. Socket.IO emits `reject-video-call` event to backend
4. Backend creates rejection notification for patient
5. Backend emits `call-rejected` event to patient
6. Patient's frontend redirects to dashboard

## API Endpoints

### Video Call Notifications

- `POST /api/video-call-notifications/request-call` - Request a video call
- `POST /api/video-call-notifications/accept-call` - Accept a video call
- `POST /api/video-call-notifications/reject-call` - Reject a video call
- `GET /api/video-call-notifications/my-notifications` - Get user's video call notifications
- `POST /api/video-call-notifications/mark-read/:notificationId` - Mark notification as read

## Socket.IO Events

### Client to Server Events

- `request-video-call` - Patient requests video call
- `accept-video-call` - Doctor accepts video call
- `reject-video-call` - Doctor rejects video call

### Server to Client Events

- `incoming-video-call` - Doctor receives call request
- `call-accepted` - Patient receives call acceptance
- `call-rejected` - Patient receives call rejection
- `call-request-sent` - Patient receives request confirmation
- `call-accepted-confirmation` - Doctor receives acceptance confirmation
- `call-rejected-confirmation` - Doctor receives rejection confirmation
- `call-error` - Error in call process
- `new-notification` - New notification available

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

## Setup Instructions

### Backend Setup

1. Ensure the `VideoCallNotificationsModule` is imported in `app.module.ts`
2. The module automatically imports required dependencies:
   - Notification schema
   - NotificationsModule

### Frontend Setup

1. Import the `VideoCallNotificationService` in components that need it
2. Initialize the service with user ID and type:
   ```typescript
   const service = initializeVideoCallNotificationService(userId, userType);
   ```
3. Set up event listeners for call responses
4. Use the service methods to interact with the backend

## Testing

Run the test script to verify the video call notification flow:

```bash
node test-video-call-notifications.js
```

The test script will:
1. Simulate a patient requesting a video call
2. Simulate a doctor receiving and accepting the call
3. Test the rejection scenario
4. Verify all Socket.IO events are working correctly

## Features

- ✅ Real-time video call notifications
- ✅ Accept/Reject functionality for doctors
- ✅ Automatic navigation for patients based on call response
- ✅ Browser notifications (with permission)
- ✅ Database persistence of notifications
- ✅ Error handling and user feedback
- ✅ Clean separation of concerns
- ✅ TypeScript support throughout

## Security Considerations

- All Socket.IO connections require authentication
- JWT tokens are validated for API endpoints
- User types are verified for appropriate actions
- Input validation on all endpoints

## Future Enhancements

- Call timeout handling
- Call history tracking
- Multiple call support
- Call quality indicators
- Push notifications for mobile devices
- Call recording capabilities
