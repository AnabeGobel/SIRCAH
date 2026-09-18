"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, MapPin, Save, X,
  Upload, ImageIcon, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { MoradorSelect }    from "@/components/morador-select"
import { MapaCoordenadas }  from "@/components/mapa-coordenadas"
import { registarNovaResidencia } from "@/lib/residencia/residence-service"
import type { Morador } from "@/lib/residencia/morador-service"


// ─── Estado do formulário ─────────────────────────────────────────────────────

interface FormState {
  moradorSeleccionado: Morador | null
  bairro:    string
  rua:       string
  descricao: string
  lat:       number
  lng:       number
  fotoFile:  File | null
  fotoPreview: string | null
}

const formInicial: FormState = {
  moradorSeleccionado: null,
  bairro:    "",
  rua:       "",
  descricao: "",
  lat:       0,
  lng:       0,
  fotoFile:  null,
  fotoPreview: null,
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function NovaResidenciaPage() {
  const router = useRouter()
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const [form,         setForm]         = useState<FormState>(formInicial)
  const [submetendo,   setSubmetendo]   = useState(false)
  const [erros,        setErros]        = useState<Record<string, string>>({})
  const [sucesso,      setSucesso]      = useState<boolean>(false)
  const [erroGlobal,   setErroGlobal]   = useState<string | null>(null)

  // ── Selecção de morador → auto-preenche telefone ──────────────────────────
  const handleMoradorChange = (morador: Morador | null) => {
    setForm((prev) => ({
      ...prev,
      moradorSeleccionado: morador,
    }))
    // Limpa erro do campo
    if (erros.morador) setErros((e) => ({ ...e, morador: "" }))
  }

  // ── Clique/drag no mapa → actualiza coordenadas ───────────────────────────
  const handleMapaChange = (
    lat: number,
    lng: number,
    enderecoDetectado?: string
  ) => {
    setForm((prev) => ({
      ...prev,
      lat,
      lng,
      // Se o campo rua estiver vazio, preenche com o endereço detectado
      rua: prev.rua === "" && enderecoDetectado ? enderecoDetectado : prev.rua,
    }))
    if (erros.coordenadas) setErros((e) => ({ ...e, coordenadas: "" }))
  }

  // ── Upload de foto ────────────────────────────────────────────────────────
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação: apenas imagens, máx. 5MB
    if (!file.type.startsWith("image/")) {
      setErros((prev) => ({ ...prev, foto: "Apenas ficheiros de imagem são aceites." }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErros((prev) => ({ ...prev, foto: "A imagem não pode exceder 5MB." }))
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, fotoFile: file, fotoPreview: previewUrl }))
    setErros((prev) => ({ ...prev, foto: "" }))
  }

  const removerFoto = () => {
    if (form.fotoPreview) URL.revokeObjectURL(form.fotoPreview)
    setForm((prev) => ({ ...prev, fotoFile: null, fotoPreview: null }))
    if (fotoInputRef.current) fotoInputRef.current.value = ""
  }

  // ── Validação ──────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!form.moradorSeleccionado) {
      novosErros.morador = "Seleccione o morador."
    }
    if (!form.bairro.trim()) {
      novosErros.bairro = "O bairro é obrigatório."
    }
    if (form.lat === 0 && form.lng === 0) {
      novosErros.coordenadas = "Seleccione a localização no mapa."
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  // ── Submissão ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return

    setSubmetendo(true)
    setErroGlobal(null)

    try {
      await registarNovaResidencia({
        bairro:       form.bairro.trim(),
        descricao:    form.descricao.trim(),
        rua:          form.rua.trim(),
        morador_uid:  form.moradorSeleccionado!.uid,
        nome_morador: form.moradorSeleccionado!.nome,
        telefone:     form.moradorSeleccionado!.telefone,
        coordenadas:  { lat: form.lat, lng: form.lng },
        fotoFile:     form.fotoFile,
      })

      setSucesso(true)
    } catch (e: any) {
      console.error(e)
      setErroGlobal("Erro ao guardar a residência. Verifique a ligação e tente novamente.")
    } finally {
      setSubmetendo(false)
    }
  }

  // ── Ecrã de sucesso ────────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full bg-card rounded-[24px] border border-border p-10 text-center space-y-6">
          {/* Ícone de sucesso */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-status-approved/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-status-approved" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">Residência registada!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              O registo foi guardado com status <strong>Pendente</strong>.<br />
              Um administrador irá analisar e aprovar.
            </p>
          </div>

          {/* Informação sobre código e QR — gerados na aprovação */}
          <div className="rounded-xl bg-muted/50 border border-border p-5 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-status-pending/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-status-pending text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Código e QR Code ainda não gerados
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  O código alfanumérico (ex: RES-1022) e o QR Code serão gerados
                  automaticamente pelo administrador no momento da aprovação.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/residencias/pendentes")}
              className="rounded-xl"
            >
              Ver residências pendentes
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => { setSucesso(false); setForm(formInicial) }}
            >
              Registar outra residência
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulário principal ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Novo Registo de Residência</h1>
            <p className="text-sm text-muted-foreground mt-1">Formulário de entrada de dados</p>
          </div>
        </div>

        {/* Erro global */}
        {erroGlobal && (
          <div className="mb-6 max-w-3xl flex items-start gap-3 rounded-xl border border-status-rejected/30 bg-status-rejected/10 p-4">
            <AlertCircle className="h-5 w-5 text-status-rejected mt-0.5 shrink-0" />
            <p className="text-sm text-status-rejected">{erroGlobal}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl space-y-6">

            {/* ── Secção 1: Dados do Morador ──────────────────────────── */}
            <div className="bg-card rounded-[24px] border border-border p-8">
              <h2 className="text-lg font-semibold text-foreground mb-6">Dados do Morador</h2>

              <div className="space-y-6">
                {/* Selector de Morador */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Morador <span className="text-status-rejected">*</span>
                  </Label>
                  <MoradorSelect
                    value={form.moradorSeleccionado}
                    onChange={handleMoradorChange}
                  />
                  {erros.morador && (
                    <p className="text-xs text-status-rejected">{erros.morador}</p>
                  )}
                </div>

                {/* Telefone auto-preenchido (readonly) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Telefone</Label>
                  <Input
                    value={form.moradorSeleccionado?.telefone ?? ""}
                    readOnly
                    placeholder="Preenchido automaticamente ao seleccionar o morador"
                    className="h-11 rounded-xl bg-muted/50 border-border cursor-not-allowed opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sincronizado automaticamente da colecção de moradores.
                  </p>
                </div>

                {/* Bairro — campo de texto livre */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Bairro <span className="text-status-rejected">*</span>
                  </Label>
                  <Input
                    value={form.bairro}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, bairro: e.target.value }))
                      if (erros.bairro) setErros((e2) => ({ ...e2, bairro: "" }))
                    }}
                    placeholder="Ex: Maianga, Viana, Cazenga..."
                    className="h-11 rounded-xl bg-muted/30 border-border"
                  />
                  {erros.bairro && (
                    <p className="text-xs text-status-rejected">{erros.bairro}</p>
                  )}
                </div>

                {/* Rua */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Rua / Referência</Label>
                  <Input
                    value={form.rua}
                    onChange={(e) => setForm((p) => ({ ...p, rua: e.target.value }))}
                    placeholder="Ex: Rua das Flores, 45 — ou próximo ao mercado central"
                    className="h-11 rounded-xl bg-muted/30 border-border"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Descrição / Observações</Label>
                  <Input
                    value={form.descricao}
                    onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                    placeholder="Ex: Casa de alvenaria, portão azul, defronte ao..."
                    className="h-11 rounded-xl bg-muted/30 border-border"
                  />
                </div>
              </div>
            </div>

            {/* ── Secção 2: Foto da Residência ───────────────────────── */}
            <div className="bg-card rounded-[24px] border border-border p-8">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Foto da Residência
              </h2>

              {form.fotoPreview ? (
                /* Preview da imagem seleccionada */
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.fotoPreview}
                    alt="Preview da foto"
                    className="w-full aspect-video object-cover rounded-[16px] border border-border"
                  />
                  <button
                    type="button"
                    onClick={removerFoto}
                    className="absolute top-3 right-3 rounded-full bg-status-rejected text-white p-1.5 hover:bg-status-rejected/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    {form.fotoFile?.name} ({((form.fotoFile?.size ?? 0) / 1024).toFixed(0)} KB)
                  </p>
                </div>
              ) : (
                /* Área de upload */
                <div>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  <button
                    type="button"
                    onClick={() => fotoInputRef.current?.click()}
                    className="w-full aspect-video rounded-[16px] border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Clique para seleccionar uma foto
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP — máx. 5MB
                      </p>
                    </div>
                  </button>
                  {erros.foto && (
                    <p className="mt-2 text-xs text-status-rejected">{erros.foto}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Secção 3: Coordenadas GPS (mapa real) ──────────────── */}
            <div className="bg-card rounded-[24px] border border-border p-8">
              <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localização GPS
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Clique no mapa para marcar a posição exacta da residência, ou use o botão de localização GPS.
              </p>

              <MapaCoordenadas
                lat={form.lat}
                lng={form.lng}
                onChange={handleMapaChange}
              />

              {erros.coordenadas && (
                <p className="mt-2 text-xs text-status-rejected flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {erros.coordenadas}
                </p>
              )}
            </div>

            {/* ── Secção 4: Status (informativo) ─────────────────────── */}
            <div className="bg-card rounded-[24px] border border-border p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Estado do Registo</h2>
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-status-pending/15 text-[#B7950B] shrink-0">
                  Pendente
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este registo ficará com status <strong>Pendente</strong> aguardando aprovação.
                  Após a aprovação por um administrador, o sistema irá gerar automaticamente
                  o código alfanumérico final, o QR Code e a data de aprovação.
                </p>
              </div>
            </div>

            {/* ── Acções ─────────────────────────────────────────────── */}
            <div className="flex justify-end gap-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submetendo}
                className="h-12 px-8 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submetendo}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submetendo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Registo
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
