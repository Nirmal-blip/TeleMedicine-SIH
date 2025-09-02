import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiMlService {
  private readonly flaskBaseUrl = 'http://localhost:5000';

  constructor(private readonly httpService: HttpService) {}

  async getChatResponse(input: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.flaskBaseUrl}/api/chat`, { input })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Chatbot service unavailable',
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
