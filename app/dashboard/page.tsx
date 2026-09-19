"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { StatsCards } from "@/components/stats-cards"
import { ResidencesTable, type Residence } from "@/components/residences-table"
import { ResidenceDetailPanel } from "@/components/residence-detail-panel"
import { QRCodeModal } from "@/components/qr-code-modal"
import { RejectModal } from "@/components/reject-modal"
import { JustificationDetailsModal } from "@/components/justification-details-modal"
import { 
  buscarResidencias, 
  aprovarResidencia, 
  rejeitarResidencia 
} from "@/lib/residencia/residenciaService"
import { obterAnexoJustificacao, obterJustificativaReenvio, obterNomeComprovativo } from "@/lib/residencia/residenciaService"
import { Bell, Search, Loader2, CheckCircle2, XCircle, FilePlus, ChevronRight, MapPin, Activity, MessageSquare, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Carregamento dinâmico sem SSR para compatibilidade do Leaflet no Next.js
const MapaReal = dynamic(() => import("@/components/mapa-real"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/20 text-xs text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Carregando mapa...
    </div>
  ),
})

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tempo: string
  tipo: "registos" | "validacoes" | "rejeicoes"
  icone: "registo" | "aprovado" | "rejeitada"
}

export default function DashboardPage() {
  const router = useRouter()
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showJustificationModal, setShowJustificationModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<Residence | null>(null)
  const [selectedJustification, setSelectedJustification] = useState<Residence | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>("")

  // ── Estados do Popover de Notificações ──────────────────────────────────────
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true)
      const dados = await buscarResidencias()

      const formatados = dados.map((d: any) => ({
        id: d.id,
        proprietario: d.nome_morador || d.proprietario || "Não identificado",
        endereco: d.endereco || "Huambo",
        bairro: d.bairro || "S/B",
        rua: d.rua || "",
        criadoEm: d.criadoEm || d.dataRegisto || null,
        dataRegisto: d.dataRegisto || "Recentemente",
        status: d.status as "pendente" | "aprovado" | "rejeitada",
        coordenadas: {
          lat: d.coordenadas?.latitude ?? d.coordenadas?.lat ?? -12.77,
          lng: d.coordenadas?.longitude ?? d.coordenadas?.lng ?? 15.73
        },
        foto_url: d.foto || d.foto_url || d.imagem_url || "",
        codigo: d.codigo || "",
        contacto: d.contacto || "-"
        , motivoRejeicao: d.motivoRejeicao || ""
        , comentarioJustificativa: obterJustificativaReenvio(d)
        , comprovativoNome: obterNomeComprovativo(d)
        , comprovativoUrl: d.comprovativoUrl || ""
        , justificativaReenvio: obterJustificativaReenvio(d)
        , anexoJustificacao: obterAnexoJustificacao(d)
      }))

      setResidences(formatados)

      // ── Gerar Notificações Automáticas com base nos Dados Reais ──────────
      const listaNotif: Notificacao[] = []

      dados.slice(0, 10).forEach((item: any) => {
        const codigoFormatado = item.codigo || "Sem código"

        const justificativa = obterJustificativaReenvio(item)
        if (justificativa && item.status === "pendente") {
          listaNotif.push({
            id: `notif-reenvio-${item.id}-${item.editadoEm?.seconds || "atual"}`,
            titulo: "Cadastro reenviado para revisão",
            mensagem: `Residência [${codigoFormatado}]: ${justificativa}${obterAnexoJustificacao(item) ? " Anexo de justificação enviado para análise." : ""}`,
            tempo: "Aguardando revisão",
            tipo: "registos",
            icone: "registo"
          })
          return
        }

        if (item.status === "pendente") {
          listaNotif.push({
            id: `notif-reg-${item.id}`,
            titulo: "Novo Registo Pendente",
            mensagem: `Habitação de ${item.nome_morador || "Morador"} em ${item.bairro || "Huambo"} aguarda validação.`,
            tempo: "Recente",
            tipo: "registos",
            icone: "registo"
          })
        } else if (item.status === "aprovado") {
          listaNotif.push({
            id: `notif-app-${item.id}`,
            titulo: "Registo Aprovado",
            mensagem: `Residência [${codigoFormatado}] foi validada e o QR Code gerado.`,
            tempo: "Concluído",
            tipo: "validacoes",
            icone: "aprovado"
          })
        } else if (item.status === "rejeitada") {
          listaNotif.push({
            id: `notif-rej-${item.id}`,
            titulo: "Registo Rejeitado",
            mensagem: `Processo [${codigoFormatado}] foi recusado no sistema.`,
            tempo: "Recusado",
            tipo: "rejeicoes",
            icone: "rejeitada"
          })
        }
      })

      setNotificacoes(listaNotif)
    } catch (error) {
      console.error("Erro no Dashboard SIRCAH:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDadosDashboard()
  }, [])

  const stats = {
    total: residences.length,
    pendentes: residences.filter(r => r.status === "pendente").length,
    aprovadas: residences.filter(r => r.status === "aprovado").length,
    rejeitadas: residences.filter(r => r.status === "rejeitada").length,
  }

  const pendingResidences = residences.filter((r) => r.status === "pendente")
  const justificationResidences = residences.filter((r) => r.justificativaReenvio || r.anexoJustificacao)

  const bairros = residences.reduce<Record<string, number>>((acc, residence) => {
    const bairro = residence.bairro || "Sem bairro"
    acc[bairro] = (acc[bairro] || 0) + 1
    return acc
  }, {})

  const bairrosOrdenados = Object.entries(bairros).sort(([, totalA], [, totalB]) => totalB - totalA)
  const activityItems = residences.slice(0, 3).map((residence) => ({
    residence,
    title: residence.status === "aprovado"
      ? `Residência ${residence.codigo || residence.id} aprovada`
      : residence.status === "rejeitada"
        ? `Registo ${residence.codigo || residence.id} rejeitado`
        : `Novo registo ${residence.codigo || residence.id} submetido`,
    statusLabel: residence.status === "aprovado" ? "Aprovada" : residence.status === "rejeitada" ? "Rejeitada" : "Pendente",
  }))

  const handleView = (residence: Residence) => {
    router.push(`/residencias/${residence.id}`)
  }

  // ── Aprovação e Geração do Código/QR Code ──────────────────────────────
  const handleApprove = async (residence: Residence) => {
    try {
      const resultado = await aprovarResidencia(residence.id)
      const codigoGerado = resultado?.novoCodigo || residence.codigo || residence.id
      
      setGeneratedCode(codigoGerado)
      setPendingAction(residence)
      setShowQRModal(true)
    } catch (error) {
      console.error("Erro ao aprovar residência:", error)
      alert("Falha ao aprovar o registo. Tente novamente.")
    }
  }

  // ── Abertura do Modal de Rejeição ─────────────────────────────────────
  const handleReject = (residence: Residence) => {
    setPendingAction(residence)
    setShowRejectModal(true)
  }

  const confirmApprove = () => {
    carregarDadosDashboard()
    setShowQRModal(false)
    setSelectedResidence(null)
    setPendingAction(null)
    setGeneratedCode("")
  }

  // ── Confirmação de Rejeição com Motivo ───────────────────────────────
  const confirmReject = async (reason: string) => {
    if (!pendingAction) return

    try {
      await rejeitarResidencia(pendingAction.id, reason)
      await carregarDadosDashboard()
    } catch (error) {
      console.error("Erro ao rejeitar residência:", error)
      alert("Falha ao rejeitar o registo.")
    } finally {
      setShowRejectModal(false)
      setSelectedResidence(null)
      setPendingAction(null)
    }
  }

  const irParaHistoricoComFiltro = (tipoFiltro: string) => {
    setNotificationsOpen(false)
    router.push(`/historico?filtro=${tipoFiltro}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="page-shell-header h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">Dashboard</h1>
          </div>

          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial w-full max-w-[200px] sm:max-w-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>

            {/* Dropdown de Notificações */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 relative shrink-0 rounded-xl hover:bg-muted"
                onClick={() => setNotificationsOpen((prev) => !prev)}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notificacoes.length > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse" />
                )}
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm text-foreground">Notificações</h3>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {notificacoes.length} recentes
                    </span>
                  </div>

                  {justificationResidences.length > 0 && (
                    <div className="border-b border-border bg-status-pending/5">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div>
                          <h3 className="text-xs font-semibold text-foreground">Justificativas dos moradores</h3>
                          <p className="text-[10px] text-muted-foreground">Reenvios aguardando consulta da equipa</p>
                        </div>
                        <span className="rounded-full bg-status-pending/10 px-2 py-0.5 text-[10px] font-medium text-status-pending">
                          {justificationResidences.length}
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-border/70">
                        {justificationResidences.slice(0, 5).map((residence) => (
                          <button
                            key={`justification-${residence.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedJustification(residence)
                              setShowJustificationModal(true)
                              setNotificationsOpen(false)
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-pending/10 text-status-pending">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-foreground">{residence.proprietario}</p>
                              <p className="truncate text-[10px] text-muted-foreground">{residence.codigo || residence.bairro || "Residência sem código"}</p>
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-foreground/80">{residence.justificativaReenvio || "Anexo enviado sem comentário"}</p>
                            </div>
                            {residence.anexoJustificacao && <Paperclip className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Possui anexo" />}
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
                    {notificacoes.length > 0 ? (
                      notificacoes.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => irParaHistoricoComFiltro(item.tipo)}
                          className="w-full text-left p-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 group"
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.icone === "registo" && (
                              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <FilePlus className="h-4 w-4" />
                              </div>
                            )}
                            {item.icone === "aprovado" && (
                              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            )}
                            {item.icone === "rejeitada" && (
                              <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                                <XCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {item.titulo}
                              </p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {item.tempo}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.mensagem}
                            </p>
                          </div>
                          
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground shrink-0 self-center" />
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        Nenhuma notificação recente.
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-border bg-muted/20 text-center">
                    <button
                      onClick={() => irParaHistoricoComFiltro("todos")}
                      className="text-xs font-medium text-primary hover:underline py-1 w-full"
                    >
                      Ver todo o histórico de rastreabilidade →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div data-dashboard-content className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Bem-vindo de volta, Admin
                </h2>
                <p className="text-muted-foreground mt-1">
                  Resumo em tempo real do SIRCAH Huambo
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <StatsCards
                    total={stats.total}
                    pendentes={stats.pendentes}
                    aprovadas={stats.aprovadas}
                    rejeitadas={stats.rejeitadas}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Registos Pendentes Recentes
                      </h3>
                      <Link href="/residencias/pendentes">
                        <Button variant="outline" className="rounded-xl">
                          Ver Todos
                        </Button>
                      </Link>
                    </div>
                    <ResidencesTable
                      residences={pendingResidences.slice(0, 5)}
                      onView={handleView}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <section className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
                        </div>
                        <Link href="/historico" className="text-xs font-medium text-primary hover:underline">Ver histórico</Link>
                      </div>
                      <div className="divide-y divide-border">
                        {activityItems.length > 0 ? activityItems.map(({ residence, title, statusLabel }) => (
                          <div key={residence.id} className="flex items-center gap-3 px-5 py-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${residence.status === "aprovado" ? "bg-status-approved/10 text-status-approved" : residence.status === "rejeitada" ? "bg-status-rejected/10 text-status-rejected" : "bg-status-pending/10 text-status-pending"}`}>
                              {residence.status === "aprovado" ? <CheckCircle2 className="h-4 w-4" /> : residence.status === "rejeitada" ? <XCircle className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{title}</p>
                              <p className="text-xs text-muted-foreground truncate">{residence.proprietario} · {residence.bairro}</p>
                            </div>
                            <span className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${residence.status === "aprovado" ? "bg-status-approved/10 text-status-approved" : residence.status === "rejeitada" ? "bg-status-rejected/10 text-status-rejected" : "bg-status-pending/10 text-status-pending"}`}>{statusLabel}</span>
                          </div>
                        )) : <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ainda não existem atividades.</p>}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">Mapa de Residências</h3>
                        </div>
                        <Link href="/mapa" className="text-xs font-medium text-primary hover:underline">Ver mapa completo</Link>
                      </div>
                      <div className="relative h-56 w-full overflow-hidden">
                        <MapaReal
                          residencias={residences as any}
                          selectedResidence={selectedResidence as any}
                          onSelectResidence={(res) => setSelectedResidence(res as any)}
                          modoSatélite={false}
                        />
                      </div>
                    </section>
                  </div>

                  <section className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><h3 className="font-semibold text-foreground">Resumo por Bairro</h3></div>
                      <span className="text-xs text-muted-foreground">{bairrosOrdenados.length} bairros</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
                      {bairrosOrdenados.slice(0, 4).map(([bairro, total]) => (
                        <div key={bairro} className="px-5 py-4 flex items-center justify-between gap-4"><div className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-full bg-chart-1 shrink-0" /><span className="text-sm text-foreground truncate">{bairro}</span></div><span className="text-lg font-semibold text-foreground">{total}</span></div>
                      ))}
                      {bairrosOrdenados.length === 0 && <p className="col-span-full px-5 py-8 text-center text-sm text-muted-foreground">Ainda não existem bairros registados.</p>}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          {selectedResidence && (
            <ResidenceDetailPanel
              residence={selectedResidence}
              onClose={() => setSelectedResidence(null)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>
      </main>

      {/* Modais com integração dos códigos reais */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={confirmApprove}
        residenceCode={generatedCode}
      />

      {pendingAction && (
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setPendingAction(null)
          }}
          onConfirm={confirmReject}
          residenceCode={pendingAction.codigo || pendingAction.id}
        />
      )}

      <JustificationDetailsModal
        isOpen={showJustificationModal}
        residence={selectedJustification}
        onClose={() => {
          setShowJustificationModal(false)
          setSelectedJustification(null)
        }}
      />
    </div>
  )
}