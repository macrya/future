'use client'

import { useState, useCallback } from 'react'
import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'
import { Input } from '../ui/Input'
import { GOOGLE_MAPS_CONFIG } from '@/constants'
import { Location } from '@/types'

interface LocationPickerProps {
  value?: string
  onChange?: (address: string, location: Location) => void
  placeholder?: string
  label?: string
  error?: string
}

export function LocationPicker({
  value,
  onChange,
  placeholder = 'Enter location',
  label,
  error,
}: LocationPickerProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
  })

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref)
  }, [])

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces()
      if (places && places.length > 0) {
        const place = places[0]
        const location = place.geometry?.location

        if (location && onChange) {
          onChange(place.formatted_address || '', {
            lat: location.lat(),
            lng: location.lng(),
            address: place.formatted_address,
          })
        }
      }
    }
  }

  if (!isLoaded) {
    return <Input label={label} placeholder="Loading..." disabled />
  }

  return (
    <div>
      <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
        <Input
          label={label}
          placeholder={placeholder}
          defaultValue={value}
          error={error}
          leftIcon={<MapPin className="w-5 h-5" />}
        />
      </StandaloneSearchBox>
    </div>
  )
}
