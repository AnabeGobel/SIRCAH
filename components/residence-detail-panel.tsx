"use client"

import { X, MapPin, Calendar, User, Clock, CheckCircle, XCircle, Phone, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import type { Residence } from "./residences-table"

interface ResidenceDetailPanelProps {
  residence: Residence | null
  onClose: () => void
  onApprove?: (residence: Residence) => void
  onReject?: (residence: Residence) => void
}

export function ResidenceDetailPanel({
  residence,
  onClose,
  onApprove,
  onReject,
}: ResidenceDetailPanelProps) {
  if (!residence) return null

  // Função robusta para tratar a data
  const formatarData = (data: any) => {
    if (!data) return "Data não disponível";
    if (data && typeof data === 'object' && data.seconds) {
      return new Date(data.seconds * 1000).toLocaleDateString("pt-PT");
    }
    if (typeof data === 'string') return data;
    return "Data inválida";
  };

  const r = residence as any;

  // CORREÇÃO DAS COORDENADAS: Buscando nos dois formatos possíveis
  const lat = r.coordenadas?.lat ?? r.coordenadas?.latitude ?? 0;
  const lng = r.coordenadas?.lng ?? r.coordenadas?.longitude ?? 0;

  return (
    <div className="w-96 h-full bg-card border-l border-border overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="font-semibold text-foreground">Detalhes da Residência</h2>
          <p className="text-[10px] text-muted-foreground font-mono">{residence.codigo}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-muted rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Imagem - Foco exclusivo na correção da exibição */}
        <div className="aspect-video rounded-2xl bg-muted overflow-hidden border border-border shadow-inner">
          {/* Verificamos residence.foto_url e também (residence as any).foto_url 
            para garantir que o compilador encontre o dado no objeto real 
          */}
          {(residence as any)?.foto_url ? (
            <img 
              src={(residence as any).foto_url} 
              className="w-full h-full object-cover" 
              alt="Residência" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma foto enviada pelo agente</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado do SIRCAH</span>
          <StatusBadge status={residence.status} />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{residence.proprietario || "Não identificado"}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Titular Responsável</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{residence.endereco || "Huambo, Angola"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  GPS: {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <Home className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground truncate">{residence.bairro || "S/B"}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Bairro</p>
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {formatarData(residence.criadoEm || r.dataRegisto)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Registo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico/Rastreabilidade */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Rastreabilidade</h3>
          <div className="space-y-4 border-l-2 border-muted ml-2 pl-4">
             <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-none">Registo capturado no Huambo</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatarData(residence.criadoEm || r.dataRegisto)}
                  </p>
                </div>
              </div>
          </div>
        </div>

        {residence.status === "pendente" && (
          <div className="pt-6 border-t border-border space-y-3 sticky bottom-0 bg-card pb-4">
            <Button
              onClick={() => onApprove?.(residence)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 shadow-lg shadow-primary/20"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar e Gerar Código
            </Button>
            <Button
              onClick={() => onReject?.(residence)}
              variant="outline"
              className="w-full border-status-rejected text-status-rejected hover:bg-status-rejected/5 rounded-xl h-12"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar Registo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}