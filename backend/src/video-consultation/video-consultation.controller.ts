import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VideoConsultationService, CallSession } from './video-consultation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Video Consultation')
@Controller('api/video-consultation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VideoConsultationController {
  constructor(private readonly videoConsultationService: VideoConsultationService) {}

  @Get('upcoming-appointments')
  @ApiOperation({ summary: 'Get upcoming appointments available for video consultation' })
  @ApiResponse({ status: 200, description: 'List of upcoming appointments' })
  async getUpcomingAppointments(@Request() req) {
    const userId = req.user.userId;
    const userType = req.user.userType;
    
    return this.videoConsultationService.getUpcomingAppointmentsForCall(userId, userType);
  }

  @Get('active-calls')
  @ApiOperation({ summary: 'Get active video calls for the current user' })
  @ApiResponse({ status: 200, description: 'List of active calls' })
  async getActiveCalls(@Request() req): Promise<CallSession[]> {
    const userId = req.user.userId;
    return this.videoConsultationService.getActiveCallsForUser(userId);
  }

  @Get('call-history')
  @ApiOperation({ summary: 'Get video consultation history' })
  @ApiResponse({ status: 200, description: 'List of completed video consultations' })
  async getCallHistory(@Request() req) {
    const userId = req.user.userId;
    const userType = req.user.userType;
    
    return this.videoConsultationService.getCallHistory(userId, userType);
  }

  @Get('call/:callId')
  @ApiOperation({ summary: 'Get call session details' })
  @ApiResponse({ status: 200, description: 'Call session details' })
  async getCallSession(@Param('callId') callId: string): Promise<CallSession | { error: string }> {
    const callSession = await this.videoConsultationService.getCallSession(callId);
    
    if (!callSession) {
      return { error: 'Call session not found' };
    }
    
    return callSession;
  }

  @Post('start-call')
  @ApiOperation({ summary: 'Start a video consultation call' })
  @ApiResponse({ status: 200, description: 'Call started successfully' })
  async startCall(
    @Body() body: { appointmentId: string; patientId: string },
    @Request() req
  ) {
    const doctorId = req.user.userId;
    
    if (req.user.userType !== 'doctor') {
      return { error: 'Only doctors can start calls', statusCode: HttpStatus.FORBIDDEN };
    }

    try {
      const callId = await this.videoConsultationService.createCallSession(
        body.appointmentId,
        doctorId,
        body.patientId
      );

      return { 
        success: true, 
        callId,
        message: 'Call started successfully'
      };
    } catch (error) {
      return { 
        error: error.message, 
        statusCode: HttpStatus.BAD_REQUEST 
      };
    }
  }

  @Put('end-call/:callId')
  @ApiOperation({ summary: 'End a video consultation call' })
  @ApiResponse({ status: 200, description: 'Call ended successfully' })
  async endCall(@Param('callId') callId: string, @Request() req) {
    const userId = req.user.userId;

    try {
      await this.videoConsultationService.endCallSession(callId, userId);
      
      return { 
        success: true, 
        message: 'Call ended successfully' 
      };
    } catch (error) {
      return { 
        error: error.message, 
        statusCode: HttpStatus.BAD_REQUEST 
      };
    }
  }

  @Put('appointment/:appointmentId/call-status')
  @ApiOperation({ summary: 'Update appointment call status' })
  @ApiResponse({ status: 200, description: 'Appointment call status updated' })
  async updateAppointmentCallStatus(
    @Param('appointmentId') appointmentId: string,
    @Body() body: { status: string; callData?: any },
    @Request() req
  ) {
    try {
      await this.videoConsultationService.updateAppointmentCallStatus(
        appointmentId,
        body.status,
        body.callData
      );

      return { 
        success: true, 
        message: 'Appointment call status updated' 
      };
    } catch (error) {
      return { 
        error: error.message, 
        statusCode: HttpStatus.BAD_REQUEST 
      };
    }
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Test video consultation service connection' })
  @ApiResponse({ status: 200, description: 'Service is working' })
  async testConnection() {
    return {
      success: true,
      message: 'Video consultation service is working',
      timestamp: new Date().toISOString()
    };
  }
}
