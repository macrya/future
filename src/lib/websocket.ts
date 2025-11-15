import { io, Socket } from 'socket.io-client'
import { WebSocketMessage } from '@/types'

class WebSocketService {
  private socket: Socket | null = null
  private isConnected: boolean = false

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      this.isConnected = false
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected. Cannot emit event:', event)
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback)
  }

  // Specific event handlers for delivery system
  subscribeToDelivery(deliveryId: string): void {
    this.emit('subscribe_delivery', { deliveryId })
  }

  unsubscribeFromDelivery(deliveryId: string): void {
    this.emit('unsubscribe_delivery', { deliveryId })
  }

  updateCourierLocation(location: { lat: number; lng: number }): void {
    this.emit('courier_location_update', location)
  }

  onLocationUpdate(callback: (data: WebSocketMessage) => void): void {
    this.on('location_update', callback)
  }

  onStatusUpdate(callback: (data: WebSocketMessage) => void): void {
    this.on('status_update', callback)
  }

  onDeliveryUpdate(callback: (data: WebSocketMessage) => void): void {
    this.on('delivery_update', callback)
  }

  onCourierAssigned(callback: (data: WebSocketMessage) => void): void {
    this.on('courier_assigned', callback)
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const wsService = new WebSocketService()
export default wsService
