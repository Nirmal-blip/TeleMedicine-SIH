# 🏥 Telemedicine Platform

A comprehensive telemedicine platform built with modern technologies, featuring AI-powered medical assistance, real-time consultations, and seamless patient-doctor interactions.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend (NestJS)](#backend-nestjs)
- [Flask AI/ML Server](#flask-aiml-server)
- [Database Schemas](#database-schemas)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## 🎯 Overview

This telemedicine platform provides a complete digital healthcare solution that connects patients with doctors through secure, real-time communication channels. The platform integrates AI-powered medical assistance, medicine recommendations, and hospital location services to enhance the healthcare experience.

### Key Features

- 👥 **User Management**: Separate authentication for patients and doctors
- 📅 **Appointment Scheduling**: Book, manage, and track medical appointments
- 💬 **Real-time Chat**: Secure messaging between patients and doctors
- 🤖 **AI Medical Assistant**: Google Gemini-powered chatbot for medical consultations
- 💊 **Medicine Recommendations**: AI-driven alternative medicine suggestions
- 🏥 **Hospital Locator**: Find nearby hospitals with integrated maps
- 📋 **Medical Records**: Comprehensive patient health record management
- 📝 **Digital Prescriptions**: Electronic prescription management
- 🔔 **Notifications**: Real-time alerts and reminders
- 📊 **Dashboard Analytics**: Insights for both patients and healthcare providers

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Flask Server  │
│   (React)       │◄──►│   (NestJS)       │◄──►│   (AI/ML)       │
│                 │    │                  │    │                 │
│ - User Interface│    │ - API Gateway    │    │ - Chatbot       │
│ - State Mgmt    │    │ - Authentication │    │ - Medicine Rec  │
│ - Components    │    │ - Business Logic │    │ - Hospital Maps │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   Database      │
                       │                 │
                       │ - Collections   │
                       │ - Indexing      │
                       │ - Aggregation   │
                       └─────────────────┘
```

## 🚀 Backend (NestJS)

The backend is built using NestJS with TypeScript, providing a scalable and maintainable server-side application.

### Project Structure

```
backend/
├── src/
│   ├── ai-ml/                 # AI/ML service integration
│   ├── appointments/          # Appointment management
│   ├── auth/                  # Authentication & authorization
│   ├── database/              # Database configuration & seeding
│   ├── doctors/               # Doctor management
│   ├── dto/                   # Data Transfer Objects
│   ├── patients/              # Patient management
│   ├── schemas/               # MongoDB schemas
│   ├── uploads/               # File upload handling
│   ├── app.module.ts          # Main application module
│   └── main.ts                # Application entry point
├── dist/                      # Compiled JavaScript files
├── uploads/                   # Static file storage
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

### Core Modules

#### 1. Authentication Module (`/auth`)
- **JWT-based authentication** with secure cookie handling
- **Role-based access control** for patients and doctors
- **Registration and login** endpoints with validation
- **Password hashing** using bcrypt

#### 2. Appointments Module (`/appointments`)
- **Appointment scheduling** with conflict detection
- **Status management** (Pending, Confirmed, Completed, Canceled)
- **Integration with doctor availability**
- **Payment status tracking**

#### 3. AI/ML Module (`/ai-ml`)
- **Proxy to Flask AI services**
- **Health monitoring** of AI services
- **Request/response transformation**
- **Error handling and fallbacks**

#### 4. Database Module (`/database`)
- **MongoDB connection management**
- **Database seeding service**
- **Environment-based configuration**
- **Connection pooling and optimization**

#### 5. Patients & Doctors Modules
- **CRUD operations** for user profiles
- **Profile image uploads**
- **Search and filtering capabilities**
- **Availability management (doctors)**

### Key Technologies

- **NestJS Framework**: Progressive Node.js framework
- **TypeScript**: Type-safe JavaScript development
- **MongoDB & Mongoose**: NoSQL database with ODM
- **JWT Authentication**: Secure token-based auth
- **Swagger/OpenAPI**: Automatic API documentation
- **Multer**: File upload handling
- **bcrypt**: Password hashing
- **Class Validator**: Input validation

### Configuration

The backend uses environment-based configuration with the following key variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/telemedicine

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Flask AI Server
FLASK_AI_URL=http://localhost:5000

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10MB
```

## 🤖 Flask AI/ML Server

The Flask server provides AI-powered services including medical consultation, medicine recommendations, and hospital location services.

### Project Structure

```
flaskServer/
├── app.py                     # Main Flask application
├── Chatbot.py                 # Google Gemini integration
├── MedicineRecommend.py       # Medicine recommendation engine
├── Maps.py                    # Hospital location services
├── requirements.txt           # Python dependencies
└── A_Z_medicines_dataset_of_India.csv  # Medicine database
```

### Core Services

#### 1. AI Medical Chatbot
- **Google Gemini 2.0 Flash** integration for natural language processing
- **Medical-specific responses** with disease detection
- **Appointment booking** automation
- **Text-to-speech** capabilities
- **Voice input processing** via speech recognition

```python
# Key Features
- Disease-specific recommendations (Do's and Don'ts)
- Emergency response protocols
- Appointment scheduling integration
- Multi-modal input (text/voice)
```

#### 2. Medicine Recommendation Engine
- **TF-IDF vectorization** for medicine matching
- **Cosine similarity** for alternative recommendations
- **Fuzzy string matching** for name variations
- **Indian medicine database** (A-Z dataset)

```python
# Algorithm Flow
1. Input: Partial medicine name
2. Fuzzy matching to find closest match
3. TF-IDF vectorization of compositions
4. Cosine similarity calculation
5. Return top-N alternatives with details
```

#### 3. Hospital Location Services
- **OpenStreetMap Overpass API** integration
- **Geolocation-based search** with configurable radius
- **Google Maps directions** integration
- **Real-time availability** (where supported)

### API Endpoints

#### Health Check
- `GET /health` - Service health status

#### Chatbot Services
- `POST /api/chat` - Text-based medical consultation
- `POST /api/voice-chat` - Voice-based consultation

#### Medicine Services
- `POST /api/medicine/recommend` - Get medicine alternatives

#### Location Services
- `GET /api/hospitals` - Find nearby hospitals

### Dependencies

```txt
Flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
pandas==2.0.3
scikit-learn==1.3.0
thefuzz==0.22.1
python-Levenshtein==0.21.1
SpeechRecognition==3.10.0
pyttsx3==2.90
```

### Configuration

```python
# Google Gemini API
GEMINI_API_KEY = "your-api-key"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# OpenStreetMap Overpass API
OVERPASS_URL = "http://overpass-api.de/api/interpreter"

# Server Configuration
HOST = "0.0.0.0"
PORT = 5000
DEBUG = True
```

## 📊 Database Schemas

The platform uses MongoDB with Mongoose ODM, featuring 7 core schemas with comprehensive indexing and relationships.

### 1. Patient Schema

```typescript
Patient {
  fullname: string                    // Required
  email: string                       // Unique, required
  phone: string                       // Required
  dateOfBirth: Date                   // Required
  gender: 'Male' | 'Female' | 'Other' // Required
  location: string                    // Required
  password: string                    // Hashed, required
  profileImage?: string               // Optional
  emergencyContact?: {                // Optional
    name: string
    phone: string
    relationship: string
  }
  bloodGroup?: string                 // Optional
  allergies?: string[]                // Optional
  height?: number                     // cm, optional
  weight?: number                     // kg, optional
  isActive: boolean                   // Default: true
  lastLogin?: Date                    // Optional
}
```

**Indexes**: email (unique), phone, isActive, location, bloodGroup, createdAt

### 2. Doctor Schema

```typescript
Doctor {
  fullname: string                    // Required
  email: string                       // Unique, required
  phone: string                       // Required
  dateOfBirth: Date                   // Required
  gender: 'Male' | 'Female' | 'Other' // Required
  location: string                    // Required
  medicalRegNo: string                // Unique, required
  specialization: string              // Required
  password: string                    // Hashed, required
  profileImage?: string               // Optional
  qualification?: string              // Optional
  experience?: number                 // Years, optional
  consultationFee?: number            // Optional
  availability?: Array<{              // Optional
    day: string                       // Monday-Sunday
    startTime: string                 // HH:mm format
    endTime: string                   // HH:mm format
  }>
  about?: string                      // Optional
  rating?: number                     // Default: 4.5
  totalRatings?: number               // Default: 0
  isActive: boolean                   // Default: true
  isVerified: boolean                 // Default: false
  lastLogin?: Date                    // Optional
}
```

**Indexes**: email (unique), medicalRegNo (unique), specialization, location, isActive, isVerified, rating, consultationFee, createdAt

### 3. Appointment Schema

```typescript
Appointment {
  doctor: ObjectId                    // Reference to Doctor
  patient: ObjectId                   // Reference to Patient
  date: Date                          // Required
  time: string                        // Required
  status: 'Pending' | 'Confirmed' |   // Default: 'Pending'
          'Completed' | 'Canceled' | 
          'Rescheduled'
  reason: string                      // Required
  notes?: string                      // Optional
  type: 'Online' | 'In-Person'       // Default: 'Online'
  meetingLink?: string                // Optional
  prescription?: string               // Optional
  diagnosis?: string                  // Optional
  followUpDate?: Date                 // Optional
  consultationFee?: number            // Optional
  paymentStatus: 'Pending' | 'Paid' | // Default: 'Pending'
                 'Failed'
  cancelReason?: string               // Optional
  rating?: number                     // Optional
  review?: string                     // Optional
}
```

**Indexes**: doctor, patient, date, status, type, paymentStatus, (doctor, date), (patient, date), createdAt

### 4. Medical Record Schema

```typescript
MedicalRecord {
  patient: ObjectId                   // Reference to Patient
  doctor: ObjectId                    // Reference to Doctor
  appointment?: ObjectId              // Reference to Appointment
  title: string                       // Required
  description: string                 // Required
  diagnosis?: string                  // Optional
  symptoms?: string[]                 // Optional
  vitals?: {                          // Optional
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygenSaturation?: number
  }
  medications?: Array<{               // Optional
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  labResults?: Array<{                // Optional
    testName: string
    result: string
    normalRange: string
    date: Date
  }>
  attachments?: Array<{               // Optional
    filename: string
    path: string
    type: string
    uploadDate: Date
  }>
  priority: 'Emergency' | 'High' |    // Default: 'Medium'
           'Medium' | 'Low'
  status: 'Active' | 'Resolved' |     // Default: 'Active'
          'Ongoing'
  followUpRequired?: boolean          // Optional
  followUpDate?: Date                 // Optional
  notes?: string                      // Optional
}
```

**Indexes**: patient, doctor, appointment, status, priority, (patient, createdAt), (doctor, createdAt), createdAt

### 5. Prescription Schema

```typescript
Prescription {
  patient: ObjectId                   // Reference to Patient
  doctor: ObjectId                    // Reference to Doctor
  appointment?: ObjectId              // Reference to Appointment
  prescriptionNumber: string          // Unique, required
  medications: Array<{                // Required
    name: string                      // Required
    genericName?: string              // Optional
    dosage: string                    // Required
    frequency: string                 // Required
    duration: string                  // Required
    instructions?: string             // Optional
    quantity: number                  // Required
    refills?: number                  // Optional
  }>
  diagnosis?: string                  // Optional
  symptoms?: string[]                 // Optional
  doctorNotes?: string                // Optional
  patientInstructions?: string        // Optional
  issueDate: Date                     // Required
  expiryDate?: Date                   // Optional
  status: 'Active' | 'Completed' |    // Default: 'Active'
          'Cancelled' | 'Expired'
  isDispensed: boolean                // Default: false
  dispensedDate?: Date                // Optional
  pharmacyName?: string               // Optional
  pharmacistNotes?: string            // Optional
  allergies?: string[]                // Optional
  warnings?: string[]                 // Optional
  priority: 'Low' | 'Medium' |        // Default: 'Medium'
           'High' | 'Critical'
  requiresMonitoring: boolean         // Default: false
  monitoringInstructions?: string     // Optional
  followUpRequired?: boolean          // Optional
  followUpDate?: Date                 // Optional
}
```

**Indexes**: patient, doctor, appointment, prescriptionNumber (unique), status, isDispensed, issueDate, expiryDate, (patient, issueDate), (doctor, issueDate), createdAt

### 6. Chat Schema

```typescript
Chat {
  patient: ObjectId                   // Reference to Patient
  doctor: ObjectId                    // Reference to Doctor
  appointment?: ObjectId              // Reference to Appointment
  messages: Array<{                   // Default: []
    sender: ObjectId                  // Required
    senderType: 'Patient' | 'Doctor'  // Required
    message: string                   // Required
    timestamp: Date                   // Required
    messageType: 'text' | 'image' |   // Default: 'text'
                 'file' | 'audio' | 'video'
    attachments?: Array<{             // Optional
      filename: string
      path: string
      type: string
      size: number
    }>
    isRead: boolean                   // Default: false
    isEdited?: boolean                // Default: false
    editedAt?: Date                   // Optional
    replyTo?: string                  // Optional
  }>
  status: 'Active' | 'Closed' |       // Default: 'Active'
          'Archived'
  lastMessage?: {                     // Optional
    content: string
    timestamp: Date
    sender: ObjectId
    senderType: 'Patient' | 'Doctor'
  }
  unreadCount: {                      // Default: {patient: 0, doctor: 0}
    patient: number
    doctor: number
  }
  subject?: string                    // Optional
  category: 'General' | 'Emergency' | // Default: 'General'
           'Follow-up' | 'Prescription' |
           'Lab Results'
  priority: 'Low' | 'Medium' |        // Default: 'Medium'
           'High' | 'Urgent'
  isEmergency: boolean                // Default: false
  tags?: string[]                     // Optional
  closedAt?: Date                     // Optional
  closedBy?: ObjectId                 // Optional
  archivedAt?: Date                   // Optional
}
```

**Indexes**: patient, doctor, appointment, status, category, priority, isEmergency, (patient, doctor), lastMessage.timestamp, createdAt

### 7. Notification Schema

```typescript
Notification {
  recipient: ObjectId                 // Required
  recipientType: 'Patient' | 'Doctor' // Required
  sender?: ObjectId                   // Optional
  senderType: 'Patient' | 'Doctor' |  // Default: 'System'
              'System'
  title: string                       // Required
  message: string                     // Required
  type: 'appointment_booked' |        // Required
        'appointment_confirmed' |
        'appointment_cancelled' |
        'appointment_reminder' |
        'prescription_ready' |
        'message_received' |
        'payment_received' |
        'profile_updated' |
        'system_maintenance' |
        'emergency_alert'
  relatedEntity?: {                   // Optional
    entityType: 'Appointment' | 'Prescription' |
                'Chat' | 'MedicalRecord'
    entityId: ObjectId
  }
  priority: 'Low' | 'Medium' |        // Default: 'Medium'
           'High' | 'Critical'
  isRead: boolean                     // Default: false
  readAt?: Date                       // Optional
  isEmailSent: boolean                // Default: false
  isSMSSent: boolean                  // Default: false
  isPushSent: boolean                 // Default: false
  scheduledFor?: Date                 // Optional
  isSent: boolean                     // Default: false
  sentAt?: Date                       // Optional
  actionUrl?: string                  // Optional
  actionText?: string                 // Optional
  expiresAt?: Date                    // Optional
  metadata?: Record<string, any>      // Optional
}
```

**Indexes**: recipient, recipientType, type, isRead, priority, scheduledFor, isSent, expiresAt, (recipient, isRead), (recipient, createdAt), createdAt

## 🔗 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user (patient/doctor) | No |
| POST | `/login` | User authentication | No |
| GET | `/logout` | User logout | No |

### Patient Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/patients` | Get all patients | Yes |
| GET | `/api/patients/:id` | Get patient by ID | Yes |
| POST | `/api/patients` | Create new patient | Yes |
| PATCH | `/api/patients/:id` | Update patient | Yes |
| DELETE | `/api/patients/:id` | Delete patient | Yes |

### Doctor Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/doctors` | Get all doctors | Yes |
| GET | `/api/doctors/:id` | Get doctor by ID | Yes |
| POST | `/api/doctors` | Create new doctor | Yes |
| PATCH | `/api/doctors/:id` | Update doctor | Yes |
| DELETE | `/api/doctors/:id` | Delete doctor | Yes |

### Appointment Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appointments` | Get appointments (with filters) | Yes |
| GET | `/api/appointments/:id` | Get appointment by ID | Yes |
| POST | `/api/appointments` | Create new appointment | Yes |
| PATCH | `/api/appointments/:id` | Update appointment | Yes |
| DELETE | `/api/appointments/:id` | Cancel appointment | Yes |

### AI/ML Services

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/ai/health` | Check AI services health | Yes |
| POST | `/api/ai/chat` | Chat with AI assistant | Yes |
| POST | `/api/ai/voice-chat` | Voice chat with AI | Yes |
| POST | `/api/ai/medicine/recommend` | Get medicine recommendations | Yes |
| GET | `/api/ai/hospitals` | Find nearby hospitals | Yes |

### Flask AI/ML Server Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Service health check | No |
| POST | `/api/chat` | Medical chatbot | No |
| POST | `/api/voice-chat` | Voice-enabled chat | No |
| POST | `/api/medicine/recommend` | Medicine alternatives | No |
| GET | `/api/hospitals` | Hospital locator | No |

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**
- **Git**

### Backend Setup (NestJS)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Telemedicine/backend
   ```

2. **Install dependencies**
   ```bash
npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start local MongoDB service
   sudo systemctl start mongod
   ```

5. **Build and start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production build
   npm run build
   npm run start:prod
   ```

### Flask AI/ML Server Setup

1. **Navigate to Flask directory**
   ```bash
   cd Telemedicine/flaskServer
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API keys**
   ```bash
   # Edit app.py and add your Google Gemini API key
   GEMINI_API_KEY = "your-google-gemini-api-key"
   ```

5. **Start the Flask server**
   ```bash
   python app.py
   ```

### Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd Telemedicine/frontend
   ```

2. **Install dependencies**
   ```bash
npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Full Stack Startup

**Using the combined startup script:**
```bash
cd Telemedicine/backend
npm run start:dev  # Starts both NestJS and Flask servers
```

### Database Seeding

The application includes a comprehensive seeding service:

```bash
# Seed the database with sample data
curl -X POST http://localhost:3000/api/database/seed
```

**Seeded data includes:**
- 20 Patients with diverse profiles
- 15 Doctors across multiple specializations
- 30 Appointments with various statuses
- Medical records and prescriptions
- Chat conversations
- Notifications

## 🚀 Usage

### For Patients

1. **Registration/Login**
   - Register with personal details
   - Upload profile picture
   - Add emergency contact information

2. **Find Doctors**
   - Search by specialization or location
   - View doctor profiles and ratings
   - Check availability schedules

3. **Book Appointments**
   - Select preferred time slots
   - Choose consultation type (online/in-person)
   - Add reason for visit

4. **AI Medical Assistant**
   - Ask health-related questions
   - Get medicine recommendations
   - Find nearby hospitals

5. **Manage Health Records**
   - View medical history
   - Access prescriptions
   - Track follow-ups

### For Doctors

1. **Professional Profile**
   - Complete profile with qualifications
   - Set consultation fees
   - Manage availability schedule

2. **Appointment Management**
   - View upcoming appointments
   - Confirm/reschedule bookings
   - Update appointment status

3. **Patient Consultation**
   - Access patient medical history
   - Conduct video consultations
   - Create digital prescriptions

4. **Medical Records**
   - Update patient records
   - Add diagnostic notes
   - Upload lab results

## 🛡️ Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **Password Hashing** using bcrypt with salt rounds
- **Input Validation** using class-validator
- **CORS Protection** with configurable origins
- **Rate Limiting** to prevent abuse
- **File Upload Security** with type and size validation
- **Data Sanitization** to prevent injection attacks

## 🔧 Technologies Used

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **Swagger** - API documentation

### AI/ML Server
- **Flask** - Python web framework
- **Google Gemini** - AI language model
- **scikit-learn** - Machine learning
- **pandas** - Data manipulation
- **TF-IDF** - Text vectorization
- **SpeechRecognition** - Voice processing
- **pyttsx3** - Text-to-speech

### Database
- **MongoDB** - Document database
- **Mongoose** - ODM with TypeScript
- **Indexing** - Performance optimization
- **Aggregation** - Complex queries

### Frontend (Not detailed in backend focus)
- **React** - UI library
- **Vite** - Build tool
- **Modern JavaScript** - ES6+

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow **TypeScript best practices**
- Write **comprehensive tests**
- Use **conventional commits**
- Update **documentation**
- Ensure **code quality** with ESLint

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **OpenStreetMap** for hospital location data
- **NestJS Team** for the excellent framework
- **MongoDB Team** for the robust database

## 📞 Support

For support and questions:
- 📧 Email: support@telemedicine.com
- 📱 Phone: +1-234-567-8900
- 💬 Chat: Available in the application

---

**Built with ❤️ for better healthcare accessibility**