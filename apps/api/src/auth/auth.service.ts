import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '@/common/redis/redis.service';
import { MailService } from '@/mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '@/user/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    
    // Trigger background welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.firstName || '');
    
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const prefix = this.configService.get<string>('REDIS_REFRESH_TOKEN_PREFIX');
      const storedToken = await this.redisService.get(`${prefix}:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userService.findOne(payload.sub);
      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    const prefix = this.configService.get<string>('REDIS_REFRESH_TOKEN_PREFIX');
    await this.redisService.del(`${prefix}:${userId}`);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const recoveryToken = crypto.randomBytes(32).toString('hex');
    const prefix = this.configService.get<string>('REDIS_RECOVERY_TOKEN_PREFIX');
    const ttl = parseInt(this.configService.get<string>('RECOVERY_TOKEN_TTL') || '900');
    
    await this.redisService.set(`${prefix}:${recoveryToken}`, user.id.toString(), ttl);

    // Trigger background email
    await this.mailService.sendPasswordRecoveryEmail(user.email, recoveryToken);

    return { message: 'Recovery email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const prefix = this.configService.get<string>('REDIS_RECOVERY_TOKEN_PREFIX');
    const userId = await this.redisService.get(`${prefix}:${token}`);
    
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired recovery token');
    }

    await this.userService.update(parseInt(userId), { password: newPassword });
    await this.redisService.del(`${prefix}:${token}`);

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
    });

    const prefix = this.configService.get<string>('REDIS_REFRESH_TOKEN_PREFIX');
    const ttl = parseInt(this.configService.get<string>('JWT_REFRESH_TTL') || '604800');
    
    await this.redisService.set(`${prefix}:${user.id}`, refreshToken, ttl);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }
}
