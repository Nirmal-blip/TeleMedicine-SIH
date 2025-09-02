import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  @Get('*')
  @UseGuards(JwtAuthGuard)
  serveApp(@Req() req: Request, @Res() res: Response): void {
    // Only serve the app for non-API routes
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
    } else {
      res.status(404).json({ message: 'Not Found' });
    }
  }
}
