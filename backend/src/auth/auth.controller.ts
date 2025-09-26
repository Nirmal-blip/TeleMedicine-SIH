import { Controller, Post, Body, Res, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(isProduction: boolean) {
    return {
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict' | 'lax',
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (patient or doctor)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    res.cookie('token', result.token, this.getCookieOptions(isProduction));
    
    return res.status(201).json({ message: result.message });
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    res.cookie('token', result.token, this.getCookieOptions(isProduction));
    
    return res.status(200).json({ 
      message: result.message, 
      userType: result.userType,
      token: result.token 
    });
  }

  @Get('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 302, description: 'Redirected to home page' })
  logout(@Res() res: Response) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    const cookieOptions = { 
      httpOnly: true, 
      expires: new Date(0),
      path: '/',
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict' | 'lax',
    };

    res.cookie('token', '', cookieOptions);
    return res.status(200).json({ message: 'Logged out successfully' });
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    return {
      user: {
        userId: req.user.userId,
        email: req.user.email,
        fullname: req.user.fullname,
        userType: req.user.userType,
      },
    };
  }
}
