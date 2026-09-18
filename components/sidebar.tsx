"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Home,
  QrCode,
  Map,
  Settings,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle,
  List,
  Users,
  Plus,
  History,
} from "lucide-react"

// Integração com o Firebase
import { auth, db } from "@/lib/Services/firebaseConfig"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { toast } from "sonner"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Residências",
    href: "/residencias",
    icon: Home,
    subItems: [
      { name: "Pendentes", href: "/residencias/pendentes", icon: Clock },
      { name: "Aprovadas", href: "/residencias/aprovadas", icon: CheckCircle },
      { name: "Todas", href: "/residencias/todas", icon: List },
      { name: "Novo Registo", href: "/residencias/novo", icon: Plus },
    ],
  },
  {
    name: "QR Codes",
    href: "/qrcodes",
    icon: QrCode,
  },
  {
    name: "Mapa",
    href: "/mapa",
    icon: Map,
  },
  {
    name: "Histórico",
    href: "/historico",
    icon: History,
  },
  {
    name: "Utilizadores",
    href: "/utilizadores",
    icon: Users,
  },
  {
    name: "Moradores",
    href: "/moradores",
    icon: Users,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Residências"])
  
  // Estados para armazenar os dados reais do utilizador autenticado
  const [userData, setUserData] = useState({
    name: "A carregar...",
    email: "...",
    iniciais: "--"
  })

  // Criamos uma variável fora do useEffect para guardar o desativador do ouvinte
  let unsubscribeFirestoreGlobal: (() => void) | null = null;

  // Ajusta o teu useEffect para guardar a referência do Snap
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Define logo os dados do Auth enquanto o Firestore não responde
        setUserData({
          name: user.displayName || "Utilizador",
          email: user.email || "",
          iniciais: user.email ? user.email.substring(0, 2).toUpperCase() : "U"
        })

        const docRef = doc(db, "usuariosWeb", user.uid)
        
        const unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            const nomeCompleto = data.nome || user.displayName || "Utilizador"
            const partesDoNome = nomeCompleto.trim().split(" ")
            const primeirasIniciais = partesDoNome.length > 1 
              ? `${partesDoNome[0][0]}${partesDoNome[partesDoNome.length - 1][0]}`.toUpperCase()
              : `${partesDoNome[0][0] || ""}${partesDoNome[0][1] || ""}`.toUpperCase()

            setUserData({
              name: nomeCompleto,
              email: data.email || user.email || "",
              iniciais: primeirasIniciais || "U"
            })
          }
        }, (error) => {
          console.warn("Snapshot interrompido controlado:", error.message)
        })

        unsubscribeFirestoreGlobal = unsubscribeSnap
        return () => unsubscribeSnap()
      } else {
        setUserData({ name: "Desconectado", email: "", iniciais: "--" })
      }
    })

    return () => unsubscribeAuth()
  }, [])

  // A TUA FUNÇÃO DE LOGOUT ATUALIZADA:
  const handleLogout = async () => {
    try {
      // 1. Desligamos o ouvinte em tempo real do Firestore PRIMEIRO
      if (unsubscribeFirestoreGlobal) {
        unsubscribeFirestoreGlobal();
        unsubscribeFirestoreGlobal = null;
      }

      // 2. Agora sim, fazemos o logout com segurança
      await signOut(auth)
      toast.success("Sessão terminada com sucesso!")
      router.push("/login")
    } catch (error: any) {
      console.error("Erro ao sair:", error)
      toast.error("Erro ao terminar sessão.")
    }
  }

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    // 🛠️ Substitui a linha do <aside ...> por esta:
<aside className="flex h-full w-full min-w-[260px] md:w-64 flex-col bg-sidebar border-r border-sidebar-border select-none overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Home className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-foreground">SIRCAH</h1>
          <p className="text-xs text-muted-foreground">Identificação Residencial</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedItems.includes(item.name) && "rotate-180"
                    )}
                  />
                </button>
                {expandedItems.includes(item.name) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <subItem.icon className="h-4 w-4" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-sidebar-border p-4 bg-sidebar">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 mb-2 bg-sidebar-accent/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            {userData.iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userData.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userData.email}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          Terminar Sessão
        </button>
      </div>
    </aside>
  )
}