'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { Location } from '@/types'
import { GOOGLE_MAPS_CONFIG } from '@/constants'
import { LoadingSpinner } from '../ui/Spinner'

interface MapContainerProps {
  center?: Location
  zoom?: number
  markers?: Array<{
    position: Location
    icon?: string
    title?: string
  }>
  showDirections?: boolean
  origin?: Location
  destination?: Location
  className?: string
  onMapClick?: (lat: number, lng: number) => void
}

export function MapContainer({
  center = GOOGLE_MAPS_CONFIG.defaultCenter,
  zoom = GOOGLE_MAPS_CONFIG.defaultZoom,
  markers = [],
  showDirections = false,
  origin,
  destination,
  className = 'h-[400px] w-full',
  onMapClick,
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (isLoaded && showDirections && origin && destination) {
      const directionsService = new google.maps.DirectionsService()

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result)
          }
        }
      )
    }
  }, [isLoaded, showDirections, origin, destination])

  if (loadError) {
    return (
      <div className={className + ' flex items-center justify-center bg-gray-100 rounded-lg'}>
        <p className="text-danger-600">Error loading maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={className + ' flex items-center justify-center bg-gray-100 rounded-lg'}>
        <LoadingSpinner text="Loading map..." />
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      center={center}
      zoom={zoom}
      onLoad={setMap}
      onClick={(e) => {
        if (onMapClick && e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng())
        }
      }}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          icon={marker.icon}
          title={marker.title}
        />
      ))}

      {showDirections && directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#0ea5e9',
              strokeWeight: 5,
            },
          }}
        />
      )}
    </GoogleMap>
  )
}
