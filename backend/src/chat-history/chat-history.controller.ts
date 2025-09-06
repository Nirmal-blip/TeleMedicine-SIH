import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ChatHistoryService } from './chat-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Chat History')
@Controller('api/chat-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('token')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Post('session')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Chat session created successfully' })
  async createSession(@Request() req) {
    const userId = req.user.userId;
    return this.chatHistoryService.createChatSession(userId);
  }

  @Post('session/:sessionId/message')
  @ApiOperation({ summary: 'Add a message to chat session' })
  @ApiResponse({ status: 201, description: 'Message added successfully' })
  async addMessage(
    @Param('sessionId') sessionId: string,
    @Body() body: { text: string; sender: 'user' | 'bot' },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.chatHistoryService.addMessage(
      sessionId,
      body.text,
      body.sender,
      userId,
    );
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for user' })
  @ApiResponse({ status: 200, description: 'Chat sessions retrieved successfully' })
  async getAllSessions(@Request() req) {
    const userId = req.user.userId;
    return this.chatHistoryService.getAllChatSessions(userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get specific chat session' })
  @ApiResponse({ status: 200, description: 'Chat session retrieved successfully' })
  async getSession(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.chatHistoryService.getChatSession(sessionId, userId);
  }

  @Put('session/:sessionId/title')
  @ApiOperation({ summary: 'Update chat session title' })
  @ApiResponse({ status: 200, description: 'Chat title updated successfully' })
  async updateTitle(
    @Param('sessionId') sessionId: string,
    @Body() body: { title: string },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.chatHistoryService.updateChatTitle(sessionId, userId, body.title);
  }

  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete chat session' })
  @ApiResponse({ status: 204, description: 'Chat session deleted successfully' })
  async deleteSession(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user.userId;
    await this.chatHistoryService.deleteChatSession(sessionId, userId);
  }
}
