# 🤖 Chatbot Integration Guide

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Chatbot Server

**Option A: Using the batch file (Windows)**

```bash
start_chatbot.bat
```

**Option B: Direct Python command**

```bash
python Chatbot.py
```

### 3. Run Your Flutter App

```bash
flutter run
```

## 🔧 Features

### ✅ Integrated Features:

- **Real-time Chat**: Connect with AI doctor assistant
- **Medical Advice**: Get health recommendations and symptom analysis
- **Disease Detection**: Automatic disease identification with do's and don'ts
- **Appointment Booking**: Automatic appointment scheduling
- **Loading States**: Visual feedback during AI processing
- **Quick Actions**: Pre-defined medical queries for faster interaction
- **Professional UI**: Enhanced chat interface with gradients and shadows

### 🎯 API Endpoints:

- `POST /chat` - Main chat endpoint
- `POST /voice-chat` - Voice input processing (optional)

### 📱 Flutter Integration:

- **Messages Page**: Enhanced with loading states and quick actions
- **Error Handling**: Proper error messages and connection status
- **Professional Design**: Modern chat UI with medical theme

## 🔑 API Configuration

The chatbot uses Google Gemini API. Make sure to:

1. Get your API key from Google AI Studio
2. Set it in the environment or use the fallback key in the code
3. The server runs on `http://127.0.0.1:5000`

## 🎨 UI Enhancements

### Chat Interface:

- **User Messages**: Green gradient bubbles (right side)
- **AI Messages**: White/grey gradient bubbles (left side)
- **Loading State**: Blue gradient with spinner animation
- **Quick Actions**: Blue chips for common medical queries

### Quick Action Buttons:

- "I have a fever"
- "Cold symptoms"
- "Headache"
- "Book appointment"

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Failed**: Make sure the chatbot server is running
2. **API Errors**: Check your Google Gemini API key
3. **Dependencies**: Install all required Python packages

### Server Status:

- ✅ Server running: Chat works normally
- ❌ Server down: Shows connection error message

## 📋 Next Steps

1. Start the chatbot server
2. Run your Flutter app
3. Navigate to Messages page
4. Start chatting with Dr. AI Assistant!

---

**Note**: The chatbot provides medical advice but should not replace professional medical consultation.
