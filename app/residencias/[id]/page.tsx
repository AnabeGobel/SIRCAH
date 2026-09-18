"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, User, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { StatusBadge } from "@/components/status-badge"
import { Timeline, type TimelineEvent } from "@/components/timeline"
import { QRCodeModal } from "@/components/qr-code-modal"
import { RejectModal } from "@/components/reject-modal"
import { db } from "@/lib/Services/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { rejeitarResidencia } from "@/lib/residencia/residenciaService"
import { obterAnexoJustificacao } from "@/lib/residencia/residenciaService"

export default function ResidenceReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [residence, setResidence] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Carregar dados reais do documento específico
  useEffect(() => {
    const carregarDetalhes = async () => {
      try {
        setLoading(true)
        if (!params.id) return

        const docRef = doc(db, "residencias", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const dados = docSnap.data()
          
          // TRATAMENTO DE DADOS REAIS DO FIREBASE
          setResidence({
            id: docSnap.id,
            ...dados,
            // 1. Mapeamento do Nome (priorizando o campo do mobile)
            proprietario: dados.nome_morador || dados.proprietario || "Não identificado",
            
            // 2. Tratamento do GeoPoint (latitude/longitude do Firebase)
            coordenadas: {
              lat: dados.coordenadas?.latitude ?? dados.coordenadas?.lat ?? -12.77,
              lng: dados.coordenadas?.longitude ?? dados.coordenadas?.lng ?? 15.73
            },
            
            // 3. Normalização da Foto
            foto: dados.foto || dados.foto_url || dados.imagem_url || "",
            foto_url: dados.foto_url || dados.foto || dados.imagem_url || "",
            
            // 4. Fallbacks de segurança
            endereco: dados.endereco || "Endereço não disponível",
            bairro: dados.bairro || "Huambo",
            dataRegisto: dados.dataRegisto || "Data não registada",
            status: dados.status || "pendente"
            , justificativaReenvio: dados.justificativaReenvio || dados.justificativa || dados.mensagemReenvio || dados.justificativaEdicao || ""
            , anexoJustificacao: obterAnexoJustificacao(dados)
          })
        }
      } catch (error) {
        console.error("Erro ao carregar residência no SIRCAH:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDetalhes()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
     
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!residence) {
    return (
      <div className="flex min-h-screen bg-background">

        <main className="flex-1 p-8 text-center mt-20">
          <p className="text-muted-foreground">Residência não encontrada no sistema SIRCAH.</p>
          <Button onClick={() => router.back()} variant="link">Voltar</Button>
        </main>
      </div>
    )
  }

  const handleApprove = () => setShowQRModal(true)
  const handleReject = () => setShowRejectModal(true)

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejeitarResidencia(residence.id, reason)
      setShowRejectModal(false)
      router.push("/residencias/pendentes")
    } catch (error) {
      console.error("Erro ao rejeitar residência:", error)
      alert("Falha ao rejeitar o registo. Tente novamente.")
    }
  }

  // Histórico adaptado para os dados reais (se não houver no banco, usamos um fallback)
  const realTimeline: TimelineEvent[] = residence.historico || [
    {
      data: residence.dataRegisto || "Recentemente",
      hora: "",
      evento: "Registo capturado via mobile",
      tipo: "registo",
      agente: "Agente de Campo",
    }
  ]

  // Função para tratar a data do Firebase
const formatarData = (data: any) => {
  if (!data) return "Data não disponível";
  
  // Se for um Timestamp do Firebase (objeto com seconds)
  if (data.seconds) {
    return new Date(data.seconds * 1000).toLocaleDateString("pt-PT");
  }
  
  // Se já for string ou Date
  return String(data);
};

  return (
    <div className="flex min-h-screen bg-background">
  

      <main className="flex-1 p-8 overflow-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Revisão Técnica</h1>
            <p className="text-sm text-muted-foreground mt-1 uppercase tracking-tighter">
              ID: {residence.id} | {residence.bairro || "Huambo"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Coluna Esquerda - Dados */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-[24px] border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Dados da Identificação</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Estado Atual</p>
                  <StatusBadge status={residence.status} />
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Código Alfanumérico</p>
                  <p className="text-sm font-mono font-bold text-primary">{residence.codigo || "Pendente"}</p>
                </div>
                <div className="space-y-1 col-span-2 border-t pt-4">
                  <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-bold">
                    <User className="h-3 w-3" /> Titular da Residência
                  </p>
                  <p className="text-lg font-medium text-foreground">{residence.proprietario}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-bold">
                    <MapPin className="h-3 w-3" /> Endereço/Bairro
                  </p>
                  <p className="text-sm text-foreground">{residence.bairro}, {residence.rua}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 justify-end font-bold">
                    <Calendar className="h-3 w-3" /> Data de Captura
                  </p>
                  <p className="text-sm text-foreground">{formatarData(residence.criadoEm)}</p>
                </div>
              </div>
            </div>

            {/* Foto Real */}
            <div className="bg-card rounded-[24px] border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Evidência Fotográfica</h2>
              <div className="aspect-video rounded-[20px] bg-muted overflow-hidden border border-border">
                {/* CORREÇÃO: Usando o campo correto que vem do mapeamento (foto) */}
                {residence.foto_url ? (
                  <img src={residence.foto_url} className="w-full h-full object-cover" alt="Residência" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <p>Nenhuma foto enviada pelo agente</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Mapa e Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-[24px] border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Geolocalização</h2>
              <div className="aspect-square rounded-[16px] bg-muted overflow-hidden relative border border-border">
                {/* Aqui você pode integrar o Google Maps real depois */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                   <div className="text-center p-4">
                     <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                     <p className="text-[10px] font-bold">LAT: {residence.coordenadas.lat}</p>
                     <p className="text-[10px] font-bold">LNG: {residence.coordenadas.lng}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[24px] border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Rastreabilidade</h2>
              <Timeline events={realTimeline} />
            </div>

            {residence.status === "rejeitada" && residence.motivoRejeicao && (
              <div className="bg-status-rejected/5 rounded-[24px] border border-status-rejected/20 p-6">
                <h2 className="text-lg font-semibold text-status-rejected mb-2">Motivo da rejeição</h2>
                <p className="text-sm leading-6 text-foreground">{residence.motivoRejeicao}</p>
              </div>
            )}

            {(residence.justificativaReenvio || residence.anexoJustificacao) && (
              <div className="bg-status-pending/5 rounded-[24px] border border-status-pending/20 p-6">
                <h2 className="text-lg font-semibold text-status-pending mb-2">Justificativa do novo envio</h2>
                {residence.justificativaReenvio && <p className="text-sm leading-6 text-foreground">{residence.justificativaReenvio}</p>}
                {residence.anexoJustificacao && (
                  <div className="mt-4 rounded-xl border border-border bg-background p-3">
                    {residence.anexoJustificacao.startsWith("data:image/") || /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(residence.anexoJustificacao) ? (
                      <img src={residence.anexoJustificacao} alt="Imagem da justificação" className="max-h-72 w-full rounded-lg object-contain" />
                    ) : (
                      <a href={residence.anexoJustificacao} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                        Abrir documento de justificação
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barra de Ações Fixa */}
        {residence.status === "pendente" && (
          <div className="fixed bottom-0 left-64 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4 z-50">
            <div className="max-w-5xl mx-auto flex justify-end gap-4">
              <Button variant="outline" onClick={handleReject} className="rounded-xl border-status-rejected text-status-rejected">
                <XCircle className="h-4 w-4 mr-2" /> Rejeitar
              </Button>
              <Button onClick={handleApprove} className="rounded-xl bg-primary">
                <CheckCircle className="h-4 w-4 mr-2" /> Aprovar e Gerar Código
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modais com o ID Real */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false)
          router.push("/residencias/aprovadas")
        }}
        residenceCode={residence.id}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        residenceCode={residence.id}
      />
    </div>
  )
}