# Email OTP Integration for TeleMedicine

This document describes the Email OTP (One-Time Password) system integrated into the TeleMedicine application for enhanced security during user signup and signin processes.

## 🚀 Features

- **Email OTP Verification**: Users receive a 6-digit OTP via email for signup and signin
- **Secure Authentication**: Two-factor authentication using email verification
- **Beautiful Email Templates**: Professional HTML email templates with TeleMedicine branding
- **OTP Expiration**: OTPs expire after 10 minutes for security
- **Rate Limiting**: Maximum 3 attempts per OTP to prevent brute force attacks
- **Resend Functionality**: Users can request new OTPs if needed
- **Real-time UI**: Modern, responsive OTP verification interface

## 🏗️ Architecture

### Backend Components

1. **Email Service** (`src/email/email.service.ts`)
   - Handles email sending using Nodemailer
   - Supports Gmail SMTP (configurable for other providers)
   - Beautiful HTML email templates

2. **OTP Service** (`src/email/otp.service.ts`)
   - Generates 6-digit random OTPs
   - Manages OTP storage and expiration
   - Handles verification logic and rate limiting

3. **Email Module** (`src/email/email.module.ts`)
   - Exports email and OTP services
   - Configurable email settings

4. **Updated Auth Service** (`src/auth/auth.service.ts`)
   - New methods: `sendOTP`, `verifyOTP`, `registerWithOTP`, `loginWithOTP`
   - Integrates OTP verification with existing auth flow

5. **Updated Auth Controller** (`src/auth/auth.controller.ts`)
   - New endpoints: `/send-otp`, `/verify-otp`, `/register-with-otp`, `/login-with-otp`
   - Maintains backward compatibility with existing endpoints

### Frontend Components

1. **OTP Verification Component** (`src/Components/OtpVerification.tsx`)
   - Modern, responsive OTP input interface
   - Auto-focus and paste functionality
   - Real-time timer and resend capabilities
   - Beautiful animations and loading states

2. **Updated Auth Context** (`src/contexts/AuthContext.tsx`)
   - New methods: `sendOTP`, `registerWithOTP`, `loginWithOTP`
   - Seamless integration with existing auth flow

3. **Updated Signup Page** (`src/Pages/SignupPage.tsx`)
   - OTP verification step before registration
   - Loading states and error handling

4. **Updated Signin Page** (`src/Pages/SigninPage.tsx`)
   - OTP verification step before login
   - Enhanced security for user authentication

## 🔧 Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install nodemailer @types/nodemailer
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Database Configuration
   MONGODB_URI=your-mongodb-connection-string
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Gmail App Password Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Use the App Password as `EMAIL_PASS` in your `.env` file

4. **Build and Start**
   ```bash
   npm run build
   npm run start:dev
   ```

### Frontend Setup

No additional dependencies required. The frontend uses existing packages.

## 📡 API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "signup" | "signin"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "signup" | "signin"
}
```

### Register with OTP
```http
POST /api/auth/register-with-otp
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "location": "City",
  "userType": "patient" | "doctor",
  "medicalRegNo": "MD123456", // Required for doctors
  "specialization": "Cardiology", // Required for doctors
  "otp": "123456"
}
```

### Login with OTP
```http
POST /api/auth/login-with-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "userType": "patient" | "doctor",
  "otp": "123456"
}
```

## 🔄 User Flow

### Signup Flow
1. User fills out registration form
2. Clicks "Create Account" → OTP sent to email
3. User enters 6-digit OTP from email
4. System verifies OTP and creates account
5. User receives welcome email
6. User is redirected to dashboard

### Signin Flow
1. User enters email and password
2. Clicks "Sign In" → OTP sent to email
3. User enters 6-digit OTP from email
4. System verifies OTP and credentials
5. User is logged in and redirected to dashboard

## 🛡️ Security Features

- **OTP Expiration**: 10-minute validity period
- **Rate Limiting**: Maximum 3 verification attempts per OTP
- **Secure Storage**: OTPs stored in memory (not persistent)
- **Email Validation**: Proper email format validation
- **Purpose Validation**: OTPs are purpose-specific (signup vs signin)
- **Automatic Cleanup**: Expired OTPs are automatically removed

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all device sizes
- **Auto-focus**: Automatic input field focusing
- **Paste Support**: Users can paste 6-digit codes
- **Real-time Timer**: Shows remaining time for OTP validity
- **Loading States**: Visual feedback during operations
- **Error Handling**: Clear error messages and recovery options
- **Accessibility**: Keyboard navigation and screen reader support

## 🧪 Testing

Run the OTP test script:
```bash
cd backend
node test-otp-flow.js
```

## 🔧 Configuration Options

### Email Service Configuration
- **Service Provider**: Currently configured for Gmail, easily changeable
- **SMTP Settings**: Configurable for any SMTP provider
- **Email Templates**: Customizable HTML templates

### OTP Configuration
- **Length**: Currently 6 digits (configurable)
- **Expiration**: Currently 10 minutes (configurable)
- **Max Attempts**: Currently 3 attempts (configurable)
- **Storage**: Currently in-memory (can be changed to Redis/database)

## 🚀 Future Enhancements

- **SMS OTP**: Add SMS as alternative to email
- **Redis Storage**: Use Redis for OTP storage in production
- **Rate Limiting**: Implement IP-based rate limiting
- **Analytics**: Track OTP usage and success rates
- **Multi-language**: Support for multiple languages in emails

## 📝 Notes

- The system maintains backward compatibility with existing authentication
- Original signup/signin endpoints still work without OTP
- Email service gracefully handles failures (welcome emails are non-critical)
- OTP storage is currently in-memory (resets on server restart)

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail App Password is correct
   - Check internet connectivity

2. **OTP verification failing**
   - Ensure OTP is entered within 10 minutes
   - Check for typos in OTP entry
   - Verify email address matches

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript compilation errors

For more help, check the console logs or contact the development team.
