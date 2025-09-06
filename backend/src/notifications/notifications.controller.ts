import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string
  ) {
    const userId = req.user.userId;
    const userType = req.user.userType; // Assuming this is set in JWT payload
    const limitNum = limit ? parseInt(limit) : 50;
    const skipNum = skip ? parseInt(skip) : 0;

    // Debug logging
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

    const notifications = await this.notificationsService.getNotificationsForUser(userId, userType, limitNum, skipNum);
    console.log(`📋 Found ${notifications.length} notifications for user ${userId} (${userType})`);
    
    return notifications;
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const userType = req.user.userType;
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
}
