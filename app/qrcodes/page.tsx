"use client"

import { useState, useEffect, useMemo } from "react"
import { buscarResidencias } from "@/lib/residencia/residenciaService"
import { Search, Download, Loader2, QrCode as QrIcon, Eye, Printer, Filter, X } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"

export default function QRCodesPage() {
  const [residences, setResidences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [bairroFilter, setBairroFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        // Buscamos apenas as aprovadas, pois só elas têm QR Code gerado
        const dados = await buscarResidencias("aprovado")
        setResidences(dados)
      } catch (error) {
        console.error("Erro ao carregar QR Codes:", error)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [])

  // 🛠️ FUNÇÃO INTELIGENTE PARA FORÇAR O DOWNLOAD DO QR CODE
  const handleDownloadQR = async (url: string, codigo: string) => {
    try {
      // Se for uma imagem externa (URL), precisamos de fazer o fetch para evitar bloqueios de CORS do navegador
      if (url.startsWith("http")) {
        const response = await fetch(url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `QR_${codigo || "sircah"}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        // Se já for Base64 (data:image/png;base64,...), faz o download direto
        const link = document.createElement("a")
        link.href = url
        link.download = `QR_${codigo || "sircah"}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Erro ao descarregar o QR Code:", error)
      // Fallback seguro caso o fetch falhe por segurança de CORS
      window.open(url, "_blank")
    }
  }

  const bairros = useMemo(() => Array.from(new Set(residences.map((residence) => residence.bairro).filter(Boolean))).sort(), [residences])

  // Pesquisa por nome, telefone, bairro ou código da residência.
  const filteredResidences = residences.filter((residence) => {
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch = !term || [residence.nome_morador, residence.telefone, residence.bairro, residence.codigo]
      .some((value) => value?.toLowerCase().includes(term))
    const matchesBairro = bairroFilter === "todos" || residence.bairro === bairroFilter
    const matchesStatus = statusFilter === "todos" || residence.status === statusFilter
    return matchesSearch && matchesBairro && matchesStatus
  })

  const imprimirQRCode = (residence: any) => {
    const janela = window.open("", "_blank", "width=600,height=700")
    if (!janela) return
    janela.document.write(`<html><head><title>QR Code ${residence.codigo || "SIRCAH"}</title><style>body{font-family:Arial;text-align:center;padding:40px}img{width:300px;height:300px;object-fit:contain}h1{font-size:22px;color:#ff5f6d}</style></head><body><h1>${residence.codigo || "Sem código"}</h1>${residence.qr_code_url ? `<img src="${residence.qr_code_url}" alt="QR Code" />` : "<p>QR Code não disponível</p>"}<p>${residence.nome_morador || "Morador não identificado"}</p><p>${residence.bairro || "Bairro não registado"}</p></body></html>`)
    janela.document.close()
    janela.focus()
    janela.print()
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="page-shell-header h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
          {/* Lado Esquerdo: Título e Contador (Badge) */}
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
              QR Codes Gerados
            </h1>
            {!loading && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium whitespace-nowrap">
                {residences.length} registos
              </span>
            )}
          </div>

          {/* Lado Direito: Barra de Pesquisa Fluida e Notificações */}
          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial w-full max-w-[240px] sm:max-w-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por código, morador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="rounded-2xl bg-muted/50 border border-border p-4 flex items-start gap-3">
              <QrIcon className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-foreground">
                Estes são os identificadores oficiais do <strong>SIRCAH</strong>. Cada QR Code é único e vinculado ao código alfanumérico da residência no Huambo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select value={bairroFilter} onChange={(event) => setBairroFilter(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="todos">Todos os Bairros</option>
                {bairros.map((bairro) => <option key={bairro} value={bairro}>{bairro}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="todos">Todos os Estados</option>
                <option value="aprovado">Ativo</option>
              </select>
              <Button variant="outline" onClick={() => { setSearchTerm(""); setBairroFilter("todos"); setStatusFilter("todos") }} className="gap-2 sm:ml-auto"><Filter className="h-4 w-4" /> Filtrar</Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>A carregar galeria de QR Codes...</p>
              </div>
            ) : filteredResidences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredResidences.map((residence) => (
                  <div
                    key={residence.id}
                    className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:shadow-lg transition-all group"
                  >
                    {/* Imagem Real do QR Code */}
                    <div className="aspect-square rounded-xl bg-white flex items-center justify-center mb-4 p-4 border border-border group-hover:border-primary/50">
                      {residence.qr_code_url ? (
                        <img 
                          src={residence.qr_code_url} 
                          alt={`QR Code ${residence.codigo}`}
                              className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                           <QrIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                           <p className="text-[10px] text-muted-foreground">QR Code não gerado</p>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-bold text-primary">
                        {residence.codigo || "SEM CÓDIGO"}
                      </p>
                      <span className="inline-flex rounded-full bg-status-approved/10 px-2.5 py-1 text-[10px] font-medium text-status-approved">Ativo</span>
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {residence.nome_morador || "Morador não identificado"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {residence.bairro || "Bairro não registado"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">Data de Registo: {residence.criadoEm?.seconds ? new Date(residence.criadoEm.seconds * 1000).toLocaleDateString("pt-PT") : residence.dataRegisto || "Não disponível"}</p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `/residencias/${residence.id}`} className="col-span-2 h-9 rounded-lg text-xs px-3"><Eye className="h-3.5 w-3.5 mr-1.5" /> Ver detalhes</Button>
                      {/* 🛠️ BOTÃO DO DOWNLOAD ATUALIZADO COM A NOVA FUNÇÃO */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!residence.qr_code_url}
                        onClick={() => handleDownloadQR(residence.qr_code_url, residence.codigo)}
                        className="h-9 rounded-lg text-xs px-3 hover:bg-primary hover:text-white cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => imprimirQRCode(residence)} disabled={!residence.qr_code_url} className="h-9 rounded-lg text-xs px-3"><Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-20 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground">Nenhum QR Code encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}