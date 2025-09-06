import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideoCallNotificationsService } from './video-call-notifications.service';

@Controller('api/video-call-notifications')
@UseGuards(JwtAuthGuard)
export class VideoCallNotificationsController {
  constructor(
    private readonly videoCallNotificationsService: VideoCallNotificationsService,
  ) {}

  @Post('request-call')
  async requestVideoCall(
    @Body() data: {
      doctorId: string;
      patientName: string;
      specialization: string;
      callId: string;
      appointmentId?: string;
    },
    @Req() req: any,
  ) {
    try {
      const patientId = req.user.userId;
      
      const notification = await this.videoCallNotificationsService.createVideoCallRequestNotification({
        doctorId: data.doctorId,
        patientId,
        patientName: data.patientName,
        specialization: data.specialization,
        callId: data.callId,
        appointmentId: data.appointmentId,
      });

      return {
        success: true,
        message: 'Video call request sent successfully',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send video call request',
        error: error.message,
      };
    }
  }

  @Post('accept-call')
  async acceptVideoCall(
    @Body() data: {
      patientId: string;
      callId: string;
    },
    @Req() req: any,
  ) {
    try {
      const doctorId = req.user.userId;
      
      const notification = await this.videoCallNotificationsService.createCallAcceptedNotification({
        patientId: data.patientId,
        doctorId,
        callId: data.callId,
      });

      return {
        success: true,
        message: 'Video call accepted successfully',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to accept video call',
        error: error.message,
      };
    }
  }

  @Post('reject-call')
  async rejectVideoCall(
    @Body() data: {
      patientId: string;
      callId: string;
      reason?: string;
    },
    @Req() req: any,
  ) {
    try {
      const doctorId = req.user.userId;
      
      const notification = await this.videoCallNotificationsService.createCallRejectedNotification({
        patientId: data.patientId,
        doctorId,
        callId: data.callId,
        reason: data.reason,
      });

      return {
        success: true,
        message: 'Video call rejected successfully',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reject video call',
        error: error.message,
      };
    }
  }

  @Get('my-notifications')
  async getMyVideoCallNotifications(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      const notifications = await this.videoCallNotificationsService.getVideoCallNotifications(
        userId,
        userType
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

  @Post('mark-read/:notificationId')
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @Req() req: any,
  ) {
    try {
      const notification = await this.videoCallNotificationsService.markNotificationAsRead(
        notificationId
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
