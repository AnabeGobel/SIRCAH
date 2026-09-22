"use client"

import Link from "next/link"
import { useState } from "react"
import dynamic from "next/dynamic"
import { StatusBadge } from "@/components/status-badge"
import { MapPin, Layers, Search, X, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResidences } from "@/hooks/use-residences"
import type { Residencia } from "@/lib/residence-service"

// Carregamento dinâmico desativando SSR para compatibilidade com a janela (window/document)
const MapaReal = dynamic(() => import("@/components/mapa-real"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando visualização de mapa...</p>
      </div>
    </div>
  ),
})

export default function MapaPage() {
  const {
    filtradas,
    carregando,
    erro,
    termoPesquisa,
    setTermoPesquisa,
    filtroStatus,
    setFiltroStatus,
    recarregar,
    statsBairro,
  } = useResidences()

  const [selectedResidence, setSelectedResidence] = useState<Residencia | null>(null)
  const [modoSatélite, setModoSatélite] = useState(false)

  const limparPesquisa = () => setTermoPesquisa("")

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="page-shell-header h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full z-10">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
              Mapa de Residências (SIRCAH)
            </h1>
          </div>

          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-3 w-full sm:w-auto">
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Map Area */}
          <div className="flex-1 relative z-0">
            {/* Componente Leaflet Real */}
            <MapaReal
              residencias={filtradas}
              selectedResidence={selectedResidence}
              onSelectResidence={setSelectedResidence}
              modoSatélite={modoSatélite}
            />

            {/* Estado: carregando */}
            {carregando && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">A carregar residências...</p>
                </div>
              </div>
            )}

            {/* Estado: erro */}
            {!carregando && erro && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-card border border-border p-6 max-w-sm text-center shadow-lg">
                  <AlertCircle className="h-8 w-8 text-status-rejected" />
                  <p className="text-sm text-foreground">{erro}</p>
                  <Button size="sm" onClick={recarregar}>Tentar novamente</Button>
                </div>
              </div>
            )}

            {/* Estado: sem resultados */}
            {!carregando && !erro && filtradas.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border p-6 text-center pointer-events-auto shadow-lg">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Nenhuma residência encontrada</p>
                  <p className="text-xs text-muted-foreground">
                    {termoPesquisa ? `Para "${termoPesquisa}"` : "Ajuste os filtros de status"}
                  </p>
                </div>
              </div>
            )}

            {/* Controlo de Camadas (Normal / Satélite) */}
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant={modoSatélite ? "default" : "outline"}
                size="sm"
                className="rounded-xl gap-2 bg-card shadow-md"
                onClick={() => setModoSatélite(!modoSatélite)}
              >
                <Layers className="h-4 w-4" />
                {modoSatélite ? "Modo Satélite" : "Modo Vetorial (Rua)"}
              </Button>
            </div>

            {/* Campo de pesquisa */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  placeholder="Buscar por código, morador, telefone ou bairro..."
                  className="pl-9 pr-9 rounded-xl bg-card shadow-md border-border"
                />
                {termoPesquisa && (
                  <button
                    onClick={limparPesquisa}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Resumo do bairro pesquisado */}
              {statsBairro && (
                <div className="mt-2 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-md p-3 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">
                    Bairro {statsBairro.bairro}: {statsBairro.total} residência{statsBairro.total !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-status-approved" />
                      {statsBairro.aprovadas}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-status-pending" />
                      {statsBairro.pendentes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-status-rejected" />
                      {statsBairro.rejeitadas}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Controlo de Filtro por Status */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant={filtroStatus === "todas" ? "default" : "outline"}
                size="sm"
                className="rounded-xl bg-card shadow-md"
                onClick={() => setFiltroStatus("todas")}
              >
                Todas
              </Button>
              <Button
                variant={filtroStatus === "pendente" ? "default" : "outline"}
                size="sm"
                className="rounded-xl bg-card shadow-md"
                onClick={() => setFiltroStatus("pendente")}
              >
                Pendentes
              </Button>
              <Button
                variant={filtroStatus === "aprovado" ? "default" : "outline"}
                size="sm"
                className="rounded-xl bg-card shadow-md"
                onClick={() => setFiltroStatus("aprovado")}
              >
                Aprovadas
              </Button>
            </div>

            {/* Legenda */}
            <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-card/95 backdrop-blur-sm border border-border p-4 shadow-lg">
              <p className="text-xs font-semibold text-foreground mb-3">Legenda</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-status-approved border border-white shadow-sm" />
                  <span className="text-xs text-foreground">Casas Ativas</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-status-pending border border-white shadow-sm" />
                  <span className="text-xs text-foreground">Pedidos Novos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-status-rejected border border-white shadow-sm" />
                  <span className="text-xs text-foreground">Rejeitadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Painel lateral da residência selecionada */}
          {selectedResidence && (
            <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto z-20 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-foreground">Detalhes</h2>
                  <button
                    onClick={() => setSelectedResidence(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {selectedResidence.foto_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={selectedResidence.foto_url}
                      alt={selectedResidence.rua}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <p className="font-medium text-foreground">
                    {selectedResidence.codigo}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {[selectedResidence.rua, selectedResidence.bairro].filter(Boolean).join(", ") || "Endereço não informado"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <StatusBadge status={selectedResidence.status} />
                </div>

                <div className="rounded-xl bg-muted/50 p-3 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Morador</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedResidence.nome_morador || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedResidence.telefone || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Coordenadas GPS</p>
                  <p className="text-sm font-mono text-foreground mt-1">
                    {selectedResidence.coordenadas.lat.toFixed(6)},{" "}
                    {selectedResidence.coordenadas.lng.toFixed(6)}
                  </p>
                </div>

                {selectedResidence.descricao && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedResidence.descricao}
                    </p>
                  </div>
                )}

                {selectedResidence.criadoEm && (
                  <p className="text-xs text-muted-foreground">
                    Registado em {selectedResidence.criadoEm.toLocaleDateString("pt-PT")}
                  </p>
                )}

                <Link
                  href={`/residencias/${selectedResidence.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Detalhes Completos
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}