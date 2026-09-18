"use client"

import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import type { Residencia } from "@/lib/residence-service"

// Ícone personalizado para os marcadores
const createCustomIcon = (colorClass: string) => {
  let colorHex = "#eab308" // pendente (amarelo)
  if (colorClass === "bg-status-approved") colorHex = "#22c55e" // aprovado (verde)
  if (colorClass === "bg-status-rejected") colorHex = "#ef4444" // rejeitado (vermelho)

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colorHex}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`

  return L.divIcon({
    html: svgIcon,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Componente para reorientar o centro do mapa dinamicamente
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

interface MapaRealProps {
  residencias: Residencia[]
  selectedResidence: Residencia | null
  onSelectResidence: (residencia: Residencia) => void
  modoSatélite: boolean
}

export default function MapaReal({
  residencias,
  selectedResidence,
  onSelectResidence,
  modoSatélite,
}: MapaRealProps) {
  // Ponto central padrão (Huambo: -12.7761, 15.7392)
  const defaultCenter: [number, number] = [-12.7761, 15.7392]

  const center: [number, number] = useMemo(() => {
    if (selectedResidence) {
      return [selectedResidence.coordenadas.lat, selectedResidence.coordenadas.lng]
    }
    if (residencias.length > 0) {
      return [residencias[0].coordenadas.lat, residencias[0].coordenadas.lng]
    }
    return defaultCenter
  }, [selectedResidence, residencias])

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <MapRecenter center={center} />

      {modoSatélite ? (
        <TileLayer
          attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      ) : (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}

      {residencias.map((residencia) => {
        const pinColorClass =
          residencia.status === "aprovado"
            ? "bg-status-approved"
            : residencia.status === "pendente"
            ? "bg-status-pending"
            : "bg-status-rejected"

        return (
          <Marker
            key={residencia.id}
            position={[residencia.coordenadas.lat, residencia.coordenadas.lng]}
            icon={createCustomIcon(pinColorClass)}
            eventHandlers={{
              click: () => onSelectResidence(residencia),
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold">{residencia.nome_morador || residencia.codigo}</p>
                <p>{residencia.bairro}</p>
                <p className="text-muted-foreground">{residencia.status.toUpperCase()}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}