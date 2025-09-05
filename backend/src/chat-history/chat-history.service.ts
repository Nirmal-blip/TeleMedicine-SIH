import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatHistory, ChatHistoryDocument, ChatMessage } from './chat-history.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectModel(ChatHistory.name) private chatHistoryModel: Model<ChatHistoryDocument>,
  ) {}

  async createChatSession(userId: string): Promise<ChatHistory> {
    const sessionId = uuidv4();
    const chatHistory = new this.chatHistoryModel({
      userId: new Types.ObjectId(userId),
      sessionId,
      messages: [],
      isActive: true,
      title: 'New Chat',
    });

    return chatHistory.save();
  }

  async addMessage(
    sessionId: string,
    text: string,
    sender: 'user' | 'bot',
    userId: string,
  ): Promise<ChatHistory> {
    const chatHistory = await this.chatHistoryModel.findOne({
      sessionId,
      userId: new Types.ObjectId(userId),
    });

    if (!chatHistory) {
      throw new NotFoundException('Chat session not found');
    }

    const message: ChatMessage = {
      messageId: uuidv4(),
      text,
      sender,
      timestamp: new Date(),
    };

    chatHistory.messages.push(message);

    // Auto-generate title from first user message
    if (chatHistory.messages.length === 1 && sender === 'user') {
      chatHistory.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
    }

    return chatHistory.save();
  }

  async getChatHistory(userId: string, sessionId?: string): Promise<ChatHistory[]> {
    const query: any = { 
      userId: new Types.ObjectId(userId),
      isActive: true 
    };
    
    if (sessionId) {
      query.sessionId = sessionId;
    }

    return this.chatHistoryModel
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(sessionId ? 1 : 20)
      .exec();
  }

  async getAllChatSessions(userId: string): Promise<ChatHistory[]> {
    return this.chatHistoryModel
      .find({ 
        userId: new Types.ObjectId(userId),
        isActive: true 
      })
      .select('sessionId title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.chatHistoryModel.updateOne(
      { 
        sessionId,
        userId: new Types.ObjectId(userId)
      },
      { isActive: false }
    );

    return result.modifiedCount > 0;
  }

  async getChatSession(sessionId: string, userId: string): Promise<ChatHistory> {
    const chatHistory = await this.chatHistoryModel.findOne({
      sessionId,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!chatHistory) {
      throw new NotFoundException('Chat session not found');
    }

    return chatHistory;
  }

  async updateChatTitle(sessionId: string, userId: string, title: string): Promise<ChatHistory> {
    const chatHistory = await this.chatHistoryModel.findOneAndUpdate(
      {
        sessionId,
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      { title },
      { new: true }
    );

    if (!chatHistory) {
      throw new NotFoundException('Chat session not found');
    }

    return chatHistory;
  }
}
