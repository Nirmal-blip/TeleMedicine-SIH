import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatHistoryDocument = ChatHistory & Document;

@Schema()
export class ChatMessage {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, enum: ['user', 'bot'] })
  sender: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class ChatHistory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Patient' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: '' })
  title: string; // Auto-generated from first message

  createdAt: Date;
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
