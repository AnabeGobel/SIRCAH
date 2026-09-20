import {
  collection,
  getDocs,
  addDoc,
  GeoPoint,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
// ✅ Sem Firebase Storage — a imagem é guardada como base64 directamente no Firestore,
//    igual à lógica usada na app mobile.
import { db } from "../Services/firebaseConfig"
import { gerarProximoCodigo, gerarQrCodeUrl } from "./codigo-utils"
import { criarNotificacaoResidencia } from "./notification-service"

// ─── Helper: converte File → base64 string ────────────────────────────────────
/**
 * Lê um ficheiro de imagem e devolve o conteúdo em base64.
 * O resultado é guardado directamente no campo foto_url do Firestore,
 * sem passar pelo Firebase Storage.
 */
const fileParaBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Erro ao ler o ficheiro de imagem."))
    reader.readAsDataURL(file) // ex: "data:image/jpeg;base64,/9j/4AAQ..."
  })

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type StatusResidencia = "pendente" | "aprovado" | "rejeitada"

export interface Coordenadas {
  lat: number
  lng: number
}

export interface DocumentoResidencia {
  mimeType?: string
  name?: string
  uri?: string
}

export interface Residencia {
  id: string              // ID do documento Firestore
  aprovadoEm: Date | null
  bairro: string
  codigo: string
  coordenadas: Coordenadas
  criadoEm: Date | null
  descricao: string
  foto_url: string
  morador_uid: string
  nome_morador: string
  qr_code_url: string
  rua: string
  telefone: string
  status: StatusResidencia
  documentoBi?: DocumentoResidencia
  documentosOpcionais?: DocumentoResidencia[]
}

// ─── Dados de entrada para o registo de uma nova residência ──────────────────

export interface NovaResidenciaInput {
  bairro:       string
  descricao:    string
  rua:          string
  morador_uid:  string
  nome_morador: string
  telefone:     string
  coordenadas:  Coordenadas
  // ✅ Ficheiro de imagem — o serviço converte para base64 internamente
  //    e guarda directamente no Firestore (sem Firebase Storage)
  fotoFile?:    File | null
  documentoBi?: DocumentoResidencia | null
  documentosOpcionais?: DocumentoResidencia[]
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
  aprovadoEm:   converterTimestamp(data.aprovadoEm),
  bairro:       data.bairro       ?? "",
  codigo:       data.codigo       ?? "",
  coordenadas:  converterGeoPoint(data.coordenadas),
  criadoEm:     converterTimestamp(data.criadoEm),
  descricao:    data.descricao    ?? "",
  foto_url:     data.foto_url     ?? "",
  morador_uid:  data.morador_uid  ?? "",
  nome_morador: data.nome_morador ?? "",
  qr_code_url:  data.qr_code_url  ?? "",
  rua:          data.rua          ?? "",
  telefone:     data.telefone     ?? "",
  status:       (data.status as StatusResidencia) ?? "pendente",
  documentoBi: data.documentoBi ?? undefined,
  documentosOpcionais: Array.isArray(data.documentosOpcionais) ? data.documentosOpcionais : [],
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

// ─── Registo de nova residência ────────────────────────────────────────────────

/**
 * Regista uma nova residência na colecção "residencias".
 *
 * Lógica idêntica à app mobile:
 *  1. Converte a foto para base64 (sem Storage)
 *  2. Grava tudo num único addDoc no Firestore
 *  3. status = "pendente" sempre — nunca "aprovado" no registo
 *  4. codigo e qr_code_url ficam null — gerados na aprovação pelo admin
 *  5. aprovadoEm null — preenchido só na aprovação
 *  6. criadoEm = serverTimestamp()
 *
 * @returns o ID do documento criado
 */
export const registarNovaResidencia = async (
  input: NovaResidenciaInput
): Promise<{ id: string }> => {
  // 1) Converte a foto para base64 (igual ao mobile — sem Storage)
  let foto_url = ""
  if (input.fotoFile) {
    foto_url = await fileParaBase64(input.fotoFile)
  }

  // 2) Grava o documento — estrutura 100% idêntica à do mobile
  const docRef = await addDoc(collection(db, "residencias"), {
    morador_uid:  input.morador_uid,
    nome_morador: input.nome_morador,
    telefone:     input.telefone,
    coordenadas:  new GeoPoint(input.coordenadas.lat, input.coordenadas.lng),
    bairro:       input.bairro,
    rua:          input.rua,
    descricao:    input.descricao || "",
    // ✅ Imagem em base64 — sem Firebase Storage (igual ao mobile)
    foto_url,
    status:       "pendente",
    criadoEm:     serverTimestamp(),
    // Campos gerados na aprovação — ficam null no registo (igual ao mobile)
    codigo:       null,
    qr_code_url:  null,
    aprovadoEm:   null,
    documentoBi: input.documentoBi ?? null,
    documentosOpcionais: input.documentosOpcionais ?? [],
  })

  await criarNotificacaoResidencia({
    residenciaId: docRef.id,
    titulo: "Novo registo de residência",
    mensagem: `O registo de ${input.nome_morador || "um morador"} foi enviado para validação.`,
    tipo: "registos",
  })

  return { id: docRef.id }
}
