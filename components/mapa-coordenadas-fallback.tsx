"use client"

import { useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const markerIcon = L.divIcon({
  className: "residencia-location-marker",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#FF5F6D;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapInteraction({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onSelect(event.latlng.lat, event.latlng.lng) })
  return null
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat !== 0 || lng !== 0) map.setView([lat, lng], Math.max(map.getZoom(), 16))
  }, [lat, lng, map])
  return null
}

export function MapaCoordenadasFallback({ lat, lng, modoSatélite, rotação, onChange }: { lat: number; lng: number; modoSatélite: boolean; rotação: number; onChange: (lat: number, lng: number) => void }) {
  const center: [number, number] = lat !== 0 || lng !== 0 ? [lat, lng] : [-12.7761, 15.7392]

  return <div className="h-full w-full" style={{ transform: `rotate(${rotação}deg)`, transformOrigin: "center center" }}><MapContainer center={center} zoom={14} minZoom={3} maxZoom={19} scrollWheelZoom className="h-full w-full">
    {modoSatélite ? (
      <TileLayer attribution="&copy; Esri" maxNativeZoom={18} maxZoom={19} url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
    ) : (
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxNativeZoom={19} maxZoom={19} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    )}
    <MapInteraction onSelect={onChange} />
    <Recenter lat={lat} lng={lng} />
    {(lat !== 0 || lng !== 0) && <Marker position={[lat, lng]} icon={markerIcon} />}
  </MapContainer></div>
}
