import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string
  ) {
    const mongoUserId = req.user.userId; // MongoDB ObjectId
    const userType = req.user.userType; // 'doctor' or 'patient'
    const limitNum = limit ? parseInt(limit) : 50;
    const skipNum = skip ? parseInt(skip) : 0;

    // Get the custom ID (patientId or doctorId) based on userType
    let customUserId = mongoUserId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(mongoUserId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(mongoUserId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID:', error);
      // Fall back to MongoDB ObjectId if custom ID fetch fails
    }

    // Debug logging
    console.log('🔍 Notifications Request:', {
      mongoUserId,
      customUserId,
      userType,
      limit: limitNum,
      skip: skipNum,
      filters: { type, priority, search }
    });

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

    if (search) {
      return await this.notificationsService.searchNotifications(customUserId, capitalizedUserType, search);
    }
    if (type) {
      return await this.notificationsService.getNotificationsByType(customUserId, capitalizedUserType, type);
    }
    if (priority) {
      return await this.notificationsService.getNotificationsByPriority(customUserId, capitalizedUserType, priority);
    }

    // Filter OUT video call notifications - show only other types
    const excludeVideoCallTypes = ['video_call_request', 'video_call_accepted', 'video_call_rejected', 'video_call_ended'];
    const notifications = await this.notificationsService.getNotificationsExcludingTypes(customUserId, capitalizedUserType, excludeVideoCallTypes, limitNum, skipNum);
    console.log(`📋 Found ${notifications.length} non-video call notifications for user ${customUserId} (${capitalizedUserType})`);
    
    return notifications;
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const mongoUserId = req.user.userId;
    const userType = req.user.userType;
    
    // Get the custom ID (patientId or doctorId) based on userType
    let customUserId = mongoUserId;
    try {
      if (userType === 'doctor') {
        const doctor = await this.doctorModel.findById(mongoUserId).select('doctorId');
        if (doctor && doctor.doctorId) {
          customUserId = doctor.doctorId;
        }
      } else if (userType === 'patient') {
        const patient = await this.patientModel.findById(mongoUserId).select('patientId');
        if (patient && patient.patientId) {
          customUserId = patient.patientId;
        }
      }
    } catch (error) {
      console.error('Error fetching custom user ID for unread count:', error);
    }

    const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
    // Filter unread count to exclude video call notifications - count only other types
    const excludeVideoCallTypes = ['video_call_request', 'video_call_accepted', 'video_call_rejected', 'video_call_ended'];
    const count = await this.notificationsService.getUnreadNotificationsCountExcludingTypes(customUserId, capitalizedUserType, excludeVideoCallTypes);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    const userType = req.user.userType;
    return await this.notificationsService.markAllAsRead(userId, userType);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.deleteNotification(id, userId);
  }

  @Delete()
  async deleteAllNotifications(@Request() req): Promise<any> {
    const userId = req.user.userId;
    const userType = req.user.userType;
    return await this.notificationsService.deleteAllNotifications(userId, userType);
  }

  @Post()
  async createNotification(@Body() notificationData: any, @Request() req) {
    // Only allow system or admin users to create notifications directly
    // In most cases, notifications should be created through specific service methods
    return await this.notificationsService.createNotification(notificationData);
  }

  @Post('appointment')
  async createAppointmentNotification(@Body() appointmentData: any) {
    return await this.notificationsService.createAppointmentNotification(appointmentData);
  }

  @Post('prescription')
  async createPrescriptionNotification(@Body() prescriptionData: any) {
    return await this.notificationsService.createPrescriptionNotification(prescriptionData);
  }

  @Post('emergency')
  async createEmergencyNotification(@Body() emergencyData: any) {
    return await this.notificationsService.createEmergencyNotification(emergencyData);
  }

  @Post('video-call')
  async createVideoCallNotification(@Body() videoCallData: {
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    appointmentId?: string;
    callId?: string;
    type: 'video_call_request' | 'video_call_accepted' | 'video_call_rejected' | 'video_call_ended';
  }) {
    console.log('Creating video call notification:', videoCallData);
    
    const notificationData = {
      patientId: videoCallData.patientId,
      doctorId: videoCallData.doctorId,
      recipientType: 'Doctor' as const,
      senderPatientId: videoCallData.patientId,
      senderType: 'Patient' as const,
      title: this.getVideoCallTitle(videoCallData.type, videoCallData.patientName),
      message: this.getVideoCallMessage(videoCallData.type, videoCallData.patientName, videoCallData.doctorName),
      type: videoCallData.type,
      priority: 'High' as const,
      ...(videoCallData.appointmentId && {
        relatedEntity: {
          entityType: 'Appointment' as const,
          entityId: videoCallData.appointmentId,
        }
      }),
      actionUrl: videoCallData.type === 'video_call_request' ? '/video-consultation' : undefined,
      actionText: videoCallData.type === 'video_call_request' ? 'Join Video Call' : undefined,
      metadata: {
        callId: videoCallData.callId,
        appointmentId: videoCallData.appointmentId,
        patientName: videoCallData.patientName,
        doctorName: videoCallData.doctorName,
      },
    };

    return await this.notificationsService.createNotification(notificationData);
  }

  private getVideoCallTitle(type: string, patientName: string): string {
    switch (type) {
      case 'video_call_request':
        return `📹 Video Call Request from ${patientName}`;
      case 'video_call_accepted':
        return `✅ Video Call Accepted`;
      case 'video_call_rejected':
        return `❌ Video Call Declined`;
      case 'video_call_ended':
        return `📞 Video Call Ended`;
      default:
        return `📱 Video Call Update`;
    }
  }

  private getVideoCallMessage(type: string, patientName: string, doctorName: string): string {
    switch (type) {
      case 'video_call_request':
        return `${patientName} is requesting a video consultation with you. Tap to join the call.`;
      case 'video_call_accepted':
        return `Dr. ${doctorName} has accepted your video call request. You can now join the consultation.`;
      case 'video_call_rejected':
        return `Dr. ${doctorName} is currently unavailable. Please try again later or schedule an appointment.`;
      case 'video_call_ended':
        return `Your video consultation with ${type.includes('request') ? doctorName : patientName} has ended.`;
      default:
        return `Video call status updated.`;
    }
  }
}
