"use client"

import { useState } from "react"
import { usePathname } from "next/navigation" // 👈 Importamos o hook para ler a rota atual
import { Sidebar } from "@/components/sidebar"
import { Menu, X, Home } from "lucide-react"

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname() // 👈 Guarda a rota atual (ex: "/login", "/dashboard", "/bem-vindo")

  // 🌍 DEFINIÇÃO DE ROTAS PÚBLICAS
  // Se a rota for a raiz "/" ou a página de boas-vindas, não mostramos os menus de gestão
  const isPublicPage = pathname === "/" || pathname === "/bem-vindo" || pathname === "/sobre" || pathname === "/contacto" || pathname === "/login" || pathname === "/recuperar-senha"

  if (pathname.startsWith("/admin-global")) {
    return <div className="w-full min-h-screen bg-background">{children}</div>
  }

  // Se for uma página pública, renderiza o conteúdo limpo (100% da largura do ecrã)
  if (isPublicPage) {
    return <div className="w-full min-h-screen bg-background">{children}</div>
  }

  // 🔐 CASO CONTRÁRIO: Renderiza a estrutura completa do Dashboard Responsivo
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-background text-foreground">
      
      {/* BARRA SUPERIOR MOBILE - Só visível em telemóveis */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border h-16 shrink-0 z-50 w-full">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground text-sm">SIRCAH</span>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* OVERLAY ESCURO - Fecha ao clicar fora */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* CONTENDOR DA SIDEBAR COM CORREÇÃO DE POSICIONAMENTO FIXO NO MOBILE */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out 
        md:relative md:transform-none md:flex shrink-0 h-full
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="w-full h-full flex flex-col" onClick={() => setIsMobileMenuOpen(false)}>
          <Sidebar />
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL COM SCROLL INDEPENDENTE */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
        {children}
      </main>
    </div>
  )
}