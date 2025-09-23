import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload, IPayload } from 'src/interfaces/models.interface';

const bearerTokenExtractor = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth || Array.isArray(auth)) return null;
  const [scheme, token] = auth.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not configured');

    super({
      jwtFromRequest: bearerTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): IPayload {
    if (!payload?.sub || !payload?.userName) {
      throw new UnauthorizedException('Invalid JWT token');
    }
    return { userId: payload.sub, userName: payload.userName, role: payload.role };
  }
}
