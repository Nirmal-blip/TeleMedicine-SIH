import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeederService } from './seeder.service';

@ApiTags('Database')
@Controller('api/database')
export class DatabaseController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with sample data' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully' })
  async seedDatabase() {
    return await this.seederService.seedDatabase();
  }

  @Post('migrate-patient-ids')
  @ApiOperation({ summary: 'Migrate existing patients to have patientId' })
  @ApiResponse({ status: 201, description: 'Patient IDs migrated successfully' })
  async migratePatientIds() {
    await this.seederService.migratePatientIds();
    return { message: 'Patient IDs migration completed successfully' };
  }

  @Post('migrate-doctor-ids')
  @ApiOperation({ summary: 'Migrate existing doctors to have doctorId' })
  @ApiResponse({ status: 201, description: 'Doctor IDs migrated successfully' })
  async migrateDoctorIds() {
    await this.seederService.migrateDoctorIds();
    return { message: 'Doctor IDs migration completed successfully' };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get database data summary' })
  @ApiResponse({ status: 200, description: 'Database summary retrieved' })
  async getDataSummary() {
    return await this.seederService.getDataSummary();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all data from database' })
  @ApiResponse({ status: 200, description: 'All data retrieved' })
  async getAllData() {
    return await this.seederService.getAllData();
  }
}
