import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto, UpdateMedicineDto, SearchMedicinesDto } from '../dto/medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pharmacist')
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() createMedicineDto: CreateMedicineDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Handle image uploads
    if (files && files.length > 0) {
      createMedicineDto.images = files.map(file => `/uploads/${file.filename}`);
    }

    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  async findAll(@Query() searchDto: SearchMedicinesDto) {
    return this.medicinesService.findAll(searchDto);
  }

  @Get('categories')
  async getCategories() {
    return this.medicinesService.getCategories();
  }

  @Get('featured')
  async getFeatured() {
    return this.medicinesService.getFeatured();
  }

  @Get('suggestions')
  async getSearchSuggestions(@Query('q') query: string) {
    return this.medicinesService.searchSuggestions(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pharmacist')
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Handle image uploads
    if (files && files.length > 0) {
      updateMedicineDto.images = files.map(file => `/uploads/${file.filename}`);
    }

    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pharmacist')
  async remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}
