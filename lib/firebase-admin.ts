import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const normalizePrivateKey = (value?: string) => {
  if (!value) return ""

  return value
    .replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "")
    .trim()
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

const hasValidAdminCredentials = Boolean(
  projectId &&
  clientEmail &&
  privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
  privateKey.includes("-----END PRIVATE KEY-----")
)

let adminApp

try {
  if (getApps().length) {
    adminApp = getApps()[0]
  } else if (hasValidAdminCredentials) {
    adminApp = initializeApp({
      credential: cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey,
      }),
    })
  } else {
    adminApp = initializeApp()
    if (process.env.NODE_ENV !== "production") {
      console.warn("Firebase Admin não configurado. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY para ativar autenticação/Firestore no servidor.")
    }
  }
} catch (error) {
  console.error("Falha ao inicializar Firebase Admin com credenciais do servidor:", error)
  adminApp = initializeApp()
}

export const auth = getAuth(adminApp)
export const db = getFirestore(adminApp)