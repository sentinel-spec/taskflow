/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RedisService } from '@/common/redis/redis.service';
import { SocketGateway } from '@/common/socket/socket.gateway';
import { MailService } from '@/mail/mail.service';
import { UserResponseDto } from '@/user/dto/user-response.dto';
import { UserService } from '@/user/user.service';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async checkEmail(email: string) {
    try {
      const user = await this.userService.findOneByEmail(email);
      return {
        exists: !!user,
        email,
      };
    } catch (error) {
      this.logger.error(
        `checkEmail failed for ${email}: ${(error as Error).message}`,
      );

      // Fail-safe response to keep auth flow usable when dependent services are degraded.
      return {
        exists: false,
        email,
      };
    }
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    // Trigger background welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.firstName || '');

    // Notify all users about new registration (Real-time)
    this.socketGateway.server.emit('new_user', {
      firstName: user.firstName,
      createdAt: user.createdAt,
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: { sub: string; email: string; roles: string[] } =
        this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

      const prefix = this.configService.get<string>(
        'REDIS_REFRESH_TOKEN_PREFIX',
      );
      const storedToken = await this.redisService.get(
        `${prefix}:${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userService.findOne(Number(payload.sub));
      return this.generateTokens(user);
    } catch {
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
    const prefix = this.configService.get<string>(
      'REDIS_RECOVERY_TOKEN_PREFIX',
    );
    const ttl = parseInt(
      this.configService.get<string>('RECOVERY_TOKEN_TTL') || '900',
    );

    await this.redisService.set(
      `${prefix}:${recoveryToken}`,
      user.id.toString(),
      ttl,
    );

    // Trigger background email
    await this.mailService.sendPasswordRecoveryEmail(user.email, recoveryToken);

    return { message: 'Recovery email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const prefix = this.configService.get<string>(
      'REDIS_RECOVERY_TOKEN_PREFIX',
    );
    const userId = await this.redisService.get(`${prefix}:${token}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired recovery token');
    }

    await this.userService.update(parseInt(userId), { password: newPassword });
    await this.redisService.del(`${prefix}:${token}`);

    return { message: 'Password reset successfully' };
  }

  private generateTokens(user: { id: number; email: string; roles: string[] }) {
    const payload = {
      email: user.email,
      sub: user.id.toString(),
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN');
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: expiresIn as any,
    });

    // Store refresh token in Redis (non-blocking)
    const prefix = this.configService.get<string>(
      'REDIS_REFRESH_TOKEN_PREFIX',
      'refresh_token',
    );
    const ttl = parseInt(
      this.configService.get<string>('JWT_REFRESH_TTL') || '604800',
    );

    // Don't wait for Redis and don't fail if Redis is unavailable
    this.redisService
      .set(`${prefix}:${user.id}`, refreshToken, ttl)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to store refresh token in Redis: ${message}`);
      });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }
}
