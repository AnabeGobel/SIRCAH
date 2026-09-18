import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/Services/firebaseConfig"

export type TipoUtilizadorGlobal = "agente" | "morador" | "administrador"

export interface UtilizadorGlobal {
  id: string
  tipo: TipoUtilizadorGlobal
  nome: string
  email: string
  telefone: string
  estado: "ativo" | "inativo"
}

const normalizarEstado = (data: DocumentData): "ativo" | "inativo" => {
  const estado = String(data.status || data.estado || "ativo").trim().toLowerCase()
  return ["inativo", "inactivo", "desativado", "desactivado"].includes(estado) ? "inativo" : "ativo"
}

const mapearUtilizador = (tipo: TipoUtilizadorGlobal, id: string, data: DocumentData): UtilizadorGlobal => ({
  id,
  tipo,
  nome: String(data.nome || data.name || "Sem nome"),
  email: String(data.email || ""),
  telefone: String(data.telefone || data.phone || ""),
  estado: normalizarEstado(data),
})

export function observarUtilizadoresGlobais(onChange: (utilizadores: UtilizadorGlobal[]) => void, onError: (error: Error) => void): Unsubscribe {
  let agentes: UtilizadorGlobal[] = []
  let moradores: UtilizadorGlobal[] = []
  let agentesProntos = false
  let moradoresProntos = false

  const administradores: UtilizadorGlobal[] = []
  let administradoresProntos = false

  const publicar = () => {
    if (agentesProntos && moradoresProntos && administradoresProntos) onChange([...agentes, ...moradores, ...administradores])
  }

  const unsubscribeAgentes = onSnapshot(collection(db, "agentes"), (snapshot) => {
    agentes = snapshot.docs.map((item) => mapearUtilizador("agente", item.id, item.data()))
    agentesProntos = true
    publicar()
  }, onError)

  const unsubscribeMoradores = onSnapshot(collection(db, "moradores"), (snapshot) => {
    moradores = snapshot.docs
      .map((item) => mapearUtilizador("morador", item.id, item.data()))
      .filter((item) => item.tipo === "morador")
    moradoresProntos = true
    publicar()
  }, onError)

  const unsubscribeAdministradores = onSnapshot(collection(db, "administradoresGlobais"), (snapshot) => {
    administradores.splice(0, administradores.length, ...snapshot.docs.map((item) => mapearUtilizador("administrador", item.id, item.data())))
    administradoresProntos = true
    publicar()
  }, onError)

  return () => {
    unsubscribeAgentes()
    unsubscribeMoradores()
    unsubscribeAdministradores()
  }
}

export async function alterarEstadoUtilizadorGlobal(utilizador: UtilizadorGlobal): Promise<void> {
  const colecao = utilizador.tipo === "agente" ? "agentes" : utilizador.tipo === "morador" ? "moradores" : "administradoresGlobais"
  const novoEstado = utilizador.estado === "ativo" ? "inativo" : "ativo"
  await updateDoc(doc(db, colecao, utilizador.id), {
    status: novoEstado,
    estado: novoEstado,
  })
}
