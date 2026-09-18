import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../Services/firebaseConfig" // ajuste o caminho conforme o seu projecto

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Morador {
  uid: string         // ID do documento na colecção "moradores"
  nome: string
  telefone: string
  tipo?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const converterMorador = (uid: string, data: any): Morador => ({
  uid,
  nome:     data.nome     ?? "",
  telefone: data.telefone ?? "",
  tipo:     data.tipo     ?? "",
})

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Busca TODOS os moradores da colecção "moradores".
 * Usado para popular o selector de morador no formulário de registo.
 * Ordenados alfabeticamente pelo nome para facilitar a procura visual.
 */
export const fetchTodosMoradores = async (): Promise<Morador[]> => {
  const snapshot = await getDocs(collection(db, "moradores"))
  return snapshot.docs
    .map((d) => converterMorador(d.id, d.data()))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

/**
 * Busca um único morador pelo UID.
 * Útil para confirmar dados antes de submeter o formulário.
 */
export const fetchMoradorPorUid = async (uid: string): Promise<Morador | null> => {
  const snap = await getDoc(doc(db, "moradores", uid))
  if (!snap.exists()) return null
  return converterMorador(snap.id, snap.data())
}
