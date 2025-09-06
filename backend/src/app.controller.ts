import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  // Remove the catch-all route to prevent interference with API routes
}
