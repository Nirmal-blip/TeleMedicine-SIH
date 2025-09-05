import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Get MongoDB URI from environment variable
        const mongoUri = configService.get<string>('MONGODB_URI') || 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
        
        console.log('Connecting to MongoDB...');
        console.log('Using URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Log URI without exposing credentials
        
        return {
          uri: mongoUri,
          dbName: 'TeleMedicine', // Specify the database name
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
