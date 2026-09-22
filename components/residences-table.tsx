"use client"

import Link from "next/link"
import { Eye, Check, X, Power, ExternalLink } from "lucide-react"
import { StatusBadge } from "./status-badge"
import { Button } from "@/components/ui/button"
import type { ResidenceDocument } from "./residence-documents"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



export interface Residence {
  id: string
  proprietario: string
  endereco: string
  bairro: string
  rua: string;
  criadoEm: unknown
  status: "pendente" | "aprovado" | "rejeitada"
  coordenadas: { lat: number; lng: number }
  foto_url?: string
  codigo?: string; // <--- ADICIONE ESTA LINHA (o '?' significa que é opcional)
  contacto?: string;
  estadoResidencia?: "valido" | "invalido";
  mensagemEstado?: string;
  motivoRejeicao?: string;
  comentarioJustificativa?: string;
  comprovativoNome?: string;
  comprovativoUrl?: string;
  justificativaReenvio?: string;
  anexoJustificacao?: string;
  documentoBi?: ResidenceDocument;
  documentosOpcionais?: ResidenceDocument[];
}






interface ResidencesTableProps {
  residences: Residence[]
  showActions?: boolean
  onView?: (residence: Residence) => void
  onApprove?: (residence: Residence) => void
  onReject?: (residence: Residence) => void
  onToggleStatus?: (residence: Residence) => void
}

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

export function ResidencesTable({
  residences,
  showActions = true,
  onView,
  onApprove,
  onReject,
  onToggleStatus,
}: ResidencesTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border bg-card">
            <TableHead className="text-[#4B5563] font-bold text-sm py-4 px-6">
              Código
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Morador
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Bairro
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Data
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Estado
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Validade
            </TableHead>
            <TableHead className="text-[#4B5563] font-bold text-sm py-4">
              Justificativa
            </TableHead>
            {showActions && (
              <TableHead className="text-[#4B5563] font-bold text-sm py-4 px-6 text-right">
                Ações
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {residences.map((residence) => (
            <TableRow
              key={residence.id}
              className="hover:bg-muted/50 border-border transition-colors"
            >
              <TableCell className="py-4 px-6 font-medium text-foreground text-sm font-mono">
                {residence.codigo
                  ? <span className="text-primary font-bold">{residence.codigo}</span>
                  : <span className="text-muted-foreground text-xs italic">Pendente</span>
                }
              </TableCell>
              <TableCell className="py-4 text-foreground text-sm">
                {residence.proprietario}
              </TableCell>
              <TableCell className="py-4 text-foreground text-sm">
                {residence.bairro || "-"}
              </TableCell>
              <TableCell className="py-4 text-muted-foreground text-sm">
                {formatarData(residence.criadoEm)}
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge status={residence.status} />
              </TableCell>
              <TableCell className="py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${residence.estadoResidencia === "invalido" ? "bg-status-rejected/10 text-status-rejected" : "bg-status-approved/10 text-status-approved"}`}>
                  {residence.estadoResidencia === "invalido" ? "Inválida" : "Válida"}
                </span>
              </TableCell>
              <TableCell className="max-w-[280px] py-4 text-xs text-muted-foreground">
                <div className="line-clamp-2">{residence.justificativaReenvio || "-"}</div>
                {residence.anexoJustificacao && <span className="mt-1 inline-block font-medium text-primary">Anexo enviado</span>}
              </TableCell>
              {showActions && (
                <TableCell className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(residence)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                    <Link href={`/residencias/${residence.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Ver detalhes completos">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus?.(residence)}
                      className={`h-8 w-8 p-0 ${residence.estadoResidencia === "invalido" ? "text-status-approved hover:bg-status-approved/10" : "text-status-rejected hover:bg-status-rejected/10"}`}
                      title={residence.estadoResidencia === "invalido" ? "Marcar como válida" : "Marcar como inválida"}
                    >
                      <Power className="h-4 w-4" />
                      <span className="sr-only">{residence.estadoResidencia === "invalido" ? "Marcar como válida" : "Marcar como inválida"}</span>
                    </Button>
                    {residence.status === "pendente" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove?.(residence)}
                          className="h-8 w-8 p-0 hover:bg-status-approved/10 text-status-approved"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Aprovar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject?.(residence)}
                          className="h-8 w-8 p-0 hover:bg-status-rejected/10 text-status-rejected"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Rejeitar</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
