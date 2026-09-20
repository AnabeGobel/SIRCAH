import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDIH7xpPcxEm6hkfoRGyWZ5pb9Sm8N_tOc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sircah.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sircah",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sircah.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "464978772261",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:464978772261:web:3ecf9f9da956ca6c559acc"
};

// ADICIONADO APENAS O 'export' AQUI:
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Aqui exportamos o 'db' para podermos usar em outros arquivos para ler/escrever dados
export const db = getFirestore(app);
export const auth = getAuth(app);




