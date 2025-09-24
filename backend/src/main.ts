import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure Socket.IO adapter with proper CORS settings
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Cookie parser middleware
  app.use(cookieParser());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Telemedicine API')
    .setDescription('Comprehensive Telemedicine Backend API with AI/ML Integration')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Patients', 'Patient management endpoints')
    .addTag('Doctors', 'Doctor management endpoints')
    .addTag('Appointments', 'Appointment management endpoints')
    .addTag('AI/ML', 'AI and Machine Learning services (via Flask server)')
    .addTag('Uploads', 'File upload endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'token',
      description: 'JWT token stored in HTTP-only cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Telemedicine API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img {content:url('/logo.png'); width:120px; height:auto;}
      .swagger-ui .topbar { background-color: #1976d2; }
    `,
  });

  // await app.listen(3000);
  // console.log('Server started on port 3000');
  // console.log('API Documentation available at: http://localhost:3000/api/docs');
const port = process.env.PORT || 3000;  // fallback to 3000 locally
await app.listen(port);
console.log(`Server started on port ${port}`);
}
bootstrap();
