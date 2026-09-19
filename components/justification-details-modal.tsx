"use client"

import { ExternalLink, FileText, MapPin, MessageSquare, User } from "lucide-react"
import type { Residence } from "@/components/residences-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"

interface JustificationDetailsModalProps {
  residence: Residence | null
  isOpen: boolean
  onClose: () => void
}

const isImageAttachment = (value: string) =>
  value.startsWith("data:image/") || /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(value)

const formatDate = (value: unknown) => {
  if (!value) return "Data não disponível"
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date(Number((value as { seconds: number }).seconds) * 1000).toLocaleDateString("pt-PT")
  }
  return String(value)
}

export function JustificationDetailsModal({ residence, isOpen, onClose }: JustificationDetailsModalProps) {
  if (!residence) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-5 pr-14">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Detalhes da justificativa
          </DialogTitle>
          <DialogDescription>
            Justificação enviada pelo morador para revisão da residência.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Dados da residência</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3.5 w-3.5" /> Morador</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{residence.proprietario || "Não identificado"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Código</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{residence.codigo || "Pendente"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Endereço</dt>
                  <dd className="mt-1 text-sm text-foreground">{[residence.endereco, residence.bairro, residence.rua].filter(Boolean).join(", ") || "Não informado"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Contacto</dt>
                  <dd className="mt-1 text-sm text-foreground">{residence.contacto || "Não informado"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Data de registo</dt>
                  <dd className="mt-1 text-sm text-foreground">{formatDate(residence.criadoEm)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-xs text-muted-foreground">Estado</dt>
                  <dd><StatusBadge status={residence.status} /></dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-status-pending/30 bg-status-pending/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-status-pending">
                <MessageSquare className="h-4 w-4" /> Comentário da justificativa
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {residence.justificativaReenvio || "O morador não enviou um comentário."}
              </p>
            </section>

            {residence.motivoRejeicao && (
              <section className="rounded-xl border border-status-rejected/30 bg-status-rejected/5 p-4">
                <h3 className="mb-2 text-sm font-semibold text-status-rejected">Motivo da rejeição anterior</h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{residence.motivoRejeicao}</p>
              </section>
            )}
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Foto da residência</h3>
              <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
                {residence.foto_url ? (
                  <img src={residence.foto_url} alt={`Residência de ${residence.proprietario}`} className="max-h-72 w-full object-contain" />
                ) : (
                  <p className="px-4 text-center text-sm text-muted-foreground">Nenhuma foto da residência foi enviada.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Foto ou arquivo da justificativa</h3>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-3">
                {residence.anexoJustificacao ? (
                  isImageAttachment(`${residence.comprovativoNome || ""} ${residence.anexoJustificacao}`) ? (
                    <div className="space-y-2">
                      <img src={residence.anexoJustificacao} alt={residence.comprovativoNome || "Anexo da justificativa"} className="max-h-72 w-full rounded-lg object-contain" />
                      {residence.comprovativoNome && <p className="truncate px-1 text-xs text-muted-foreground">{residence.comprovativoNome}</p>}
                    </div>
                  ) : (
                    <a href={residence.anexoJustificacao} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-primary hover:bg-primary/5">
                      <FileText className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{residence.comprovativoNome || "Abrir arquivo da justificativa"}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  )
                ) : (
                  <p className="px-1 py-3 text-sm text-muted-foreground">Nenhum anexo foi enviado.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
