"use client"

import { useEffect, useState } from "react"
import { ExternalLink, FileText, X } from "lucide-react"

export interface ResidenceDocument {
  mimeType?: string
  name?: string
  uri?: string
}

const isImageUri = (uri?: string, mimeType?: string) =>
  Boolean(uri && (mimeType?.startsWith("image/") || uri.startsWith("data:image/")))

const isUsableUri = (uri?: string) =>
  Boolean(uri && (uri.startsWith("data:") || uri.startsWith("blob:") || /^https?:\/\//i.test(uri)))

interface ResidenceDocumentsProps {
  documentoBi?: unknown
  documentosOpcionais?: unknown
}

const normalizeDocument = (documento: unknown): ResidenceDocument | null => {
  if (!documento || typeof documento !== "object") return null

  const value = documento as Record<string, unknown>
  return {
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
    name: typeof value.name === "string" ? value.name : undefined,
    uri: typeof value.uri === "string" ? value.uri : undefined,
  }
}

export function ResidenceDocuments({ documentoBi, documentosOpcionais }: ResidenceDocumentsProps) {
  const [imagemAmpliada, setImagemAmpliada] = useState<{ uri: string; name: string } | null>(null)
  const bi = normalizeDocument(documentoBi)
  const opcionais = Array.isArray(documentosOpcionais)
    ? documentosOpcionais.map(normalizeDocument).filter((documento): documento is ResidenceDocument => documento !== null)
    : []

  useEffect(() => {
    if (!imagemAmpliada) return
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagemAmpliada(null)
    }
    document.addEventListener("keydown", fecharComEscape)
    return () => document.removeEventListener("keydown", fecharComEscape)
  }, [imagemAmpliada])

  if (!bi && opcionais.length === 0) return null

  const renderDocument = (documento: ResidenceDocument, label: string, key: string) => (
    <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
      <div className="min-w-0 flex-1">
        {isImageUri(documento.uri, documento.mimeType) ? (
          <button
            type="button"
            onClick={() => setImagemAmpliada({ uri: documento.uri!, name: documento.name || label })}
            className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted/30"
            aria-label={`Ampliar ${documento.name || label}`}
          >
            <img src={documento.uri} alt={documento.name || label} className="max-h-56 w-full object-contain" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{documento.name || label}</p>
              <p className="truncate text-xs text-muted-foreground">{documento.mimeType || "Tipo de ficheiro não informado"}</p>
            </div>
          </div>
        )}
        {isImageUri(documento.uri, documento.mimeType) && (
          <p className="mt-2 truncate text-xs text-muted-foreground">{documento.name || label}</p>
        )}
      </div>
      {isUsableUri(documento.uri) ? (
        <a
          href={documento.uri}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Abrir
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="shrink-0 text-right text-xs text-muted-foreground">
          {documento.uri ? "Anexo indisponível" : "Sem ficheiro"}
        </span>
      )}
    </div>
  )

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary"><FileText className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Documentos da residência</h2>
          <p className="text-sm text-muted-foreground">BI e outros documentos enviados</p>
        </div>
      </div>
      <div className="space-y-3">
        {bi && renderDocument(bi, "Bilhete de Identidade", `bi-${bi.uri || bi.name || "documento"}`)}
        {opcionais.map((documento, index) => renderDocument(documento, `Documento opcional ${index + 1}`, `opcional-${documento.uri || documento.name || index}`))}
      </div>
      </section>

      {imagemAmpliada && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada: ${imagemAmpliada.name}`}
          onClick={() => setImagemAmpliada(null)}
        >
          <button
            type="button"
            onClick={() => setImagemAmpliada(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fechar imagem ampliada"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imagemAmpliada.uri}
            alt={imagemAmpliada.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}