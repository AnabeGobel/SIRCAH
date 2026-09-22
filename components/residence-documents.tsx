"use client"

import { useEffect, useState } from "react"
import { ExternalLink, FileText, X } from "lucide-react"

export interface ResidenceDocument {
  mimeType?: string
  name?: string
  uri?: string
}

const normalizarUri = (uri?: string) => {
  if (!uri) return ""
  const valor = uri.trim()
  if (!valor) return ""
  if (valor.startsWith("/")) return new URL(valor, window.location.origin).toString()
  return valor
}

const isImageUri = (uri?: string, mimeType?: string) =>
  Boolean(uri && (mimeType?.startsWith("image/") || uri.startsWith("data:image/") || /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(uri)))

const isPdfUri = (uri?: string, mimeType?: string) =>
  Boolean(
    uri &&
      (mimeType?.toLowerCase() === "application/pdf" ||
        uri.startsWith("data:application/pdf") ||
        /\.pdf(\?.*)?$/i.test(uri))
  )

const isUsableUri = (uri?: string) =>
  Boolean(
    uri &&
      /^(data:|blob:|https?:\/\/|file:\/\/|\/|\\\\)/i.test(uri)
  )

interface ResidenceDocumentsProps {
  documentoBi?: unknown
  documentosOpcionais?: unknown
  documentoBiExtra?: unknown
}

const resolverUri = (value: unknown): string | undefined => {
  if (typeof value === "string") return normalizarUri(value)
  if (typeof value === "object" && value) {
    const obj = value as Record<string, unknown>
    const candidatos = [
      obj.uri,
      obj.url,
      obj.href,
      obj.link,
      obj.fileUrl,
      obj.downloadUrl,
      obj.src,
      obj.path,
      obj.arquivo,
      obj.file,
      obj.documento,
      obj.anexo,
    ]

    for (const candidato of candidatos) {
      if (typeof candidato === "string" && candidato.trim()) return normalizarUri(candidato)
    }
  }

  return undefined
}

const resolverNome = (value: unknown): string | undefined => {
  if (typeof value === "string") return value
  if (typeof value === "object" && value) {
    const obj = value as Record<string, unknown>
    const nome = [obj.name, obj.nome, obj.filename, obj.fileName, obj.title, obj.label].find(
      (item): item is string => typeof item === "string" && Boolean(item.trim())
    )
    return nome ? nome.trim() : undefined
  }

  return undefined
}

const normalizeDocument = (documento: unknown): ResidenceDocument | null => {
  if (!documento) return null

  if (typeof documento === "string") {
    const uri = normalizarUri(documento)
    return uri ? { uri, name: uri.split("/").pop() || "Documento" } : null
  }

  if (Array.isArray(documento)) {
    const firstValid = documento.map(normalizeDocument).find(Boolean)
    return firstValid ?? null
  }

  if (typeof documento !== "object") return null

  const value = documento as Record<string, unknown>
  const uri = resolverUri(value)
  if (!uri) return null

  return {
    mimeType: typeof value.mimeType === "string" ? value.mimeType : typeof value.type === "string" ? value.type : undefined,
    name: resolverNome(value) || uri.split("/").pop() || "Documento",
    uri,
  }
}

export function ResidenceDocuments({ documentoBi, documentosOpcionais, documentoBiExtra }: ResidenceDocumentsProps) {
  const [imagemAmpliada, setImagemAmpliada] = useState<{ uri: string; name: string } | null>(null)
  const bi = normalizeDocument(documentoBi ?? documentoBiExtra)
  const documentosBrutos = Array.isArray(documentosOpcionais)
    ? documentosOpcionais
    : documentosOpcionais
      ? [documentosOpcionais]
      : []

  const opcionais = documentosBrutos.map(normalizeDocument).filter((documento): documento is ResidenceDocument => documento !== null)

  useEffect(() => {
    if (!imagemAmpliada) return
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagemAmpliada(null)
    }
    document.addEventListener("keydown", fecharComEscape)
    return () => document.removeEventListener("keydown", fecharComEscape)
  }, [imagemAmpliada])

  if (!bi && opcionais.length === 0) return null

  const renderDocument = (documento: ResidenceDocument, label: string, key: string) => {
    const uri = normalizarUri(documento.uri)
    const isImage = isImageUri(uri, documento.mimeType)
    const isPdf = isPdfUri(uri, documento.mimeType)

    return (
      <div key={key} className="overflow-hidden rounded-xl border border-border bg-background">
        {isImage ? (
          <button
            type="button"
            onClick={() => setImagemAmpliada({ uri: uri, name: documento.name || label })}
            className="block w-full cursor-zoom-in bg-muted/30 p-2 text-left"
            aria-label={`Ampliar ${documento.name || label}`}
          >
            <img src={uri} alt={documento.name || label} className="max-h-56 w-full rounded-lg object-contain" />
          </button>
        ) : isPdf ? (
          <div className="bg-muted/30 p-2">
            <iframe
              src={uri}
              title={documento.name || label}
              className="h-72 w-full rounded-lg border border-border bg-white"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{documento.name || label}</p>
              <p className="truncate text-xs text-muted-foreground">{documento.mimeType || "Tipo de ficheiro não informado"}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border bg-background p-3">
          <p className="truncate text-xs text-muted-foreground">{documento.name || label}</p>
          {isUsableUri(uri) ? (
            <div className="flex items-center gap-2">
              <a
                href={uri}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Abrir
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={uri}
                download={documento.name || label}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:underline"
              >
                Download
              </a>
            </div>
          ) : (
            <span className="text-right text-xs text-muted-foreground">Sem ficheiro</span>
          )}
        </div>
      </div>
    )
  }

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