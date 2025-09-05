import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatHistoryService } from '../chat-history/chat-history.service';

@Injectable()
export class AiMlService {
  private readonly flaskBaseUrl = 'http://localhost:8000';

  constructor(
    private readonly httpService: HttpService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  async getChatResponse(input: string, userId?: string, sessionId?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.flaskBaseUrl}/api/chat`, { input })
      );
      
      // Save to chat history if user is authenticated and sessionId provided
      if (userId && sessionId) {
        try {
          // Save user message
          await this.chatHistoryService.addMessage(sessionId, input, 'user', userId);
          // Save bot response
          await this.chatHistoryService.addMessage(sessionId, response.data.response, 'bot', userId);
        } catch (error) {
          console.warn('Failed to save chat history:', error.message);
          console.warn('Chat will continue without history saving');
          // Don't fail the request if chat history save fails
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Chat service error:', error.message);
      
      // If it's an axios error, log more details
      if (error.response) {
        console.error('Flask response status:', error.response.status);
        console.error('Flask response data:', error.response.data);
      }
      
      throw new HttpException(
        'Chatbot service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getChatStreamResponse(input: string, userId?: string, sessionId?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.flaskBaseUrl}/api/chat/stream`, { input }, {
          responseType: 'stream'
        })
      );
      
      // Save user message to chat history if user is authenticated and sessionId provided
      if (userId && sessionId) {
        try {
          await this.chatHistoryService.addMessage(sessionId, input, 'user', userId);
        } catch (error) {
          console.warn('Failed to save user message to chat history:', error.message);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Chat stream service error:', error.message);
      
      // If it's an axios error, log more details
      if (error.response) {
        console.error('Flask response status:', error.response.status);
        console.error('Flask response data:', error.response.data);
      }
      
      throw new HttpException(
        'Chatbot streaming service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getVoiceChatResponse() {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.flaskBaseUrl}/api/voice-chat`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Voice chat service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getMedicineRecommendations(medicineName: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.flaskBaseUrl}/api/medicine/recommend`, {
          medicine_name: medicineName
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Medicine recommendation service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getNearbyHospitals(lat: number, lon: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.flaskBaseUrl}/api/hospitals`, {
          params: { lat, lon }
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Hospital maps service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getHealthStatus() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.flaskBaseUrl}/health`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'AI/ML services unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
