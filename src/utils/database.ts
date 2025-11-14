import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class Database {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        Database.instance.$on('query' as never, (e: any) => {
          logger.debug(`Query: ${e.query}`);
        });
      }
    }

    return Database.instance;
  }

  static async connect(): Promise<void> {
    try {
      await Database.getInstance().$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error(`Database connection error: ${error}`);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    await Database.getInstance().$disconnect();
    logger.info('Database disconnected');
  }
}

export const prisma = Database.getInstance();
export default Database;
