/**
 * Utilitários de geocoding usando a Google Maps Geocoding API.
 * Substitua GOOGLE_MAPS_API_KEY pela sua chave com a API "Geocoding API" activada.
 */

export const GOOGLE_MAPS_API_KEY = "AIzaSyDf6c1htylpbxEPFOtSFm7PH_9_uvhgtjQ"

export interface ResultadoGeocoding {
  lat: number
  lng: number
  enderecoFormatado: string
}

/**
 * Converte um endereço de texto em coordenadas GPS.
 * Útil se o utilizador preferir escrever o endereço em vez de
 * marcar directamente no mapa.
 */
export const geocodificarEndereco = async (
  endereco: string
): Promise<ResultadoGeocoding | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      endereco
    )}&key=${GOOGLE_MAPS_API_KEY}`
    const resp = await fetch(url)
    const json = await resp.json()

    if (json.status !== "OK" || !json.results?.length) return null

    const r = json.results[0]
    return {
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      enderecoFormatado: r.formatted_address,
    }
  } catch {
    return null
  }
}

/**
 * Converte coordenadas GPS em endereço legível (geocoding inverso).
 * Usado quando o utilizador clica/arrasta o marcador no mapa, para
 * preencher automaticamente o campo de descrição/endereço.
 */
export const geocodificarCoordenadas = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    const resp = await fetch(url)
    const json = await resp.json()

    if (json.status !== "OK" || !json.results?.length) return null
    return json.results[0].formatted_address
  } catch {
    return null
  }
}
