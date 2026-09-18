"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { buscarResidencias } from "@/lib/residencia/residenciaService"
import { Bell, Search, Download, Loader2, QrCode as QrIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function QRCodesPage() {
  const [residences, setResidences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  // Filtro de pesquisa por nome ou código
  const filteredResidences = residences.filter(r => 
    (r.nome_morador?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">QR Codes Gerados</h1>
            {!loading && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {filteredResidences.length} disponíveis
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-64 rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="rounded-2xl bg-muted/50 border border-border p-4 flex items-start gap-3">
              <QrIcon className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                Estes são os identificadores oficiais do **SIRCAH**. Cada QR Code é único e vinculado ao código alfanumérico da residência no Huambo.
              </p>
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
                    className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all group"
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
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {residence.nome_morador || "Morador não identificado"}
                      </h3>
                      <p className="text-xs text-muted-foreground italic">
                        {residence.bairro || "Bairro não registado"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!residence.qr_code_url}
                        onClick={() => window.open(residence.qr_code_url, '_blank')}
                        className="flex-1 rounded-xl text-xs hover:bg-primary hover:text-white"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
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