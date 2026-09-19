"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, MapPin, Phone, User, Calendar, CheckCircle, XCircle, Loader2, Clock3, FileText, ImageIcon, Satellite, Map as MapIcon, Hash, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

import { StatusBadge } from "@/components/status-badge"
import { Timeline, type TimelineEvent } from "@/components/timeline"
import { QRCodeModal } from "@/components/qr-code-modal"
import { RejectModal } from "@/components/reject-modal"
import { db } from "@/lib/Services/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { rejeitarResidencia } from "@/lib/residencia/residenciaService"
import { obterAnexoJustificacao, obterJustificativaReenvio, obterNomeComprovativo } from "@/lib/residencia/residenciaService"

const MapaReal = dynamic(() => import("@/components/mapa-real"), { ssr: false })

export default function ResidenceReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [residence, setResidence] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [modoSatélite, setModoSatélite] = useState(false)

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
            contacto: dados.telefone || dados.contacto || "Não informado",
            atualizadoEm: dados.atualizadoEm || dados.updatedAt || dados.editadoEm || dados.rejeitadoEm || dados.aprovadoEm || null,
            qr_code_url: dados.qr_code_url || "",
            status: dados.status || "pendente"
            , comentarioJustificativa: obterJustificativaReenvio(dados)
            , comprovativoNome: obterNomeComprovativo(dados)
            , justificativaReenvio: obterJustificativaReenvio(dados)
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
    return new Date(data.seconds * 1000).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" });
  }
  
  // Se já for string ou Date
  return String(data);
};

  const residenciaParaMapa = {
    id: residence.id,
    bairro: residence.bairro || "",
    codigo: residence.codigo || "",
    coordenadas: residence.coordenadas,
    criadoEm: null,
    descricao: residence.descricao || "",
    foto_url: residence.foto_url || "",
    nome_morador: residence.proprietario || "",
    rua: residence.rua || "",
    telefone: residence.contacto || "",
    status: residence.status,
  }

  return (
    <>
      <main className="min-h-full overflow-auto bg-background p-4 pb-28 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="page-shell-header -mx-4 -mt-4 flex items-center gap-4 border-b border-border bg-card px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 shrink-0 rounded-xl p-0 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-foreground">Detalhes da residência</h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">{residence.proprietario} · {residence.bairro || "Huambo"}</p>
          </div>
          <div className="ml-auto shrink-0"><StatusBadge status={residence.status} /></div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary"><User className="h-5 w-5" /></div>
                <div><h2 className="text-lg font-semibold text-foreground">Identificação e contacto</h2><p className="text-sm text-muted-foreground">Dados principais do titular e da residência</p></div>
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div><dt className="text-xs font-medium text-muted-foreground">Titular</dt><dd className="mt-1 text-sm font-semibold text-foreground">{residence.proprietario}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Phone className="h-3.5 w-3.5" /> Telefone</dt><dd className="mt-1 text-sm text-foreground">{residence.contacto || "Não informado"}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Morada</dt><dd className="mt-1 text-sm text-foreground">{[residence.endereco, residence.bairro, residence.rua].filter(Boolean).join(", ") || "Não informada"}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Hash className="h-3.5 w-3.5" /> Código</dt><dd className="mt-1 font-mono text-sm font-semibold text-primary">{residence.codigo || "Pendente"}</dd></div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-blue-500/10 p-2 text-blue-600"><Clock3 className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-foreground">Estado e datas</h2><p className="text-sm text-muted-foreground">Histórico temporal do registo</p></div></div>
              <dl className="grid gap-5 sm:grid-cols-3">
                <div><dt className="text-xs font-medium text-muted-foreground">Estado atual</dt><dd className="mt-2"><StatusBadge status={residence.status} /></dd></div>
                <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Criada em</dt><dd className="mt-1 text-sm text-foreground">{formatarData(residence.criadoEm)}</dd></div>
                <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Atualizada em</dt><dd className="mt-1 text-sm text-foreground">{formatarData(residence.atualizadoEm)}</dd></div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><ImageIcon className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-foreground">Foto da residência</h2><p className="text-sm text-muted-foreground">Evidência visual submetida no registo</p></div></div></div>
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted/40">{residence.foto_url ? <img src={residence.foto_url} className="h-full w-full object-cover" alt="Foto da residência" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Nenhuma foto enviada</div>}</div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><MapIcon className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-foreground">Localização da residência</h2><p className="text-sm text-muted-foreground">Posição geográfica registada</p></div></div>
              <div className="mb-3 flex items-center justify-between gap-2"><p className="flex items-center gap-1 text-xs text-muted-foreground"><Navigation className="h-3.5 w-3.5" /> {residence.coordenadas.lat.toFixed(6)}, {residence.coordenadas.lng.toFixed(6)}</p><div className="flex rounded-lg border border-border p-0.5"><Button type="button" variant={!modoSatélite ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs" onClick={() => setModoSatélite(false)}><MapIcon className="mr-1 h-3.5 w-3.5" /> Mapa</Button><Button type="button" variant={modoSatélite ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs" onClick={() => setModoSatélite(true)}><Satellite className="mr-1 h-3.5 w-3.5" /> Satélite</Button></div></div>
              <div className="h-72 overflow-hidden rounded-xl border border-border"><MapaReal residencias={[residenciaParaMapa]} selectedResidence={residenciaParaMapa} onSelectResidence={() => undefined} modoSatélite={modoSatélite} /></div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Hash className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-foreground">QR Code</h2><p className="text-sm text-muted-foreground">Código de identificação da residência</p></div></div><div className="flex items-center justify-center rounded-xl border border-border bg-white p-5"><QRCodeSVG value={residence.codigo || residence.id} size={180} level="H" /></div><p className="mt-3 text-center font-mono text-xs text-muted-foreground">{residence.codigo || residence.id}</p></section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Clock3 className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-foreground">Rastreabilidade</h2><p className="text-sm text-muted-foreground">Eventos registados no processo</p></div></div><Timeline events={realTimeline} /></section>

            {residence.status === "rejeitada" && (residence.motivoRejeicao || residence.justificativaReenvio || residence.anexoJustificacao) && (
              <section className="rounded-2xl border border-status-rejected/30 bg-status-rejected/5 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-status-rejected/10 p-2 text-status-rejected"><FileText className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-status-rejected">Justificativa da rejeição</h2>
                    <p className="text-sm text-muted-foreground">Comentário e comprovativo enviados pelo morador</p>
                  </div>
                </div>
                {residence.motivoRejeicao && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground">Motivo da rejeição</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">{residence.motivoRejeicao}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Comentário da justificativa</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">{residence.justificativaReenvio || "O morador não enviou um comentário."}</p>
                </div>
                {residence.anexoJustificacao && (
                  <div className="mt-4 rounded-xl border border-border bg-background p-3">
                    {residence.anexoJustificacao.startsWith("data:image/") || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(`${residence.comprovativoNome || ""} ${residence.anexoJustificacao}`) ? (
                      <img src={residence.anexoJustificacao} alt={residence.comprovativoNome || "Comprovativo"} className="max-h-72 w-full rounded-lg object-contain" />
                    ) : (
                      <a href={residence.anexoJustificacao} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                        <FileText className="h-4 w-4" />
                        {residence.comprovativoNome || "Abrir comprovativo"}
                      </a>
                    )}
                    {residence.comprovativoNome && <p className="mt-2 truncate text-xs text-muted-foreground">{residence.comprovativoNome}</p>}
                  </div>
                )}
              </section>
            )}
          </div>
        </section>

      </div>

        {/* Barra de Ações Fixa */}
        {residence.status === "pendente" && (
          <div className="residence-action-bar fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4 z-50">
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
    </>
  )
}