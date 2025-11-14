import { createClient } from 'redis';
import { config } from '../config';
import { logger } from './logger';

class RedisService {
  private client;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: config.redis.url,
    });

    this.client.on('error', (err) => {
      logger.error(`Redis Client Error: ${err}`);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    if (expirationInSeconds) {
      await this.client.setEx(key, expirationInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async setObject(key: string, value: object, expirationInSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), expirationInSeconds);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  // For real-time driver locations
  async setDriverLocation(driverId: string, latitude: number, longitude: number): Promise<void> {
    await this.setObject(
      `driver:location:${driverId}`,
      { latitude, longitude, timestamp: Date.now() },
      3600 // 1 hour expiration
    );
  }

  async getDriverLocation(driverId: string): Promise<{ latitude: number; longitude: number; timestamp: number } | null> {
    return await this.getObject(`driver:location:${driverId}`);
  }

  // For active deliveries tracking
  async setActiveDelivery(deliveryId: string, data: object): Promise<void> {
    await this.setObject(`delivery:active:${deliveryId}`, data, 86400); // 24 hours
  }

  async getActiveDelivery(deliveryId: string): Promise<object | null> {
    return await this.getObject(`delivery:active:${deliveryId}`);
  }

  async deleteActiveDelivery(deliveryId: string): Promise<void> {
    await this.del(`delivery:active:${deliveryId}`);
  }

  // For online drivers tracking
  async addOnlineDriver(driverId: string): Promise<void> {
    await this.client.sAdd('drivers:online', driverId);
  }

  async removeOnlineDriver(driverId: string): Promise<void> {
    await this.client.sRem('drivers:online', driverId);
  }

  async getOnlineDrivers(): Promise<string[]> {
    return await this.client.sMembers('drivers:online');
  }

  async isDriverOnline(driverId: string): Promise<boolean> {
    return await this.client.sIsMember('drivers:online', driverId);
  }
}

export const redisService = new RedisService();
