# Telemedicine Backend - NestJS TypeScript

This backend has been migrated from Express.js (JavaScript) to NestJS (TypeScript) following the MVC pattern.

## Features

- **TypeScript**: Fully typed application with enhanced development experience
- **NestJS**: Modern Node.js framework with decorator-based architecture
- **MVC Pattern**: Organized into modules, controllers, and services
- **MongoDB**: Database integration using Mongoose with TypeScript schemas
- **JWT Authentication**: Secure authentication with cookies
- **File Upload**: Multer integration for file handling
- **Validation**: Class-validator for request validation
- **API Documentation**: RESTful API endpoints

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── patients/             # Patient management module
│   ├── patients.controller.ts
│   ├── patients.service.ts
│   └── patients.module.ts
├── doctors/              # Doctor management module
│   ├── doctors.controller.ts
│   ├── doctors.service.ts
│   └── doctors.module.ts
├── appointments/         # Appointment management module
│   ├── appointments.controller.ts
│   ├── appointments.service.ts
│   └── appointments.module.ts
├── uploads/              # File upload module
│   ├── uploads.controller.ts
│   └── uploads.module.ts
├── schemas/              # Mongoose schemas
│   ├── patient.schema.ts
│   ├── doctor.schema.ts
│   └── appointment.schema.ts
├── dto/                  # Data Transfer Objects
│   ├── auth.dto.ts
│   └── appointment.dto.ts
├── database/             # Database configuration
│   └── database.module.ts
├── app.controller.ts     # Main app controller (catch-all routes)
├── app.module.ts         # Main app module
└── main.ts              # Application entry point
```

## API Endpoints

### Authentication
- `POST /register` - Register new user (patient or doctor)
- `POST /login` - User login
- `GET /logout` - User logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors?specialization=<spec>` - Get doctors by specialization
- `GET /api/doctors/:id` - Get doctor by ID
- `PATCH /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments?doctorId=<id>` - Get appointments by doctor
- `GET /api/appointments?patientId=<id>` - Get appointments by patient
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### File Upload
- `POST /api/uploads` - Upload file

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure MongoDB is running on `mongodb://127.0.0.1:27017/TeleMedicine`

3. Start development server:
   ```bash
   npm run start:dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run start:prod
   ```

## Migration Notes

- All JavaScript files have been migrated to TypeScript
- Original files backed up in `/backend/backup/` directory
- Maintained backward compatibility with existing frontend
- Enhanced error handling and validation
- Improved type safety and development experience

## Environment Variables

In production, consider using environment variables for:
- JWT secret key (currently hardcoded as "Sayantan")
- Database connection string
- File upload configurations
- CORS settings

## Security Features

- JWT token authentication with HTTP-only cookies
- Password hashing with bcrypt
- Request validation using class-validator
- File upload restrictions and size limits
- CORS configuration for secure cross-origin requests
