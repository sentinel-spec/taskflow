import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import { ApiTokenService } from '@/api-token/api-token.service';

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(Strategy, 'api-token') {
  constructor(private apiTokenService: ApiTokenService) {
    super();
  }

  async authenticate(req: Request) {
    const token = req.headers['x-api-token'] as string;

    if (!token) {
      return this.fail('No API token provided', 401);
    }

    try {
      const user = await this.apiTokenService.validateToken(token);
      if (!user) {
        return this.fail('Invalid API token', 401);
      }
      return this.success(user);
    } catch (error) {
      return this.error(error);
    }
  }

  // NestJS mixin requires this member, even if we override authenticate
  async validate(payload: any): Promise<any> {
    return payload;
  }
}
