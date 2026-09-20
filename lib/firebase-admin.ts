import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

const adminApp = getApps().length
  ? getApps()[0]
  : projectId && clientEmail && privateKey
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    : initializeApp()

export const auth = getAuth(adminApp)
export const db = getFirestore(adminApp)