import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import Database from './utils/database';
import { redisService } from './utils/redis';
import { initializeSocketServer } from './socket';

const startServer = async () => {
  try {
    // Connect to database
    await Database.connect();
    logger.info('✓ Database connected');

    // Connect to Redis
    await redisService.connect();
    logger.info('✓ Redis connected');

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const socketServer = initializeSocketServer(server);
    logger.info('✓ Socket.IO initialized');

    // Start server
    server.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚚 Delivery Tracking System                        ║
║                                                       ║
║   Environment: ${config.env.padEnd(38)}║
║   Port: ${config.port.toString().padEnd(44)}║
║   API URL: ${config.apiUrl.padEnd(42)}║
║                                                       ║
║   ✓ Database connected                               ║
║   ✓ Redis connected                                  ║
║   ✓ Socket.IO ready                                  ║
║                                                       ║
║   Features:                                          ║
║   • Real-time tracking with Socket.IO                ║
║   • M-Pesa & Card payments                          ║
║   • Google Maps integration                         ║
║   • Uber-like driver matching                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await Database.disconnect();
        logger.info('Database disconnected');

        await redisService.disconnect();
        logger.info('Redis disconnected');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      throw reason;
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
