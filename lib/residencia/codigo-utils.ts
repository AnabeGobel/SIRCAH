import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../Services/firebaseConfig"

/**
 * Gera o próximo código alfanumérico sequencial para uma nova residência.
 * Formato: RES-XXXX (ex: RES-1021, RES-1022...)
 *
 * Estratégia: busca o último código registado na colecção "residencias"
 * (ordenado por código, descendente) e incrementa o número em +1.
 * Se não houver nenhuma residência ainda, começa em RES-1001.
 */
export const gerarProximoCodigo = async (): Promise<string> => {
  try {
    const ref = collection(db, "residencias")
    // Query simples (sem where) — busca todas e ordena no cliente para
    // evitar a necessidade de índice composto.
    const snapshot = await getDocs(ref)

    let maiorNumero = 1000 // ponto de partida: o primeiro código será RES-1001

    snapshot.docs.forEach((d) => {
      const codigo = d.data().codigo as string | undefined
      if (!codigo) return
      const match = codigo.match(/RES-(\d+)/i)
      if (match) {
        const numero = parseInt(match[1], 10)
        if (numero > maiorNumero) maiorNumero = numero
      }
    })

    return `RES-${maiorNumero + 1}`
  } catch (e) {
    console.error("Erro ao gerar código:", e)
    // Fallback: código baseado em timestamp para nunca colidir
    return `RES-${Date.now().toString().slice(-6)}`
  }
}

/**
 * Gera a URL de um QR Code contendo o código da residência.
 * Usa a API pública do QR Server (gratuita, sem necessidade de chave).
 * O conteúdo do QR é o próprio código alfanumérico (ex: "RES-1021"),
 * que a app móvel decodifica directamente via fetchResidenciaPorQrCode.
 */
export const gerarQrCodeUrl = (codigo: string): string => {
  const tamanho = "300x300"
  const conteudo = encodeURIComponent(codigo)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}&data=${conteudo}`
}
