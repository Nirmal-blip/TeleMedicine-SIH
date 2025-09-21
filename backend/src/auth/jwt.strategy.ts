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
          return request?.cookies?.token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'Sayantan', // In production, use environment variable
    });
  }

  async validate(payload: JwtPayload) {
    return { 
      userId: payload.userid, 
      email: payload.email,
      fullname: payload.fullname,
      userType: payload.userType 
    };
  }
}
