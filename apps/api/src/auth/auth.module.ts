/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@/user/user.module';
import { MailModule } from '@/mail/mail.module';
import { JwtStrategy } from './jwt.strategy';
import { ApiTokenStrategy } from './api-token.strategy';
import { ApiTokenModule } from '@/api-token/api-token.module';

@Module({
  imports: [
    UserModule,
    MailModule,
    ApiTokenModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN');
        return {
          secret: config.get<string>('JWT_SECRET')!,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
