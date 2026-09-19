import {
  collection,
  getDocs,
  GeoPoint,
  Timestamp,
} from "firebase/firestore"
import { db } from '../lib/Services/firebaseConfig' 

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type StatusResidencia = "pendente" | "aprovado" | "rejeitada"
export type EstadoResidencia = "valido" | "invalido"

export interface Coordenadas {
  lat: number
  lng: number
}

export interface Residencia {
  id: string              // ID do documento Firestore
  bairro: string
  codigo: string
  coordenadas: Coordenadas
  criadoEm: Date | null
  descricao: string
  foto_url: string
  nome_morador: string
  rua: string
  telefone: string
  status: StatusResidencia
  motivoRejeicao?: string
  estadoResidencia?: EstadoResidencia
  mensagemEstado?: string
  comentarioJustificativa?: string
  comprovativoNome?: string
  comprovativoUrl?: string
  justificativaReenvio?: string
  anexoJustificacao?: string
}

// ─── Helpers de conversão ──────────────────────────────────────────────────────

/**
 * Converte um GeoPoint do Firestore para {lat, lng} simples.
 * Aceita também objectos já no formato {latitude, longitude} por segurança.
 */
const converterGeoPoint = (raw: any): Coordenadas => {
  if (!raw) return { lat: 0, lng: 0 }
  if (raw instanceof GeoPoint) return { lat: raw.latitude, lng: raw.longitude }
  if (typeof raw.latitude === "number") return { lat: raw.latitude, lng: raw.longitude }
  if (typeof raw.lat === "number") return { lat: raw.lat, lng: raw.lng }
  return { lat: 0, lng: 0 }
}

/**
 * Converte um Timestamp do Firestore para Date nativo.
 */
const converterTimestamp = (raw: any): Date | null => {
  if (!raw) return null
  if (raw instanceof Timestamp) return raw.toDate()
  if (raw.seconds) return new Date(raw.seconds * 1000)
  return null
}

/**
 * Converte um documento raw do Firestore para o tipo Residencia.
 */
const converterDoc = (id: string, data: any): Residencia => ({
  id,
  bairro:       data.bairro       ?? "",
  codigo:       data.codigo       ?? "",
  coordenadas:  converterGeoPoint(data.coordenadas),
  criadoEm:     converterTimestamp(data.criadoEm),
  descricao:    data.descricao    ?? "",
  foto_url:     data.foto_url     ?? "",
  nome_morador: data.nome_morador ?? "",
  rua:          data.rua          ?? "",
  telefone:     data.telefone     ?? "",
  status:       (data.status as StatusResidencia) ?? "pendente",
  motivoRejeicao: data.motivoRejeicao ?? "",
  estadoResidencia: data.estadoResidencia ?? "valido",
  mensagemEstado: data.mensagemEstado ?? "",
  comentarioJustificativa: data.comentarioJustificativa ?? data.justificativa?.comentarioJustificativa ?? "",
  comprovativoNome: data.comprovativoNome ?? data.justificativa?.comprovativoNome ?? "",
  comprovativoUrl: data.comprovativoUrl ?? data.justificativa?.comprovativoUrl ?? "",
  justificativaReenvio: data.comentarioJustificativa ?? data.justificativa?.comentarioJustificativa ?? data.justificativaReenvio ?? data.justificativaTexto ?? data.mensagemReenvio ?? data.justificativaEdicao ?? (typeof data.justificativa === "string" ? data.justificativa : "") ?? "",
  anexoJustificacao: data.comprovativoUrl ?? data.justificativa?.comprovativoUrl ?? data.anexoJustificacao ?? data.documentoJustificacao ?? data.imagemJustificacao ?? data.justificativaArquivo ?? data.comprovativoReenvio ?? "",
})

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Busca TODAS as residências da colecção "residencias".
 * Não filtra por status aqui — o painel de administração precisa ver
 * pendentes, aprovadas e rejeitadas no mapa (com cores diferentes).
 *
 * Query simples sem orderBy/where para evitar necessidade de índices compostos.
 * Ordenação e filtragem feitas no cliente.
 */
export const fetchTodasResidencias = async (): Promise<Residencia[]> => {
  const snapshot = await getDocs(collection(db, "residencias"))
  return snapshot.docs
    .map((d) => converterDoc(d.id, d.data()))
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
}
