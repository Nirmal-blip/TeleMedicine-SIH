import { Controller, Get, Post, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
<<<<<<< HEAD
import { NotificationsService } from './notifications.service';
=======
>>>>>>> da4678f9adbe56de278a80de09ef048b8f636ed2

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
<<<<<<< HEAD
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      const notifications = await this.notificationsService.getNotificationsForUser(
        userId,
        userType,
        limit || 50,
        skip || 0
      );

      return {
        success: true,
        notifications,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      };
    }
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      const count = await this.notificationsService.getUnreadCount(userId, userType);

      return {
        success: true,
        unreadCount: count,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message,
      };
=======
    const userId = req.user.userId;
    const userType = req.user.userType;
    const limitNum = limit ? parseInt(limit) : 50;
    const skipNum = skip ? parseInt(skip) : 0;

    console.log('🔍 Notifications Request:', {
      userId,
      userType,
      limit: limitNum,
      skip: skipNum,
      filters: { type, priority, search }
    });

    if (search) {
      return await this.notificationsService.searchNotifications(userId, userType, search);
    }
    if (type) {
      return await this.notificationsService.getNotificationsByType(userId, userType, type);
    }
    if (priority) {
      return await this.notificationsService.getNotificationsByPriority(userId, userType, priority);
    }

    // OPTION 1: Show ALL notifications (ACTIVE)
    const notifications = await this.notificationsService.getNotificationsForUser(userId, userType, limitNum, skipNum);
    console.log(`📋 Found ${notifications.length} notifications for user ${userId} (${userType})`);
    
    return notifications;
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Count ALL unread notifications
    const count = await this.notificationsService.getUnreadNotificationsCount(userId, userType);
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
>>>>>>> da4678f9adbe56de278a80de09ef048b8f636ed2
    }
  }

  @Post('mark-read/:notificationId')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.userId;
      
      const notification = await this.notificationsService.markAsRead(
        notificationId,
        userId
      );

      return {
        success: true,
        message: 'Notification marked as read',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      };
    }
  }
}
