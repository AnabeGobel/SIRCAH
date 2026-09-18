import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIH7xpPcxEm6hkfoRGyWZ5pb9Sm8N_tOc",
  authDomain: "sircah.firebaseapp.com",
  projectId: "sircah",
  storageBucket: "sircah.firebasestorage.app",
  messagingSenderId: "464978772261",
  appId: "1:464978772261:web:3ecf9f9da956ca6c559acc"
};

// ADICIONADO APENAS O 'export' AQUI:
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Aqui exportamos o 'db' para podermos usar em outros arquivos para ler/escrever dados
export const db = getFirestore(app);
export const auth = getAuth(app);




