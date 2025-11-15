'use client'

import { useEffect, useState } from 'react'
import { MapContainer } from './MapContainer'
import { Location } from '@/types'
import { useDeliveryStore } from '@/store/delivery.store'
import wsService from '@/lib/websocket'

interface LiveTrackingMapProps {
  deliveryId: string
  pickupLocation: Location
  deliveryLocation: Location
}

export function LiveTrackingMap({
  deliveryId,
  pickupLocation,
  deliveryLocation,
}: LiveTrackingMapProps) {
  const { courierLocation, updateCourierLocation } = useDeliveryStore()
  const [center, setCenter] = useState<Location>(pickupLocation)

  useEffect(() => {
    // Subscribe to delivery updates
    wsService.subscribeToDelivery(deliveryId)

    // Listen for courier location updates
    wsService.onLocationUpdate((data) => {
      if (data.data.deliveryId === deliveryId && data.data.location) {
        updateCourierLocation(data.data.location)
        setCenter(data.data.location)
      }
    })

    return () => {
      wsService.unsubscribeFromDelivery(deliveryId)
    }
  }, [deliveryId, updateCourierLocation])

  const markers = [
    {
      position: pickupLocation,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      title: 'Pickup Location',
    },
    {
      position: deliveryLocation,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      title: 'Delivery Location',
    },
  ]

  if (courierLocation) {
    markers.push({
      position: courierLocation,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      title: 'Courier Location',
    })
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      markers={markers}
      showDirections={!!courierLocation}
      origin={courierLocation || pickupLocation}
      destination={deliveryLocation}
      className="h-[500px] w-full rounded-lg"
    />
  )
}
