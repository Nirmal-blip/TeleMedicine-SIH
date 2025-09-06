import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiQuery,
  ApiBearerAuth,
  ApiCookieAuth 
} from '@nestjs/swagger';
import { AiMlService } from './ai-ml.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI/ML')
@Controller('api/ai')
export class AiMlController {
  constructor(private readonly aiMlService: AiMlService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check AI/ML services health status' })
  @ApiResponse({ status: 200, description: 'Health status of all AI/ML services' })
  @ApiResponse({ status: 503, description: 'AI/ML services unavailable' })
  async getHealthStatus() {
    return this.aiMlService.getHealthStatus();
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with AI medical assistant' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        input: { type: 'string', description: 'User message to the chatbot' },
        sessionId: { type: 'string', description: 'Chat session ID for history tracking' }
      },
      required: ['input']
    } 
  })
  @ApiResponse({ status: 200, description: 'AI response with medical recommendations' })
  @ApiResponse({ status: 503, description: 'Chatbot service unavailable' })
  async chat(@Body() body: { input: string; sessionId?: string }, @Request() req) {
    // Extract userId if user is authenticated, otherwise null
    const userId = req.user?.userId || null;
    return this.aiMlService.getChatResponse(body.input, userId, body.sessionId);
  }

  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Streaming chat with AI medical assistant' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        input: { type: 'string', description: 'User message to the chatbot' },
        sessionId: { type: 'string', description: 'Chat session ID for history tracking' }
      },
      required: ['input']
    } 
  })
  @ApiResponse({ status: 200, description: 'Streaming AI response with medical recommendations' })
  @ApiResponse({ status: 503, description: 'Chatbot service unavailable' })
  async chatStream(@Body() body: { input: string; sessionId?: string }, @Request() req) {
    // Extract userId if user is authenticated, otherwise null
    const userId = req.user?.userId || null;
    return this.aiMlService.getChatStreamResponse(body.input, userId, body.sessionId);
  }

  @Post('chat/save-response')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('token')
  @ApiOperation({ summary: 'Save bot response to chat history after streaming' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        sessionId: { type: 'string', description: 'Chat session ID' },
        botResponse: { type: 'string', description: 'Complete bot response to save' }
      },
      required: ['sessionId', 'botResponse']
    } 
  })
  @ApiResponse({ status: 200, description: 'Bot response saved successfully' })
  async saveBotResponse(@Body() body: { sessionId: string; botResponse: string }, @Request() req) {
    const userId = req.user.userId;
    await this.aiMlService.saveBotResponse(body.sessionId, body.botResponse, userId);
    return { message: 'Bot response saved successfully' };
  }

  @Post('voice-chat')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('token')
  async voiceChat() {
    return this.aiMlService.getVoiceChatResponse();
  }

  @Post('medicine/recommend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get medicine recommendations and alternatives' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        medicine_name: { type: 'string', description: 'Name of the medicine to find alternatives for' } 
      },
      required: ['medicine_name']
    } 
  })
  @ApiResponse({ status: 200, description: 'List of alternative medicines with details' })
  @ApiResponse({ status: 404, description: 'No alternatives found' })
  @ApiResponse({ status: 503, description: 'Medicine recommendation service unavailable' })
  async recommendMedicine(@Body('medicine_name') medicineName: string) {
    return this.aiMlService.getMedicineRecommendations(medicineName);
  }

  @Get('hospitals')
  @ApiOperation({ summary: 'Find nearby hospitals based on location' })
  @ApiQuery({ name: 'lat', type: 'number', description: 'Latitude coordinate' })
  @ApiQuery({ name: 'lon', type: 'number', description: 'Longitude coordinate' })
  @ApiResponse({ status: 200, description: 'List of nearby hospitals with directions' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 503, description: 'Hospital maps service unavailable' })
  async getNearbyHospitals(
    @Query('lat') lat: number,
    @Query('lon') lon: number
  ) {
    return this.aiMlService.getNearbyHospitals(lat, lon);
  }
}
