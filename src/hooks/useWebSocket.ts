import { useEffect } from 'react'
import wsService from '@/lib/websocket'
import { useAuthStore } from '@/store/auth.store'

export function useWebSocket() {
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      wsService.connect(token)

      return () => {
        // Don't disconnect on unmount as it's used across the app
        // wsService.disconnect()
      }
    }
  }, [token])

  return wsService
}
