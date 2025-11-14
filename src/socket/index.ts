import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { driverService } from '../services/driver.service';
import { logger } from '../utils/logger';
import { config } from '../config';

interface AuthenticatedSocket {
  userId: string;
  role: string;
  socketId: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId
const connectedDrivers = new Map<string, string>(); // driverId -> socketId

export const initializeSocketServer = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).userRole = payload.role;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;

    logger.info(`User connected: ${userId} (${userRole})`);
    connectedUsers.set(userId, socket.id);

    // Driver-specific connection
    if (userRole === 'DRIVER') {
      socket.on('driver:register', (data: { driverId: string }) => {
        connectedDrivers.set(data.driverId, socket.id);
        logger.info(`Driver registered: ${data.driverId}`);

        // Set driver status to online
        driverService.updateDriverStatus(data.driverId, 'ONLINE');
      });

      // Handle driver location updates
      socket.on('driver:location', async (data: {
        driverId: string;
        latitude: number;
        longitude: number;
      }) => {
        try {
          await driverService.updateDriverLocation({
            driverId: data.driverId,
            latitude: data.latitude,
            longitude: data.longitude,
          });

          // Broadcast to customers tracking this driver
          socket.broadcast.emit('driver:location:update', {
            driverId: data.driverId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: Date.now(),
          });
        } catch (error) {
          logger.error(`Error updating driver location: ${error}`);
        }
      });

      // Handle driver status changes
      socket.on('driver:status', async (data: {
        driverId: string;
        status: 'ONLINE' | 'OFFLINE' | 'BUSY';
      }) => {
        try {
          await driverService.updateDriverStatus(data.driverId, data.status);
          socket.emit('driver:status:updated', { status: data.status });
        } catch (error) {
          logger.error(`Error updating driver status: ${error}`);
        }
      });

      // Handle delivery response (accept/reject)
      socket.on('delivery:response', (data: {
        deliveryId: string;
        driverId: string;
        accepted: boolean;
      }) => {
        logger.info(
          `Driver ${data.driverId} ${data.accepted ? 'accepted' : 'rejected'} delivery ${data.deliveryId}`
        );

        // Notify customer
        io.emit('delivery:driver:response', {
          deliveryId: data.deliveryId,
          accepted: data.accepted,
        });
      });
    }

    // Customer-specific events
    if (userRole === 'CUSTOMER') {
      // Subscribe to delivery updates
      socket.on('delivery:track', (data: { deliveryId: string }) => {
        socket.join(`delivery:${data.deliveryId}`);
        logger.info(`Customer tracking delivery: ${data.deliveryId}`);
      });

      socket.on('delivery:untrack', (data: { deliveryId: string }) => {
        socket.leave(`delivery:${data.deliveryId}`);
      });
    }

    // Common events for all users
    socket.on('message:send', (data: {
      recipientId: string;
      message: string;
    }) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:receive', {
          senderId: userId,
          message: data.message,
          timestamp: Date.now(),
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);
      connectedUsers.delete(userId);

      // If driver, update status
      if (userRole === 'DRIVER') {
        for (const [driverId, socketId] of connectedDrivers.entries()) {
          if (socketId === socket.id) {
            connectedDrivers.delete(driverId);
            try {
              await driverService.updateDriverStatus(driverId, 'OFFLINE');
            } catch (error) {
              logger.error(`Error updating driver status on disconnect: ${error}`);
            }
            break;
          }
        }
      }
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Helper function to emit to specific user
  const emitToUser = (userId: string, event: string, data: any) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  // Helper function to emit to delivery room
  const emitToDelivery = (deliveryId: string, event: string, data: any) => {
    io.to(`delivery:${deliveryId}`).emit(event, data);
  };

  // Helper function to broadcast delivery updates
  const broadcastDeliveryUpdate = (deliveryId: string, data: any) => {
    io.to(`delivery:${deliveryId}`).emit('delivery:update', {
      deliveryId,
      ...data,
      timestamp: Date.now(),
    });
  };

  logger.info('Socket.IO server initialized');

  return {
    io,
    emitToUser,
    emitToDelivery,
    broadcastDeliveryUpdate,
  };
};
