"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Loader2, MapPin, Navigation, Landmark, RotateCcw, RotateCw } from "lucide-react"
import { GOOGLE_MAPS_API_KEY, geocodificarCoordenadas } from "@/lib/residencia/geocoding-utils"

const MapaCoordenadasFallback = dynamic(
  () => import("@/components/mapa-coordenadas-fallback").then((module) => module.MapaCoordenadasFallback),
  { ssr: false },
)

interface MapaCoordenadasProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number, enderecoDetectado?: string) => void
}

// Região padrão centrada em Luanda, Angola (fallback antes do GPS)
const REGIAO_PADRAO = { lat: -8.8383, lng: 13.2344 }
const ZOOM_PADRAO   = 13
const ZOOM_MARCADOR = 17

declare global {
  interface Window {
    google: any
    initMapaCoordenadas?: () => void
    gm_authFailure?: () => void
  }
}

/**
 * Mapa Google Maps real e interactivo para o formulário de registo.
 *
 * O que este componente faz:
 *  1. Carrega a Google Maps JavaScript API dinamicamente (sem pacote extra)
 *  2. Centraliza automaticamente na posição GPS real do dispositivo (se autorizado)
 *  3. Permite clicar em qualquer ponto do mapa para definir as coordenadas
 *  4. Permite arrastar o marcador para ajustar a posição
 *  5. Após cada clique/drag, faz geocoding inverso e devolve o endereço detectado
 *  6. Mostra um botão "Usar minha localização" para centrar no GPS actual
 */
export function MapaCoordenadas({ lat, lng, onChange }: MapaCoordenadasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const marcadorRef  = useRef<any>(null)
  const [carregando,     setCarregando]     = useState(true)
  const [enderecoDetec,  setEnderecoDetec]  = useState<string | null>(null)
  const [buscandoGPS,    setBuscandoGPS]    = useState(false)
  const [pontoReferencia, setPontoReferencia] = useState<{ nome: string; lat: number; lng: number } | null>(null)
  const [erroMapa, setErroMapa] = useState(false)
  const [modoSatélite, setModoSatélite] = useState(false)
  const [rotação, setRotação] = useState(0)
  const apiCarregada = useRef(false)
  const fallbackTimerRef = useRef<number | null>(null)

  const activarFallback = useCallback(() => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current)
    setCarregando(false)
    setErroMapa(true)
  }, [])

  // Posição inicial: usa as props se não forem (0,0), senão fallback Luanda
  const posInicial = lat !== 0 || lng !== 0
    ? { lat, lng }
    : REGIAO_PADRAO

  // ── Actualiza o marcador no mapa quando as props mudam externamente ─────────
  useEffect(() => {
    if (!marcadorRef.current || (lat === 0 && lng === 0)) return
    const pos = new window.google.maps.LatLng(lat, lng)
    marcadorRef.current.setPosition(pos)
    mapRef.current?.panTo(pos)
  }, [lat, lng])

  // ── Após posicionar o marcador: geocoding inverso ───────────────────────────
  const actualizarEndereco = useCallback(async (novoLat: number, novoLng: number) => {
    const endereco = await geocodificarCoordenadas(novoLat, novoLng)
    setEnderecoDetec(endereco)
    onChange(novoLat, novoLng, endereco ?? undefined)
  }, [onChange])

  // ── Inicializa o mapa (chamado pelo callback da API do Google) ──────────────
  const inicializarMapa = useCallback(() => {
    if (!containerRef.current || mapRef.current) return

    const mapa = new window.google.maps.Map(containerRef.current, {
      center:           posInicial,
      zoom:             lat !== 0 ? ZOOM_MARCADOR : ZOOM_PADRAO,
      mapTypeId:        modoSatélite ? "satellite" : "roadmap",
      mapTypeControl:   true,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      styles: [
        { elementType: "geometry",      stylers: [{ color: "#f5f5f5" }] },
        { featureType: "road",          elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "water",         elementType: "geometry", stylers: [{ color: "#c9e8f5" }] },
        { featureType: "poi.park",      elementType: "geometry", stylers: [{ color: "#d5e8c4" }] },
        { elementType: "labels.icon",   stylers: [{ visibility: "on" }] },
      ],
    })
    mapRef.current = mapa

    // A API pode criar o container mesmo quando a chave não tem a Maps JavaScript API activa.
    // Nesse caso não aparece .gm-style e usamos o mapa alternativo.
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!containerRef.current?.querySelector(".gm-style")) activarFallback()
    }, 2500)

    // Marcador inicial (arrastável)
    const marcador = new window.google.maps.Marker({
      position:  posInicial,
      map:       mapa,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title:     "Arraste para ajustar a posição",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale:       10,
        fillColor:   "#D10A24",
        fillOpacity: 1,
        strokeColor: "#FFF",
        strokeWeight: 2.5,
      },
    })
    marcadorRef.current = marcador

    // Se já há coordenadas válidas nas props, faz geocoding da posição inicial
    if (lat !== 0 || lng !== 0) {
      actualizarEndereco(lat, lng)
    }

    // Clique no mapa: move o marcador e actualiza coordenadas
    mapa.addListener("click", (e: any) => {
      const novoLat = e.latLng.lat()
      const novoLng = e.latLng.lng()
      marcador.setPosition(e.latLng)
      marcador.setAnimation(window.google.maps.Animation.BOUNCE)
      setTimeout(() => marcador.setAnimation(null), 700)
      actualizarEndereco(novoLat, novoLng)

      // A API fornece placeId quando o clique é num ponto público/POI.
      if (e.placeId && window.google.maps.places?.PlacesService) {
        e.stop()
        const placesService = new window.google.maps.places.PlacesService(mapa)
        placesService.getDetails({ placeId: e.placeId, fields: ["name", "geometry"] }, (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.name) {
            const pontoLat = place.geometry?.location?.lat?.() ?? novoLat
            const pontoLng = place.geometry?.location?.lng?.() ?? novoLng
            setPontoReferencia({ nome: place.name, lat: pontoLat, lng: pontoLng })
          }
        })
      } else {
        setPontoReferencia(null)
      }
    })

    // Arrastar o marcador: actualiza coordenadas ao soltar
    marcador.addListener("dragend", (e: any) => {
      const novoLat = e.latLng.lat()
      const novoLng = e.latLng.lng()
      actualizarEndereco(novoLat, novoLng)
    })

    setCarregando(false)
  }, [lat, lng, posInicial, actualizarEndereco, activarFallback])

  useEffect(() => {
    if (mapRef.current && window.google?.maps) {
      mapRef.current.setMapTypeId(modoSatélite ? "satellite" : "roadmap")
    }
  }, [modoSatélite])

  useEffect(() => {
    if (mapRef.current && window.google?.maps) {
      mapRef.current.setHeading(rotação)
      mapRef.current.setTilt(rotação % 180 === 0 ? 0 : 45)
    }
  }, [rotação])

  const girarMapa = (direcção: "esquerda" | "direita") => {
    setRotação((actual) => (actual + (direcção === "direita" ? 90 : -90) + 360) % 360)
  }

  // ── Carrega a Google Maps API uma única vez ─────────────────────────────────
  useEffect(() => {
    if (apiCarregada.current) {
      // API já foi carregada numa montagem anterior — inicializa directamente
      if (window.google?.maps) {
        inicializarMapa()
        fallbackTimerRef.current = window.setTimeout(() => {
          if (!containerRef.current?.querySelector(".gm-style")) activarFallback()
        }, 2500)
      } else {
        activarFallback()
      }
      return
    }

    // Verifica se já existe a API no window (outro componente carregou)
    if (window.google?.maps) {
      apiCarregada.current = true
      inicializarMapa()
      fallbackTimerRef.current = window.setTimeout(() => {
        if (!containerRef.current?.querySelector(".gm-style")) activarFallback()
      }, 2500)
      return
    }

    // Define o callback global antes de carregar o script
    window.initMapaCoordenadas = () => {
      apiCarregada.current = true
      inicializarMapa()
    }
    window.gm_authFailure = () => {
      activarFallback()
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMapaCoordenadas&loading=async`
    script.async = true
    script.defer = true
    script.onerror = activarFallback
    document.head.appendChild(script)
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!apiCarregada.current) {
        activarFallback()
      }
    }, 8000)

    return () => {
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current)
      // Não remove o script ao desmontar para evitar re-carregamentos
      window.initMapaCoordenadas = undefined
      window.gm_authFailure = undefined
    }
  }, [activarFallback, inicializarMapa])

  // ── Botão "Usar minha localização" ─────────────────────────────────────────
  const usarMinhaLocalizacao = () => {
    if (!navigator.geolocation) return
    setBuscandoGPS(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const novoLat = pos.coords.latitude
        const novoLng = pos.coords.longitude
        const latlng = { lat: novoLat, lng: novoLng }
        if (marcadorRef.current && window.google?.maps) marcadorRef.current.setPosition(latlng)
        mapRef.current?.panTo(latlng)
        mapRef.current?.setZoom(ZOOM_MARCADOR)
        actualizarEndereco(novoLat, novoLng)
        setPontoReferencia(null)
        setBuscandoGPS(false)
      },
      () => { setBuscandoGPS(false) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Visualização do mapa
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button
            type="button"
            onClick={() => setModoSatélite(false)}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${!modoSatélite ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
          >
            Mapa normal
          </button>
          <button
            type="button"
            onClick={() => setModoSatélite(true)}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${modoSatélite ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
          >
            Satélite
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
          <button type="button" onClick={() => girarMapa("esquerda")} aria-label="Girar mapa para a esquerda" title="Girar mapa para a esquerda" className="rounded-md p-2 text-foreground hover:bg-muted">
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="min-w-12 text-center text-xs font-medium text-muted-foreground">{rotação}°</span>
          <button type="button" onClick={() => girarMapa("direita")} aria-label="Girar mapa para a direita" title="Girar mapa para a direita" className="rounded-md p-2 text-foreground hover:bg-muted">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative rounded-[16px] overflow-hidden border border-border" style={{ height: 260 }}>
        {erroMapa ? (
          <MapaCoordenadasFallback
            lat={lat}
            lng={lng}
            modoSatélite={modoSatélite}
            rotação={rotação}
            onChange={(novoLat, novoLng) => {
              setPontoReferencia(null)
              actualizarEndereco(novoLat, novoLng)
            }}
          />
        ) : (
          <>
        {/* Container do mapa Google */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Overlay de loading */}
        {carregando && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">A carregar mapa...</p>
          </div>
        )}

        {/* Botão GPS — canto superior direito dentro do mapa */}
        {!carregando && (
          <button
            type="button"
            onClick={usarMinhaLocalizacao}
            disabled={buscandoGPS}
            className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-xs font-semibold shadow-md hover:bg-muted/60 transition-colors disabled:opacity-60"
          >
            {buscandoGPS
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Navigation className="h-3.5 w-3.5 text-primary" />
            }
            {buscandoGPS ? "A localizar..." : "Usar minha localização"}
          </button>
        )}
          </>
        )}

        {erroMapa && <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">Mapa alternativo activo</div>}

        {/* Dica de uso */}
        {!carregando && !erroMapa && (
          <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border px-2.5 py-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
                Clique num local público ou arraste o marcador
            </p>
          </div>
        )}
      </div>

      {/* Entrada manual para correcção administrativa da localização */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Latitude</span>
          <input
            type="number"
            step="0.0000001"
            value={lat || ""}
            onChange={(event) => {
              const value = Number(event.target.value)
              if (Number.isFinite(value) && value >= -90 && value <= 90) {
                const nextLng = lng || 0
                onChange(value, nextLng)
                if (marcadorRef.current && window.google?.maps) marcadorRef.current.setPosition({ lat: value, lng: nextLng })
                if (mapRef.current) mapRef.current.panTo({ lat: value, lng: nextLng })
                setPontoReferencia(null)
              }
            }}
            placeholder="-12.7761"
            className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Longitude</span>
          <input
            type="number"
            step="0.0000001"
            value={lng || ""}
            onChange={(event) => {
              const value = Number(event.target.value)
              if (Number.isFinite(value) && value >= -180 && value <= 180) {
                const nextLat = lat || 0
                onChange(nextLat, value)
                if (marcadorRef.current && window.google?.maps) marcadorRef.current.setPosition({ lat: nextLat, lng: value })
                if (mapRef.current) mapRef.current.panTo({ lat: nextLat, lng: value })
                setPontoReferencia(null)
              }
            }}
            placeholder="15.7392"
            className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {pontoReferencia && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">Ponto de referência seleccionado</p>
            <p className="text-sm text-foreground">{pontoReferencia.nome}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Latitude: {pontoReferencia.lat.toFixed(7)} · Longitude: {pontoReferencia.lng.toFixed(7)}
            </p>
          </div>
        </div>
      )}

      {/* Coordenadas actuais */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/40 px-3 py-2 font-mono text-sm">
          <span className="text-xs text-muted-foreground block mb-0.5">Latitude</span>
          <span className="text-foreground">{lat !== 0 ? lat.toFixed(7) : "—"}</span>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-2 font-mono text-sm">
          <span className="text-xs text-muted-foreground block mb-0.5">Longitude</span>
          <span className="text-foreground">{lng !== 0 ? lng.toFixed(7) : "—"}</span>
        </div>
      </div>

      {/* Endereço detectado por geocoding inverso */}
      {enderecoDetec && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Endereço detectado</p>
          <p className="text-sm text-foreground leading-snug">{enderecoDetec}</p>
        </div>
      )}
    </div>
  )
}
