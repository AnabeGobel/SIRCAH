import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const sanitize = (rawValue: string | undefined) => {
  if (!rawValue) return "";

  return rawValue
    .trim()
    .replace(/^['"`]+|['"`]+$/g, "")
    .replace(/,$/, "")
    .trim();
};

// IMPORTANTE: o Next.js só consegue substituir variáveis NEXT_PUBLIC_*
// pelo valor real no bundle do browser quando o acesso é literal
// (process.env.NEXT_PUBLIC_X). Um acesso dinâmico como process.env[chave]
// NÃO é reconhecido e fica sempre undefined no cliente — era essa a causa
// do erro "Faltam variáveis do Firebase", mesmo com o .env.local correto.
const rawPublicEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

const sanitizedEnv = Object.fromEntries(
  Object.entries(rawPublicEnv).map(([key, value]) => [key, sanitize(value)])
) as Record<keyof typeof rawPublicEnv, string>;

const missingPublicEnvVars = (
  Object.keys(rawPublicEnv) as Array<keyof typeof rawPublicEnv>
).filter((key) => !sanitizedEnv[key]);

if (missingPublicEnvVars.length > 0) {
  throw new Error(
    `Faltam variáveis do Firebase no frontend: ${missingPublicEnvVars.join(", ")}. ` +
    "Configure-as no .env.local e no Vercel com os valores reais do projeto Firebase."
  );
}

const firebaseConfig = {
  apiKey: sanitizedEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: sanitizedEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: sanitizedEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
