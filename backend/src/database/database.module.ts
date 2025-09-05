import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Get database password from environment variable
        const dbPassword = configService.get<string>('DB_PASSWORD') || 'telemedicine';
        
        // MongoDB Atlas connection string
        const mongoUri = `mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;
        
        console.log('Connecting to MongoDB Atlas...');
        
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
