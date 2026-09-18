"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  FileClock,
  Gauge,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react"
import { auth, db } from "@/lib/Services/firebaseConfig"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const navigationItems = [
  { label: "Dashboard", href: "/admin-global/dashboard", icon: LayoutDashboard },
  { label: "Residências", href: "/admin-global/residencias", icon: Home },
  {
    label: "Utilizadores",
    href: "/admin-global/utilizadores/moradores",
    icon: Users,
    children: [
      { label: "Moradores", href: "/admin-global/utilizadores/moradores", icon: UserRound },
      { label: "Agentes", href: "/admin-global/utilizadores/agentes", icon: ShieldCheck },
      { label: "Administradores", href: "/admin-global/utilizadores/administradores", icon: Users },
    ],
  },
  { label: "Empresas", href: "/admin-global/empresas", icon: Building2 },
  { label: "Planos", href: "/admin-global/planos", icon: ClipboardList },
  { label: "Subscrições", href: "/admin-global/subscricoes", icon: WalletCards },
  {
    label: "Finanças",
    href: "/admin-global/financas/receitas",
    icon: CircleDollarSign,
    children: [
      { label: "Receitas", href: "/admin-global/financas/receitas", icon: CircleDollarSign },
      { label: "Pagamentos", href: "/admin-global/financas/pagamentos", icon: WalletCards },
      { label: "Despesas", href: "/admin-global/financas/despesas", icon: FileClock },
    ],
  },
  { label: "Relatórios", href: "/admin-global/relatorios", icon: FileBarChart },
  {
    label: "Monitorização",
    href: "/admin-global/monitorizacao/aplicacao-movel",
    icon: Activity,
    children: [
      { label: "Aplicação móvel", href: "/admin-global/monitorizacao/aplicacao-movel", icon: Gauge },
      { label: "Plataforma Web", href: "/admin-global/monitorizacao/plataforma-web", icon: Globe2 },
    ],
  },
  { label: "Auditoria", href: "/admin-global/auditoria", icon: FileClock },
  { label: "Notificações", href: "/admin-global/notificacoes", icon: Activity },
  { label: "Configurações", href: "/admin-global/configuracoes", icon: Settings },
  { label: "Sobre / Contacto", href: "/admin-global/sobre-contacto", icon: Globe2 },
]

const isGlobalAdmin = (value: unknown) => ["admin-global", "administrador-global", "superadmin"].includes(String(value || "").trim().toLowerCase())
const GLOBAL_ADMIN_EMAIL = "admin@gmail.com"

export function GlobalAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<string[]>(["Utilizadores", "Finanças", "Monitorização"])
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading")
  const [profile, setProfile] = useState({ name: "A carregar...", email: "", initials: "--" })

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setStatus("denied")
        router.replace("/login")
        return
      }

      if (user.email?.trim().toLowerCase() !== GLOBAL_ADMIN_EMAIL) {
        setStatus("denied")
        router.replace("/login")
        return
      }

      const defaultName = user.displayName || "Administrador Global"
      setProfile({
        name: defaultName,
        email: user.email || GLOBAL_ADMIN_EMAIL,
        initials: defaultName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AG",
      })
      setStatus("allowed")

      getDoc(doc(db, "administradoresGlobais", user.uid)).then((snapshot) => {
        if (!snapshot.exists()) return
        const data = snapshot.data()
        if (data.estado === "inativo" || (data.perfil && !isGlobalAdmin(data.perfil))) return
        const name = String(data.nome || defaultName)
        const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
        setProfile({ name, email: String(data.email || user.email || GLOBAL_ADMIN_EMAIL), initials: initials || "AG" })
      }).catch(() => {
        // O acesso já foi validado pelo Firebase Auth; o perfil é apenas complementar.
      })
    })
    return () => {
      unsubscribeAuth()
    }
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success("Sessão terminada com sucesso!")
    router.push("/login")
  }

  if (status === "loading") return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">A verificar o perfil de administrador global...</div>
  if (status === "denied") return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">A redireccionar...</div>

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {menuOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0", menuOpen && "translate-x-0")}>
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-5">
          <Link href="/admin-global/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"><Home className="h-5 w-5 text-primary-foreground" /></div>
            <div><p className="font-bold tracking-wide">SIRCAH</p><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Global control</p></div>
          </Link>
          <button className="lg:hidden" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b border-sidebar-border px-6 py-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Administrador Global</p><p className="mt-1 text-xs text-muted-foreground">Acesso central da plataforma</p></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const hasChildren = Boolean(item.children)
            return <div key={item.label}>
              {hasChildren ? <button onClick={() => setExpanded((current) => current.includes(item.label) ? current.filter((value) => value !== item.label) : [...current, item.label])} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}><span className="flex items-center gap-3"><item.icon className="h-4 w-4" />{item.label}</span><ChevronDown className={cn("h-4 w-4 transition-transform", expanded.includes(item.label) && "rotate-180")} /></button> : <Link onClick={() => setMenuOpen(false)} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}><item.icon className="h-4 w-4" />{item.label}</Link>}
              {hasChildren && expanded.includes(item.label) && <div className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-3">{item.children?.map((child) => <Link key={child.href} onClick={() => setMenuOpen(false)} href={child.href} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors", pathname === child.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><child.icon className="h-3.5 w-3.5" />{child.label}</Link>)}</div>}
            </div>
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/30 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{profile.initials}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="truncate text-xs text-muted-foreground">{profile.email}</p></div></div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" />Terminar sessão</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 sm:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu className="h-5 w-5" /></button><div><p className="text-xs font-medium uppercase tracking-[0.15em] text-primary">Painel global</p><p className="text-sm font-semibold text-foreground">Plataforma independente de gestão</p></div></div></header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
