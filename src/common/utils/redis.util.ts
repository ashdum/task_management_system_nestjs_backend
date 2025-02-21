// src/common/utils/redis.util.ts
import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisUtil {
private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect();
  }

  // Store token in Redis with expiration time
  async setToken(key: string, value: string, expiresIn: number): Promise<void> {
    await this.client.set(key, value, { EX: expiresIn });
  }

  // Get token from Redis
  async getToken(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Delete token from Redis
  async deleteToken(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Check if token exists in Redis
  async tokenExists(key: string): Promise<boolean> {
    const token = await this.getToken(key);
    return !!token;
  }
}