# OTP Authentication Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **401 Unauthorized Error on `/api/auth/me`**

**Problem**: Console shows "Failed to load resource: the server responded with a status of 401 (Unauthorized)"

**Solution**: This is **NORMAL** for unauthenticated users. The `/api/auth/me` endpoint requires authentication, so it will return 401 for users who haven't logged in yet.

**Fix Applied**: Updated AuthContext to handle this gracefully without logging errors.

### 2. **400 Bad Request on `/api/auth/login-with-otp`**

**Problem**: OTP verification fails with 400 error

**Possible Causes**:
- Invalid OTP code
- Expired OTP (10-minute limit)
- Wrong email address
- Too many failed attempts (3 attempts max)

**Solutions**:
1. **Check OTP Validity**: Ensure the OTP is exactly 6 digits
2. **Check Email**: Verify the email address matches the one used to send OTP
3. **Check Time**: OTP expires after 10 minutes
4. **Reset OTP**: If too many attempts, request a new OTP

### 3. **Email Not Sending**

**Problem**: OTP emails are not being received

**Solutions**:
1. **Check Environment Variables**: Ensure `.env` file has correct email settings:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Gmail App Password**: Use App Password, not regular password:
   - Enable 2-factor authentication on Gmail
   - Generate App Password for the application
   - Use App Password as `EMAIL_PASS`

3. **Check Spam Folder**: OTP emails might go to spam

4. **Test Email Service**: Run the test script to verify email sending

### 4. **Frontend OTP Flow Issues**

**Problem**: OTP verification doesn't work in the UI

**Solutions**:
1. **Check Console Logs**: Look for detailed error messages
2. **Verify OTP Format**: Ensure 6-digit numeric code
3. **Check Network Tab**: Verify API calls are being made correctly
4. **Test Backend Directly**: Use the test script to verify backend functionality

## 🧪 Testing the OTP Flow

### Backend Testing
```bash
cd backend
node test-complete-otp-flow.js
```

### Frontend Testing
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to signup/signin page
4. Fill out the form and submit
5. Check console for detailed logs
6. Enter OTP and verify

### Manual API Testing
```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"signup"}'

# Verify OTP (replace with actual OTP from email)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","purpose":"signup"}'
```

## 🔧 Configuration Checklist

### Backend Configuration
- [ ] `.env` file exists with email credentials
- [ ] Gmail App Password is set correctly
- [ ] Backend server is running on port 3000
- [ ] MongoDB connection is working
- [ ] All dependencies are installed (`npm install`)

### Frontend Configuration
- [ ] Frontend server is running (usually port 5173)
- [ ] CORS is properly configured
- [ ] API calls are pointing to correct backend URL
- [ ] Browser allows cookies for localhost

## 🐛 Debugging Steps

### 1. Check Backend Logs
```bash
cd backend
npm run start:dev
# Look for any error messages in the console
```

### 2. Check Frontend Console
- Open browser developer tools
- Go to Console tab
- Look for error messages and API call logs
- Check Network tab for failed requests

### 3. Verify OTP Storage
The OTP service stores OTPs in memory. If the server restarts, all OTPs are lost.

### 4. Test Email Service
```bash
cd backend
node -e "
const { EmailService } = require('./dist/email/email.service');
const emailService = new EmailService();
emailService.sendOTP('test@example.com', '123456', 'signup')
  .then(() => console.log('Email sent successfully'))
  .catch(err => console.error('Email failed:', err));
"
```

## 📞 Common Error Messages

### "OTP already sent. Please wait before requesting a new one."
**Solution**: Wait a few minutes or restart the backend server to clear OTP storage.

### "OTP has expired. Please request a new OTP."
**Solution**: Request a new OTP - the previous one expired after 10 minutes.

### "Too many failed attempts. Please request a new OTP."
**Solution**: Request a new OTP - you've exceeded the 3-attempt limit.

### "Invalid OTP. X attempts remaining."
**Solution**: Check the OTP code and try again.

### "Failed to send OTP. Please try again."
**Solution**: Check email configuration and network connectivity.

## 🚀 Quick Fixes

### Reset OTP Storage
```bash
# Restart the backend server to clear all OTPs
cd backend
npm run start:dev
```

### Clear Browser Data
- Clear cookies and local storage
- Refresh the page
- Try the flow again

### Test with Real Email
1. Use a real email address you can access
2. Set up proper email credentials in `.env`
3. Check your email (including spam folder) for OTP

## 📝 Notes

- OTPs are stored in memory and will be lost on server restart
- Each email can only have one active OTP at a time
- OTPs expire after 10 minutes
- Maximum 3 verification attempts per OTP
- The system maintains backward compatibility with regular login/signup

For additional help, check the console logs and network requests in the browser developer tools.
