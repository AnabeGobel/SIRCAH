'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'
import { auth, db } from "@/lib/Services/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"

// Componente interno para gerir a sincronização com o Firebase
function FirebaseThemeSync() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    let unsubscribeSnap: (() => void) | undefined
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnap?.()
      unsubscribeSnap = undefined
      if (user) {
        // Escuta o Firestore em tempo real para sincronizar o tema da conta logada
        const docRef = doc(db, "usuariosWeb", user.uid)
        unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            const isDark = data.configuracoes?.darkMode ?? false
            
            // Força o next-themes a aplicar o tema correto em toda a app
            setTheme(isDark ? 'dark' : 'light')
          }
        }, (error) => {
          if (auth.currentUser) console.error("Erro ao sincronizar tema com o Firestore:", error)
        })

      } else {
        // Opcional: Se o utilizador terminar sessão, podes decidir manter o tema ou resetar para o padrão do sistema
        // setTheme('system')
      }
    })

    return () => {
      unsubscribeAuth()
      unsubscribeSnap?.()
    }
  }, [setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <FirebaseThemeSync />
      {children}
    </NextThemesProvider>
  )
}