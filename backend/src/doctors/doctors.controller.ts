import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(@Query('specialization') specialization?: string, @Query('search') search?: string) {
    if (search) {
      return this.doctorsService.searchDoctors(search);
    }
    if (specialization) {
      return this.doctorsService.findBySpecialization(specialization);
    }
    return this.doctorsService.findAll();
  }

  @Get('available')
  getAvailableDoctors() {
    return this.doctorsService.getAvailableDoctors();
  }

  @Get(':id/stats')
  getDoctorStats(@Param('id') id: string) {
    return this.doctorsService.getDoctorStats(id);
  }

  @Get('me')
  getCurrentDoctor(@Request() req) {
    return this.doctorsService.findOne(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch('me')
  updateCurrentDoctor(@Request() req, @Body() updateData: any) {
    return this.doctorsService.update(req.user.userId, updateData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.doctorsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
