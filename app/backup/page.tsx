"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, CheckSquare, Download, FileSpreadsheet, FileText, Loader2, Printer, ShieldCheck } from "lucide-react"
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx"
import * as XLSX from "xlsx"
import { buscarResidencias } from "@/lib/residencia/residenciaService"
import { fetchTodosMoradores, type Morador } from "@/lib/residencia/morador-service"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"

type ExportFormat = "pdf" | "docx" | "xlsx"
type HistoryRange = "today" | "yesterday" | "five-days" | "all"

type ResidenceRecord = Record<string, any> & { id: string }
type HistoryRecord = { data: string; hora: string; evento: string; agente: string; timestamp: number }

const INSTITUTION = "Sistema de Identificação Residencial por Único com Recurso de Realidade Aumentada - Huambo"
const OBJECTIVE = "Este documento apresenta uma cópia organizada dos dados selecionados para fins de consulta, segurança, auditoria e continuidade operacional do sistema SIRCAH."

const toDate = (value: any) => {
  if (!value) return null
  if (typeof value.toDate === "function") return value.toDate() as Date
  if (value.seconds) return new Date(value.seconds * 1000)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value: any) => {
  const date = toDate(value)
  return date ? date.toLocaleDateString("pt-PT") : "Não disponível"
}

const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character)

export default function BackupPage() {
  const [residences, setResidences] = useState<ResidenceRecord[]>([])
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [format, setFormat] = useState<ExportFormat>("xlsx")
  const [status, setStatus] = useState("todos")
  const [bairro, setBairro] = useState("todos")
  const [residenceId, setResidenceId] = useState("todos")
  const [moradorId, setMoradorId] = useState("todos")
  const [historyRange, setHistoryRange] = useState<HistoryRange>("all")
  const [includeResidences, setIncludeResidences] = useState(true)
  const [includeMoradores, setIncludeMoradores] = useState(true)
  const [includeHistory, setIncludeHistory] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [residenceData, residentData] = await Promise.all([
          buscarResidencias(),
          fetchTodosMoradores(),
        ])
        setResidences(residenceData as ResidenceRecord[])
        setMoradores(residentData)
        const historyItems: HistoryRecord[] = []
        ;(residenceData as ResidenceRecord[]).forEach((item) => {
          const created = toDate(item.criadoEm)
          if (created) historyItems.push({ data: formatDate(created), hora: created.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), evento: `Novo registo enviado - ${item.codigo || "Sem código"}`, agente: item.agente_nome || "Agente de Campo", timestamp: created.getTime() })
          const approved = toDate(item.aprovadoEm)
          if (item.status === "aprovado" && approved) {
            historyItems.push({ data: formatDate(approved), hora: approved.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), evento: `Residência validada - ${item.codigo || "Sem código"}`, agente: "Sistema Admin", timestamp: approved.getTime() })
            historyItems.push({ data: formatDate(approved), hora: approved.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), evento: `QR Code ativado - ${item.codigo || "Sem código"}`, agente: "Sistema SIRCAH", timestamp: approved.getTime() })
          }
          const rejected = toDate(item.rejeitadoEm) || created
          if (item.status === "rejeitada" && rejected) historyItems.push({ data: formatDate(rejected), hora: rejected.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), evento: `Residência rejeitada - ${item.codigo || "Sem código"}${item.motivoRejeicao ? `: ${item.motivoRejeicao}` : ""}`, agente: "Sistema Admin", timestamp: rejected.getTime() })
          const changed = toDate(item.estadoAlteradoEm)
          if (changed && item.estadoResidencia) historyItems.push({ data: formatDate(changed), hora: changed.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), evento: `Residência marcada como ${item.estadoResidencia}${item.mensagemEstado ? `: ${item.mensagemEstado}` : ""}`, agente: "Sistema Admin", timestamp: changed.getTime() })
        })
        setHistory(historyItems)
      } catch (error) {
        console.error("Erro ao carregar dados do backup:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const bairros = useMemo(() => Array.from(new Set(residences.map((item) => item.bairro).filter(Boolean))).sort(), [residences])
  const moradoresFiltrados = useMemo(() => moradorId === "todos" ? moradores : moradores.filter((item) => item.uid === moradorId), [moradores, moradorId])
  const residencesFiltered = useMemo(() => residences.filter((item) => (status === "todos" || item.status === status) && (bairro === "todos" || item.bairro === bairro) && (residenceId === "todos" || item.id === residenceId)), [residences, status, bairro, residenceId])

  const historyFiltered = useMemo(() => {
    if (historyRange === "all") return history
    const now = new Date()
    const start = new Date(now)
    if (historyRange === "today") start.setHours(0, 0, 0, 0)
    if (historyRange === "yesterday") { start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0) }
    if (historyRange === "five-days") start.setDate(start.getDate() - 5)
    return history.filter((item) => item.timestamp >= start.getTime())
  }, [history, historyRange])

  const rows = {
    residencias: residencesFiltered.map((item) => ({ "Código da residência": item.codigo || "Sem código", Morador: item.nome_morador || item.proprietario || "", Bairro: item.bairro || "", Rua: item.rua || "", Telefone: item.telefone || item.contacto || "", Estado: item.status || "", Validade: item.estadoResidencia || "valido", Motivo: item.motivoRejeicao || item.mensagemEstado || "", Data: formatDate(item.criadoEm) })),
    moradores: moradoresFiltrados.map((item) => {
      const residence = residences.find((entry) => entry.morador_uid === item.uid || entry.nome_morador === item.nome || entry.telefone === item.telefone)
      return { ID: item.uid, Nome: item.nome, Telefone: item.telefone, Tipo: item.tipo || "", Bairro: residence?.bairro || "Sem residência", "Código da residência": residence?.codigo || "Sem código" }
    }),
    historico: historyFiltered.map((item) => ({ Data: item.data, Hora: item.hora, Evento: item.evento, Agente: item.agente })),
  }

  const printPdf = () => {
    const sections = Object.entries(rows).filter(([key]) => (key === "residencias" && includeResidences) || (key === "moradores" && includeMoradores) || (key === "historico" && includeHistory))
    const html = sections.map(([title, values]) => `<h2>${escapeHtml(title)}</h2><table><thead><tr>${Object.keys(values[0] || {}).map((key) => `<th>${escapeHtml(key)}</th>`).join("")}</tr></thead><tbody>${values.map((row) => `<tr>${Object.values(row).map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("")
    const printWindow = window.open("", "_blank", "width=1000,height=800")
    if (!printWindow) return
    printWindow.document.write(`<html><head><title>Backup SIRCAH</title><style>@page{size:A4;margin:18mm}body{font-family:Arial;color:#172033}h1{font-size:20px;margin-bottom:6px}h2{font-size:15px;margin-top:24px;text-transform:capitalize}p{font-size:11px;line-height:1.5}table{border-collapse:collapse;width:100%;font-size:9px}th,td{border:1px solid #ccd3df;padding:5px;text-align:left}th{background:#e9eef5}</style></head><body><h1>${INSTITUTION}</h1><p>${OBJECTIVE}</p><p>Exportado em ${new Date().toLocaleString("pt-PT")}</p>${html}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const exportXlsx = () => {
    const workbook = XLSX.utils.book_new()
    if (includeResidences) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.residencias), "Residências")
    if (includeMoradores) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.moradores), "Moradores")
    if (includeHistory) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.historico), "Histórico")
    XLSX.writeFile(workbook, `backup-sircah-${Date.now()}.xlsx`)
  }

  const exportDocx = async () => {
    const children: (Paragraph | Table)[] = [new Paragraph({ text: INSTITUTION, heading: HeadingLevel.TITLE }), new Paragraph(OBJECTIVE), new Paragraph(`Exportado em ${new Date().toLocaleString("pt-PT")}`)]
    Object.entries(rows).forEach(([title, values]) => {
      const enabled = (title === "residencias" && includeResidences) || (title === "moradores" && includeMoradores) || (title === "historico" && includeHistory)
      if (!enabled) return
      children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }))
      const tableRows = values.map((row) => new TableRow({ children: Object.values(row).map((value) => new TableCell({ children: [new Paragraph(String(value ?? ""))] })) }))
      if (values[0]) children.push(new Paragraph({ children: [new TextRun(Object.keys(values[0]).join(" | ").bold())] }), new Table({ rows: tableRows }))
    })
    const blob = await Packer.toBlob(new Document({ sections: [{ children }] }))
    downloadBlob(blob, `backup-sircah-${Date.now()}.docx`)
  }

  const handleExport = async () => {
    if (!includeResidences && !includeMoradores && !includeHistory) return
    if (format === "pdf") printPdf()
    if (format === "xlsx") exportXlsx()
    if (format === "docx") await exportDocx()
  }

  return (
    <div className="min-h-full bg-background p-2 sm:p-4">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3"><Link href="/configuracoes"><Button variant="ghost" size="sm" className="h-9 w-9 p-0"><ArrowLeft className="h-4 w-4" /></Button></Link><div><h1 className="text-xl font-semibold text-foreground">Backup de dados</h1><p className="text-sm text-muted-foreground">Exportação completa do sistema</p></div></div><NotificationBell />
        </header>
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-semibold text-foreground">Objetivo da exportação</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{OBJECTIVE}</p></div></div></section>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="mb-4 font-semibold text-foreground">Dados a incluir</h2><div className="grid gap-3 sm:grid-cols-3">{[[includeResidences, setIncludeResidences, "Residências", residences.length], [includeMoradores, setIncludeMoradores, "Moradores", moradores.length], [includeHistory, setIncludeHistory, "Histórico de atividades", history.length]].map(([checked, setter, label, count]) => <label key={String(label)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="h-4 w-4" /><span className="text-sm font-medium text-foreground">{String(label)} <small className="text-muted-foreground">({String(count)})</small></span></label>)}</div></section>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="mb-4 font-semibold text-foreground">Filtros</h2><div className="grid gap-4 md:grid-cols-3"><label className="text-sm font-medium text-foreground">Estado<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 font-normal"><option value="todos">Todas</option><option value="pendente">Pendentes</option><option value="aprovado">Aprovadas</option><option value="rejeitada">Rejeitadas</option></select></label><label className="text-sm font-medium text-foreground">Bairro<select value={bairro} onChange={(event) => setBairro(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 font-normal"><option value="todos">Todos os bairros</option>{bairros.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium text-foreground">Código da residência<select value={residenceId} onChange={(event) => setResidenceId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 font-normal"><option value="todos">Todas as residências</option>{residences.map((item) => <option key={item.id} value={item.id}>{item.codigo || "Sem código"} - {item.nome_morador || "Sem morador"}</option>)}</select></label><label className="text-sm font-medium text-foreground">Morador<select value={moradorId} onChange={(event) => setMoradorId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 font-normal"><option value="todos">Todos os moradores</option>{moradores.map((item) => <option key={item.uid} value={item.uid}>{item.nome}</option>)}</select></label><label className="text-sm font-medium text-foreground">Período do histórico<select value={historyRange} onChange={(event) => setHistoryRange(event.target.value as HistoryRange)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 font-normal"><option value="today">Hoje</option><option value="yesterday">Ontem</option><option value="five-days">Últimos 5 dias</option><option value="all">Todo o histórico</option></select></label></div></section>
        <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-end"><div><h2 className="font-semibold text-foreground">Formato do ficheiro</h2><p className="mt-1 text-sm text-muted-foreground">Escolha o formato antes de exportar ou imprimir.</p><div className="mt-3 flex flex-wrap gap-2">{([["xlsx", "Excel", FileSpreadsheet], ["docx", "DOCX", FileText], ["pdf", "PDF / imprimir", Printer]] as const).map(([value, label, Icon]) => <button key={value} onClick={() => setFormat(value)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${format === value ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div><Button disabled={loading || (!includeResidences && !includeMoradores && !includeHistory)} onClick={handleExport} className="rounded-xl bg-primary px-6 text-primary-foreground">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Exportar dados</Button></section>
        <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4" /> Residências filtradas: {residencesFiltered.length} · Moradores: {moradoresFiltrados.length} · Atividades: {historyFiltered.length}</p>
      </div>
    </div>
  )
}
