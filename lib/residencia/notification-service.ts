import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/Services/firebaseConfig"

export type ResidenceNotificationType = "registos" | "validacoes" | "rejeicoes" | "atualizacoes"

interface ResidenceNotificationInput {
  residenciaId: string
  titulo: string
  mensagem: string
  tipo: ResidenceNotificationType
}

export const criarNotificacaoResidencia = async (input: ResidenceNotificationInput) => {
  try {
    await addDoc(collection(db, "notificacoes"), {
      ...input,
      criadoEm: serverTimestamp(),
      lida: false,
    })
  } catch (error) {
    // A atividade não deve impedir a operação principal da residência.
    console.error("Erro ao registar notificação da residência:", error)
  }
}