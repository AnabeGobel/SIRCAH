"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { Timeline, type TimelineEvent } from "@/components/timeline"
import { Search, Calendar, Loader2 } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buscarResidencias } from "@/lib/residencia/residenciaService"

function HistoricoConteudo() {
  const searchParams = useSearchParams()
  const filtroURL = searchParams.get("filtro")

  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("todos")

  // Atualizar filtro de acordo com a URL
  useEffect(() => {
    if (filtroURL) {
      setFilterType(filtroURL)
    }
  }, [filtroURL])

  const formatarFirebaseData = (timestamp: any) => {
    if (!timestamp) return { data: "Data pendente", hora: "--:--", iso: "" }
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return {
      data: date.toLocaleDateString("pt-PT"),
      hora: date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      iso: date.toISOString()
    }
  }

  useEffect(() => {
    const carregarHistoricoReal = async () => {
      try {
        setLoading(true)
        const residencias = await buscarResidencias()
        
        const todosEventos: any[] = []

        residencias.forEach((res: any) => {
          const criado = formatarFirebaseData(res.criadoEm)
          todosEventos.push({
            data: criado.data,
            hora: criado.hora,
            evento: `Novo registo enviado - ${res.id.substring(0, 8)}`,
            tipo: "registo",
            agente: res.agente_nome || "Agente de Campo",
            sortRef: criado.iso
          })

          if (res.status === "aprovado" && res.aprovadoEm) {
            const aprovado = formatarFirebaseData(res.aprovadoEm)
            todosEventos.push({
              data: aprovado.data,
              hora: aprovado.hora,
              evento: `Residência Validada - ${res.codigo || res.id.substring(0, 8)}`,
              tipo: "validacao",
              agente: "Sistema Admin",
              sortRef: aprovado.iso
            })

            todosEventos.push({
              data: aprovado.data,
              hora: aprovado.hora,
              evento: `QR Code Ativado - ${res.codigo || res.id.substring(0, 8)}`,
              tipo: "qrcode",
              agente: "Sistema SIRCAH",
              sortRef: aprovado.iso
            })
          }

          if (res.status === "rejeitada") {
            const criadoFallback = formatarFirebaseData(res.criadoEm)
            todosEventos.push({
              data: criadoFallback.data,
              hora: "",
              evento: `Residência Rejeitada - ${res.id.substring(0, 8)}`,
              tipo: "rejeitado",
              agente: "Sistema Admin",
              sortRef: criadoFallback.iso
            })
          }
        })

        const ordenados = todosEventos.sort((a, b) => {
          const dateA = a.sortRef || ""
          const dateB = b.sortRef || ""
          return dateB.localeCompare(dateA)
        })

        setEvents(ordenados)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarHistoricoReal()
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.evento.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.agente?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterType === "todos" ||
      (filterType === "registos" && event.tipo === "registo") ||
      (filterType === "validacoes" && event.tipo === "validacao") ||
      (filterType === "qrcodes" && event.tipo === "qrcode") ||
      (filterType === "rejeicoes" && event.tipo === "rejeitado")

    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Histórico de Rastreabilidade</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar no histórico real..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 rounded-xl bg-card border-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "todos", label: "Todos" },
                { id: "registos", label: "Registos" },
                { id: "validacoes", label: "Validações" },
                { id: "qrcodes", label: "QR Codes" },
                { id: "rejeicoes", label: "Rejeições" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filterType === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="bg-card rounded-[24px] border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Linha do Tempo</h2>
                  <p className="text-sm text-muted-foreground">
                    {loading ? "A carregar eventos..." : `${filteredEvents.length} eventos encontrados`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <Timeline events={filteredEvents} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum registo real encontrado no Huambo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HistoricoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">A carregar histórico...</span>
      </div>
    }>
      <HistoricoConteudo />
    </Suspense>
  )
}