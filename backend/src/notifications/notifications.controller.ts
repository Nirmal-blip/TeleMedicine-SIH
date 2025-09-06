import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

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
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      const notifications = await this.notificationsService.getNotificationsForUser(
        userId,
        userType,
        limit || 50,
        skip || 0
      );

      return notifications;
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
    }
  }

  @Post('mark-read/:notificationId')
  @Patch(':notificationId/read')
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

  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      await this.notificationsService.markAllAsRead(userId, userType);

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      };
    }
  }

  @Delete(':notificationId')
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.userId;
      
      await this.notificationsService.deleteNotification(notificationId, userId);

      return {
        success: true,
        message: 'Notification deleted',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      };
    }
  }
}
