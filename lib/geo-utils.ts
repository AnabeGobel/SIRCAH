/**
 * Utilitários para projectar coordenadas GPS reais (lat/lng) em posições
 * percentuais dentro da área visível do mapa (0% a 100% em X e Y).
 *
 * Usa uma projecção linear simples dentro dos limites (bounding box)
 * calculados a partir das próprias residências carregadas — assim o mapa
 * se ajusta automaticamente à área onde as residências realmente estão,
 * sem precisar de configuração manual de região.
 */

export interface Coordenadas {
  lat: number
  lng: number
}

export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/**
 * Calcula a bounding box (limites) a partir de uma lista de coordenadas.
 * Adiciona uma margem de 10% para as residências não ficarem coladas às bordas.
 */
export const calcularBoundingBox = (pontos: Coordenadas[]): BoundingBox => {
  if (pontos.length === 0) {
    // Fallback: Huambo, Angola (ajuste conforme a região do seu projecto)
    return { minLat: -12.80, maxLat: -12.73, minLng: 15.71, maxLng: 15.77 }
  }

  let minLat = pontos[0].lat, maxLat = pontos[0].lat
  let minLng = pontos[0].lng, maxLng = pontos[0].lng

  for (const p of pontos) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }

  // Margem de 10% em cada lado (evita pinos exactamente na borda)
  const margemLat = Math.max((maxLat - minLat) * 0.15, 0.005)
  const margemLng = Math.max((maxLng - minLng) * 0.15, 0.005)

  return {
    minLat: minLat - margemLat,
    maxLat: maxLat + margemLat,
    minLng: minLng - margemLng,
    maxLng: maxLng + margemLng,
  }
}

/**
 * Converte uma coordenada GPS real em posição percentual {left, top}
 * dentro da bounding box fornecida.
 *
 * Nota: latitude aumenta para Norte, mas no ecrã "top" aumenta para baixo —
 * por isso invertemos o eixo Y.
 */
export const coordenadaParaPosicao = (
  coord: Coordenadas,
  bbox: BoundingBox
): { left: number; top: number } => {
  const left = ((coord.lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100
  const top  = (1 - (coord.lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * 100

  // Garante que fica dentro de [2, 98] para não cortar visualmente nas bordas
  return {
    left: Math.max(2, Math.min(98, left)),
    top:  Math.max(2, Math.min(98, top)),
  }
}
