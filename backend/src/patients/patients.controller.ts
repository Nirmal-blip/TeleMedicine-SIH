import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('me')
  getCurrentPatient(@Request() req) {
    return this.patientsService.findOne(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch('me')
  updateCurrentPatient(@Request() req, @Body() updateData: any) {
    return this.patientsService.update(req.user.userId, updateData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.patientsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
