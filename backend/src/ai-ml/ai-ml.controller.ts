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

// Controller disabled: frontend calls Flask directly
@ApiTags('AI/ML (disabled)')
@Controller('api/ai')
export class AiMlController {
  constructor(private readonly aiMlService: AiMlService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check AI/ML services health status' })
  @ApiResponse({ status: 200, description: 'Health status of all AI/ML services' })
  @ApiResponse({ status: 503, description: 'AI/ML services unavailable' })
  async getHealthStatus() { return { disabled: true }; }

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
  async chat() { return { disabled: true }; }

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
  async chatStream() { return { disabled: true }; }

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
  async saveBotResponse() { return { disabled: true }; }

  @Post('voice-chat')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('token')
  async voiceChat() { return { disabled: true }; }

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
  async recommendMedicine() { return { disabled: true }; }

  @Get('hospitals')
  @ApiOperation({ summary: 'Find nearby hospitals based on location' })
  @ApiQuery({ name: 'lat', type: 'number', description: 'Latitude coordinate' })
  @ApiQuery({ name: 'lon', type: 'number', description: 'Longitude coordinate' })
  @ApiResponse({ status: 200, description: 'List of nearby hospitals with directions' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 503, description: 'Hospital maps service unavailable' })
  async getNearbyHospitals() { return { disabled: true }; }
}
