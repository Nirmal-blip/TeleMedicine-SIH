import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideoCallService } from './video-call.service';

@Controller('api/video-call')
@UseGuards(JwtAuthGuard)
export class VideoCallController {
  constructor(
    private readonly videoCallService: VideoCallService,
  ) {}

  @Get('session/:callId')
  async getVideoCallSession(
    @Param('callId') callId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.userId;
      const session = this.videoCallService.getVideoCallSession(callId);
      
      if (!session) {
        return {
          success: false,
          message: 'Video call session not found'
        };
      }

      // Check if user is authorized to view this session
      const isAuthorized = session.doctorId === userId || session.patientId === userId;
      if (!isAuthorized) {
        return {
          success: false,
          message: 'Unauthorized to view this video call session'
        };
      }

      return {
        success: true,
        session: {
          callId: session.callId,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          participants: session.participants.map(p => ({
            userType: p.userType,
            joinTime: p.joinTime,
            leaveTime: p.leaveTime
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get video call session',
        error: error.message,
      };
    }
  }

  @Get('my-sessions')
  async getMySessions(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const sessions = this.videoCallService.getSessionsForUser(userId);

      return {
        success: true,
        sessions: sessions.map(session => ({
          callId: session.callId,
          doctorName: session.doctorName,
          patientName: session.patientName,
          specialization: session.specialization,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch video call sessions',
        error: error.message,
      };
    }
  }

  @Get('active-sessions')
  async getActiveSessions(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const userType = req.user.userType;
      
      // Only allow doctors and patients to see their own active sessions
      const allActiveSessions = this.videoCallService.getAllActiveSessions();
      const userActiveSessions = allActiveSessions.filter(session => 
        session.doctorId === userId || session.patientId === userId
      );

      return {
        success: true,
        activeSessions: userActiveSessions.map(session => ({
          callId: session.callId,
          status: session.status,
          participantCount: session.participants.filter(p => !p.leaveTime).length,
          startTime: session.startTime
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch active sessions',
        error: error.message,
      };
    }
  }

  @Post('end-session/:callId')
  async endVideoCallSession(
    @Param('callId') callId: string,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.userId;
      const session = this.videoCallService.getVideoCallSession(callId);
      
      if (!session) {
        return {
          success: false,
          message: 'Video call session not found'
        };
      }

      // Check if user is authorized to end this session
      const isAuthorized = session.doctorId === userId || session.patientId === userId;
      if (!isAuthorized) {
        return {
          success: false,
          message: 'Unauthorized to end this video call session'
        };
      }

      const success = this.videoCallService.endVideoCallSession(callId);
      
      return {
        success,
        message: success ? 'Video call session ended successfully' : 'Failed to end session'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to end video call session',
        error: error.message,
      };
    }
  }
}
