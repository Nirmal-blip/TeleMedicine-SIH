import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatHistoryService } from '../chat-history/chat-history.service';

@Injectable()
export class AiMlService {
  // Disabled: Flask is called directly from frontend now
  private readonly flaskBaseUrl = 'http://localhost:8000';

  constructor(
    private readonly httpService: HttpService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  async getChatResponse(input: string, userId?: string, sessionId?: string) {
    throw new HttpException('AI/ML service disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }

  async getChatStreamResponse(input: string, userId?: string, sessionId?: string) {
    throw new HttpException('AI/ML stream disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }

  // New method to save bot response after streaming is complete
  async saveBotResponse(sessionId: string, botResponse: string, userId: string) {
    try {
      await this.chatHistoryService.addMessage(sessionId, botResponse, 'bot', userId);
    } catch (error) {
      console.warn('Failed to save bot response to chat history:', error.message);
    }
  }

  async getVoiceChatResponse() {
    throw new HttpException('Voice chat disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }

  async getMedicineRecommendations(medicineName: string) {
    throw new HttpException('Medicine recommendations disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }

  async getNearbyHospitals(lat: number, lon: number) {
    throw new HttpException('Hospital maps disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }

  async getHealthStatus() {
    throw new HttpException('AI/ML health disabled in backend', HttpStatus.NOT_IMPLEMENTED);
  }
}
