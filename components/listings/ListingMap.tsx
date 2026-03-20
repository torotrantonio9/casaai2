'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface MapListing {
  id: string
  title: string
  price: number
  lat: number
  lng: number
  city: string
}

interface ListingMapProps {
  listings: MapListing[]
  center?: [number, number]
  zoom?: number
}

export default function ListingMap({
  listings,
  center = [40.8518, 14.2681],
  zoom = 10,
}: ListingMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.lat, listing.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{listing.title}</p>
              <p className="text-blue-600 font-bold">€{listing.price.toLocaleString('it-IT')}</p>
              <p className="text-gray-500">{listing.city}</p>
              <a
                href={`/annunci/${listing.id}`}
                className="text-blue-600 underline text-xs"
              >
                Vedi dettaglio →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
