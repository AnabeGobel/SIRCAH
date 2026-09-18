"use client"
import { useState, useEffect } from "react"
import { ResidencesTable, type Residence } from "@/components/residences-table"
import { ResidenceDetailPanel } from "@/components/residence-detail-panel"
import { buscarResidencias, alterarEstadoResidencia } from "@/lib/residencia/residenciaService"
import { ChangeStatusModal } from "@/components/change-status-modal"
import { Bell, Search, Plus, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"

export default function TodasResidenciasPage() {
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusAction, setStatusAction] = useState<{ residence: Residence; nextState: "valido" | "invalido" } | null>(null)

  const carregarTodas = async () => {
    try {
      setLoading(true); setError(null)
      const dados = await buscarResidencias()
      setResidences(dados.map((d: any) => ({
        id:           d.id,
        proprietario: d.nome_morador  || d.proprietario || "Não identificado",
        endereco:     d.endereco      || "Huambo",
        bairro:       d.bairro        || "S/B",
        rua:          d.rua           || "",
        criadoEm:     d.criadoEm      || d.dataRegisto || null,
        status:       d.status as "pendente" | "aprovado" | "rejeitada",
        estadoResidencia: d.estadoResidencia || "valido",
        mensagemEstado: d.mensagemEstado || "",
        coordenadas: {
          lat: d.coordenadas?.latitude  ?? d.coordenadas?.lat  ?? -12.77,
          lng: d.coordenadas?.longitude ?? d.coordenadas?.lng  ?? 15.73,
        },
        foto_url:  d.foto_url  || d.foto || "",
        codigo:    d.codigo    || "",
        contacto:  d.telefone  || d.contacto || "",
      })))
    } catch { setError("Falha ao conectar com o banco de dados do SIRCAH.") }
    finally   { setLoading(false) }
  }

  useEffect(() => { carregarTodas() }, [])

  const filteredResidences = residences.filter((r) => {
    const matchesStatus = filterStatus === "todas" || r.status === filterStatus
    const matchesSearch =
      r.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.codigo && r.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.bairro.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleApprove = () => { carregarTodas(); setSelectedResidence(null) }
  const handleReject  = () => { carregarTodas(); setSelectedResidence(null) }
  const handleToggleStatus = (residence: Residence) => {
    setStatusAction({
      residence,
      nextState: residence.estadoResidencia === "invalido" ? "valido" : "invalido",
    })
  }
  const confirmStatusChange = async (message: string) => {
    if (!statusAction) return
    try {
      await alterarEstadoResidencia(statusAction.residence.id, statusAction.nextState, message)
      setStatusAction(null)
      await carregarTodas()
    } catch (error) {
      console.error("Erro ao alterar estado da residência:", error)
      alert("Falha ao alterar o estado da residência.")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">Base de Dados Geral</h1>
            {!loading && <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{residences.length} registos</span>}
          </div>
          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial w-full max-w-[200px] sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90 shrink-0 h-10 text-sm px-3 sm:px-4 cursor-pointer"><Plus className="h-4 w-4" /><span className="hidden xs:inline">Nova Residência</span></Button>
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 text-destructive"><AlertCircle className="h-5 w-5" /><p className="text-sm font-medium">{error}</p></div>}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "todas",    label: "Todos",      color: "bg-slate-500" },
                { id: "aprovado", label: "Aprovados",  color: "bg-status-approved" },
                { id: "pendente", label: "Pendentes",  color: "bg-status-pending" },
                { id: "rejeitada",label: "Rejeitados", color: "bg-status-rejected" },
              ].map((pill) => (
                <button key={pill.id} onClick={() => setFilterStatus(pill.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === pill.id ? `${pill.color} text-white shadow-md scale-105` : "bg-card border border-border text-foreground hover:bg-muted"}`}>
                  {pill.id !== "todas" && <span className={`w-2 h-2 rounded-full ${pill.color} border border-white/20`} />}
                  {pill.label}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" /><p>A carregar...</p></div>
            ) : filteredResidences.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <ResidencesTable residences={filteredResidences} onView={(r) => setSelectedResidence(r)} onApprove={handleApprove} onReject={handleReject} onToggleStatus={handleToggleStatus} />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-20 text-center"><p className="text-muted-foreground">Nenhum registo encontrado.</p></div>
            )}
          </div>
          {selectedResidence && (
            <ResidenceDetailPanel residence={selectedResidence} onClose={() => setSelectedResidence(null)} onApprove={handleApprove} onReject={handleReject} />
          )}
        </div>
      </main>
      {statusAction && (
        <ChangeStatusModal
          isOpen={Boolean(statusAction)}
          onClose={() => setStatusAction(null)}
          onConfirm={confirmStatusChange}
          residenceCode={statusAction.residence.codigo || statusAction.residence.id}
          nextState={statusAction.nextState}
        />
      )}
    </div>
  )
}
