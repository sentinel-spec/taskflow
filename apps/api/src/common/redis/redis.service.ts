import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Max Redis connection retries reached');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Reconnecting to Redis...');
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping set for key: ${key}`);
      return;
    }
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set Redis key ${key}: ${(error as Error).message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping get for key: ${key}`);
      return null;
    }
    try {
      return this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get Redis key ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping del for key: ${key}`);
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete Redis key ${key}: ${(error as Error).message}`);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
