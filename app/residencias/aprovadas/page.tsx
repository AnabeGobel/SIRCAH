"use client"

import { useState, useEffect } from "react"

import { ResidencesTable, type Residence } from "@/components/residences-table"
import { ResidenceDetailPanel } from "@/components/residence-detail-panel"
// Importamos o serviço de busca (certifique-se que buscarResidenciasAprovadas existe no seu service)
import { buscarResidencias } from "@/lib/residencia/residenciaService"
import { Search, Download, Loader2, AlertCircle } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/Services/firebaseConfig"

export default function AprovadasPage() {
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null)

  // Função para carregar dados reais do Firebase
const carregarAprovadas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // AQUI ESTÁ A CHAVE: Usar o teu serviço que já conhece a lógica do SIRCAH
      // Certifica-te que no teu service esta função filtra por status 'aprovada'
      const dadosReais = await buscarResidencias() 

      const formatados: Residence[] = dadosReais
        // Filtramos apenas as aprovadas para garantir que esta página não mostre pendentes
        .filter((d: any) => d.status === "aprovado")
        .map((d: any) => ({
          id: d.id,
          proprietario: d.nome_morador || d.proprietario || "Não identificado",
          endereco: d.endereco || "Huambo",
          bairro: d.bairro || "S/B",
          rua: d.rua || "",
          criadoEm: d.criadoEm || d.dataRegisto || "Data pendente",
          status: "aprovado" as const,
          coordenadas: {
            lat: Number(d.coordenadas?.latitude ?? d.coordenadas?.lat ?? -12.77),
            lng: Number(d.coordenadas?.longitude ?? d.coordenadas?.lng ?? 15.73)
          },
          foto_url: d.foto_url || d.foto || d.imagem_url || "", 
          codigo: d.codigo || "",
          contacto: d.contacto || ""
        }))

      setResidences(formatados)
    } catch (err) {
      console.error("Erro ao carregar do serviço:", err)
      setError("O serviço de residências não respondeu corretamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAprovadas()
  }, [])

  return (
    <div className="flex h-screen bg-background">
     
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
      <header className="page-shell-header h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
  {/* Lado Esquerdo: Título e Contador (Badge) */}
  {/* Oculto no mobile (hidden) e visível a partir de computadores (sm:flex) */}
  <div className="hidden sm:flex items-center gap-4">
    <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
      Residências Aprovadas
    </h1>
    {!loading && (
      <span className="px-2.5 py-1 rounded-full bg-status-approved/20 text-status-approved text-xs font-medium whitespace-nowrap">
        {residences.length} aprovadas
      </span>
    )}
  </div>

  {/* Lado Direito: Pesquisa, Exportação e Notificações */}
  {/* No mobile, flex-1 e justify-end fazem com que os elementos ocupem o topo de forma organizada */}
  <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
    
    {/* Campo de Pesquisa Fluido com limite máximo de tamanho */}
    <div className="relative flex-1 sm:flex-initial w-full max-w-[180px] sm:max-w-none sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Pesquisar..."
        className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
    
    {/* Botão Exportar - Esconde o texto em ecrãs muito pequenos para não quebrar a linha */}
    <Button variant="outline" className="rounded-xl gap-2 shrink-0 h-10 px-3 sm:px-4 cursor-pointer">
      <Download className="h-4 w-4" />
      <span className="hidden xs:inline">Exportar</span>
    </Button>
    
    {/* Botão Notificações */}
    <NotificationBell />
  </div>
</header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              
              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Banner */}
              {!loading && (
                <div className="rounded-2xl bg-status-approved/10 border border-status-approved/20 p-4">
                  <p className="text-sm text-foreground">
                    Estas são todas as residências que foram{" "}
                    <span className="font-semibold text-status-approved">aprovadas</span> e
                    estão ativas no sistema SIRCAH.
                  </p>
                </div>
              )}

              {/* Loading e Tabela */}
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>A carregar registos aprovados...</p>
                </div>
              ) : residences.length > 0 ? (
                <ResidencesTable
                  residences={residences}
                  showActions={true}
                  onView={setSelectedResidence}
                />
              ) : (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Nenhum registo</h3>
                  <p className="text-muted-foreground mt-2">Ainda não existem residências aprovadas no sistema.</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedResidence && (
            <ResidenceDetailPanel
              residence={selectedResidence}
              onClose={() => setSelectedResidence(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}