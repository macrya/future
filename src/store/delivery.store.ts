import { create } from 'zustand'
import { Delivery, Location } from '@/types'

interface DeliveryState {
  currentDelivery: Delivery | null
  deliveries: Delivery[]
  isTracking: boolean
  courierLocation: Location | null
  setCurrentDelivery: (delivery: Delivery | null) => void
  updateDeliveryStatus: (deliveryId: string, status: string) => void
  updateCourierLocation: (location: Location) => void
  setDeliveries: (deliveries: Delivery[]) => void
  addDelivery: (delivery: Delivery) => void
  removeDelivery: (deliveryId: string) => void
  startTracking: () => void
  stopTracking: () => void
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  currentDelivery: null,
  deliveries: [],
  isTracking: false,
  courierLocation: null,

  setCurrentDelivery: (delivery) => {
    set({ currentDelivery: delivery })
  },

  updateDeliveryStatus: (deliveryId, status) => {
    set((state) => ({
      deliveries: state.deliveries.map((d) =>
        d.id === deliveryId ? { ...d, status: status as any } : d
      ),
      currentDelivery:
        state.currentDelivery?.id === deliveryId
          ? { ...state.currentDelivery, status: status as any }
          : state.currentDelivery,
    }))
  },

  updateCourierLocation: (location) => {
    set({ courierLocation: location })
  },

  setDeliveries: (deliveries) => {
    set({ deliveries })
  },

  addDelivery: (delivery) => {
    set((state) => ({
      deliveries: [delivery, ...state.deliveries],
    }))
  },

  removeDelivery: (deliveryId) => {
    set((state) => ({
      deliveries: state.deliveries.filter((d) => d.id !== deliveryId),
    }))
  },

  startTracking: () => {
    set({ isTracking: true })
  },

  stopTracking: () => {
    set({ isTracking: false, courierLocation: null })
  },
}))
