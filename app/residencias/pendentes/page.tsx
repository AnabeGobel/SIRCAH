"use client"

import { useState, useEffect } from "react"
import { ResidencesTable, type Residence } from "@/components/residences-table"
import { ResidenceDetailPanel } from "@/components/residence-detail-panel"
import { QRCodeModal } from "@/components/qr-code-modal"
import { RejectModal } from "@/components/reject-modal"
import { 
  buscarResidenciasPendentes, 
  aprovarResidencia, 
  rejeitarResidencia 
} from "@/lib/residencia/residenciaService"
import { obterAnexoJustificacao, obterJustificativaReenvio } from "@/lib/residencia/residenciaService"
import { Search, Filter, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"

export default function PendentesPage() {
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null)
  
  // Modais e Item Selecionado
  const [showQRModal, setShowQRModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<Residence | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>("")

  const carregarResidencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const dadosReais = await buscarResidenciasPendentes()
      setResidences(
        dadosReais.map((d: any) => ({
          id: d.id,
          proprietario: d.nome_morador || d.proprietario || "Não identificado",
          endereco: d.endereco || "Huambo, Angola",
          bairro: d.bairro || "S/B",
          rua: d.rua || "",
          criadoEm: d.criadoEm || d.dataRegisto || null,
          status: "pendente" as const,
          coordenadas: {
            lat: d.coordenadas?.latitude ?? d.coordenadas?.lat ?? -12.77,
            lng: d.coordenadas?.longitude ?? d.coordenadas?.lng ?? 15.73,
          },
          foto_url: d.foto_url || d.foto || "",
          codigo: d.codigo || "",
          contacto: d.telefone || d.contacto || "",
          justificativaReenvio: obterJustificativaReenvio(d),
          anexoJustificacao: obterAnexoJustificacao(d),
        }))
      )
    } catch {
      setError("Falha ao carregar dados do Firebase.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarResidencias()
  }, [])

  const handleView = (r: Residence) => setSelectedResidence(r)

  // ── 1. Disparar Ação de Aprovação ──────────────────────────────────────
  const handleApprove = async (r: Residence) => {
    try {
      // Chama o backend para aprovar e gerar o código SIRCAH
      const resultado = await aprovarResidencia(r.id)
      
      const novoCodigo = resultado?.novoCodigo || resultado?.codigo || r.id
      setGeneratedCode(novoCodigo)
      setPendingAction(r)
      setShowQRModal(true)

      // Remove imediatamente da lista local de pendentes
      setResidences((prev) => prev.filter((item) => item.id !== r.id))
      
      // Se o item aprovado estava aberto no painel lateral, fecha o painel
      if (selectedResidence?.id === r.id) {
        setSelectedResidence(null)
      }
    } catch (err) {
      console.error("Erro ao aprovar residência:", err)
      alert("Falha ao aprovar o registo. Tente novamente.")
    }
  }

  // ── 2. Abrir Modal de Rejeição ──────────────────────────────────────────
  const handleReject = (r: Residence) => {
    setPendingAction(r)
    setShowRejectModal(true)
  }

  // ── 3. Confirmar Rejeição do Modal ──────────────────────────────────────
  const confirmReject = async (reason: string) => {
    if (!pendingAction) return

    try {
      await rejeitarResidencia(pendingAction.id, reason)

      // Remove da lista local
      setResidences((prev) => prev.filter((item) => item.id !== pendingAction.id))
      
      if (selectedResidence?.id === pendingAction.id) {
        setSelectedResidence(null)
      }
    } catch (err) {
      console.error("Erro ao rejeitar residência:", err)
      alert("Falha ao rejeitar o registo.")
    } finally {
      setShowRejectModal(false)
      setPendingAction(null)
    }
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false)
    setPendingAction(null)
    setGeneratedCode("")
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="page-shell-header h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
              Registos Pendentes
            </h1>
            {!loading && (
              <span className="px-2.5 py-1 rounded-full bg-status-pending/20 text-status-pending text-xs font-medium">
                {residences.length} pendentes
              </span>
            )}
          </div>
          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial w-full max-w-[180px] sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" className="rounded-xl gap-2 shrink-0 h-10 px-3 cursor-pointer">
              <Filter className="h-4 w-4" />
              <span className="hidden xs:inline">Filtrar</span>
            </Button>
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {!loading && residences.length > 0 && (
              <div className="rounded-2xl bg-status-pending/10 border border-status-pending/20 p-4">
                <p className="text-sm text-foreground">
                  <strong>Atenção:</strong> Existem{" "}
                  <span className="font-semibold text-status-pending">
                    {residences.length} residências
                  </span>{" "}
                  aguardando revisão.
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>A carregar...</p>
              </div>
            ) : residences.length > 0 ? (
              <ResidencesTable
                residences={residences}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-status-approved/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Tudo em dia!</h3>
                <p className="text-muted-foreground mt-2">Não existem residências pendentes.</p>
              </div>
            )}
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

      {/* Modais de Fluxo */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={handleCloseQRModal}
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
    </div>
  )
}