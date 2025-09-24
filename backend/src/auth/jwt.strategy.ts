import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export interface JwtPayload {
  email: string;
  userid: string;
  fullname: string;
  userType: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log('🔍 JWT Strategy: Extracting token from request...');
          console.log('   Request cookies:', request?.cookies);
          console.log('   Token found:', !!request?.cookies?.token);
          
          const token = request?.cookies?.token;
          if (token) {
            console.log('   Token preview:', token.substring(0, 50) + '...');
          }
          
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'Sayantan', // Use environment variable in production
    });
  }

  async validate(payload: JwtPayload) {
    console.log('🔍 JWT Strategy: Validating payload...');
    console.log('   Payload:', payload);
    
    const validatedUser = { 
      userId: payload.userid, 
      email: payload.email,
      fullname: payload.fullname,
      userType: payload.userType 
    };
    
    console.log('   Validated user:', validatedUser);
    console.log('✅ JWT validation successful');
    
    return validatedUser;
  }
}
