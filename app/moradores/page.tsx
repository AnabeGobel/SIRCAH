"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Eye, Filter, Loader2, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchTodasResidencias, type Residencia } from "@/lib/residence-service"
import { fetchTodosMoradores, type Morador } from "@/lib/residencia/morador-service"

interface MoradorRow {
  id: string
  nome: string
  telefone: string
  bairro: string
  codigo: string
  residenciaId: string
  estado: "Ativo" | "Pendente" | "Rejeitada" | "Sem residência"
  dataRegisto: string
  motivoRejeicao: string
  estadoResidencia: "valido" | "invalido"
  mensagemEstado: string
}

const PAGE_SIZE = 5

function formatarData(data: Date | null) {
  return data ? data.toLocaleDateString("pt-PT") : "Não atribuída"
}

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).map((parte) => parte[0]).join("").slice(0, 2).toUpperCase() || "MO"
}

export default function MoradoresPage() {
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [residencias, setResidencias] = useState<Residencia[]>([])
  const [pesquisa, setPesquisa] = useState("")
  const [bairro, setBairro] = useState("todos")
  const [estado, setEstado] = useState("todos")
  const [pagina, setPagina] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  useEffect(() => {
    Promise.all([fetchTodosMoradores(), fetchTodasResidencias()])
      .then(([moradoresData, residenciasData]) => {
        setMoradores(moradoresData)
        setResidencias(residenciasData)
      })
      .catch(() => setErro("Não foi possível carregar os moradores."))
      .finally(() => setCarregando(false))
  }, [])

  const linhas = useMemo<MoradorRow[]>(() => {
    const porMorador = new Map<string, MoradorRow>()

    moradores.forEach((morador) => {
      porMorador.set(morador.uid, {
        id: morador.uid,
        nome: morador.nome,
        telefone: morador.telefone,
        bairro: "Não atribuído",
        codigo: "Não atribuído",
        residenciaId: "",
        estado: "Sem residência",
        dataRegisto: "Não atribuída",
        motivoRejeicao: "",
        estadoResidencia: "valido",
        mensagemEstado: "",
      })
    })

    residencias.forEach((residencia) => {
      if (!residencia.nome_morador && !residencia.telefone) return
      const morador = moradores.find((item) =>
        item.uid === (residencia as Residencia & { morador_uid?: string }).morador_uid ||
        (item.nome && item.nome === residencia.nome_morador) ||
        (item.telefone && item.telefone === residencia.telefone)
      )
      const id = morador?.uid || `residencia-${residencia.id}`
      porMorador.set(id, {
        id,
        nome: residencia.nome_morador || morador?.nome || "Não identificado",
        telefone: residencia.telefone || morador?.telefone || "Não disponível",
        bairro: residencia.bairro || "Não atribuído",
        codigo: residencia.codigo || "Não atribuído",
        residenciaId: residencia.id,
        estado: residencia.status === "aprovado" ? "Ativo" : residencia.status === "rejeitada" ? "Rejeitada" : "Pendente",
        dataRegisto: formatarData(residencia.criadoEm),
        motivoRejeicao: residencia.motivoRejeicao || "",
        estadoResidencia: residencia.estadoResidencia || "valido",
        mensagemEstado: residencia.mensagemEstado || "",
      })
    })

    return Array.from(porMorador.values()).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [moradores, residencias])

  const bairros = useMemo(() => Array.from(new Set(linhas.map((linha) => linha.bairro))).sort(), [linhas])
  const filtradas = linhas.filter((linha) => {
    const termo = pesquisa.trim().toLowerCase()
    const encontrou = !termo || [linha.nome, linha.telefone, linha.bairro, linha.codigo].some((valor) => valor.toLowerCase().includes(termo))
    return encontrou && (bairro === "todos" || linha.bairro === bairro) && (estado === "todos" || linha.estado === estado)
  })
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const visiveis = filtradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  useEffect(() => setPagina(1), [pesquisa, bairro, estado])

  const limparFiltros = () => {
    setPesquisa("")
    setBairro("todos")
    setEstado("todos")
  }

  return (
    <div className="min-h-full bg-background p-2 sm:p-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Moradores</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{linhas.length} registos</span>
          </div>
          <div className="relative w-full sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={pesquisa} onChange={(event) => setPesquisa(event.target.value)} placeholder="Pesquisar por nome, telefone ou código..." className="h-10 rounded-full pl-9" />
          </div>
        </header>

        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <select value={bairro} onChange={(event) => setBairro(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
            <option value="todos">Todos os Bairros</option>
            {bairros.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
          </select>
          <select value={estado} onChange={(event) => setEstado(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
            <option value="todos">Todos os Estados</option>
            <option value="Ativo">Ativo</option>
            <option value="Pendente">Pendente</option>
            <option value="Rejeitada">Rejeitada</option>
            <option value="Sem residência">Sem residência</option>
          </select>
          <Button variant="outline" onClick={limparFiltros} className="gap-2 sm:ml-auto"><Filter className="h-4 w-4" /> Limpar filtros</Button>
        </div>

        {carregando ? <div className="flex justify-center p-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : erro ? <p className="p-10 text-center text-sm text-destructive">{erro}</p> : <>
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="px-5">Morador</TableHead><TableHead>Telefone</TableHead><TableHead>Bairro</TableHead><TableHead>Residência</TableHead><TableHead>Validade</TableHead><TableHead>Estado</TableHead><TableHead>Mensagem da alteração</TableHead><TableHead>Motivo da rejeição</TableHead><TableHead>Data de Registo</TableHead><TableHead className="px-5 text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {visiveis.map((linha) => <TableRow key={linha.id} className="border-border hover:bg-muted/40">
                  <TableCell className="px-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{iniciais(linha.nome)}</span><div><p className="text-sm font-medium text-foreground">{linha.nome}</p><p className="text-xs text-muted-foreground">Morador</p></div></div></TableCell>
                  <TableCell className="text-sm text-foreground">{linha.telefone || "Não disponível"}</TableCell><TableCell className="text-sm text-foreground">{linha.bairro}</TableCell><TableCell><p className="font-mono text-xs text-foreground">{linha.codigo}</p>{linha.residenciaId && <p className="text-[11px] text-status-approved">{linha.estado === "Ativo" ? "Ativa" : "Em análise"}</p>}</TableCell>
                  <TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${linha.estadoResidencia === "valido" ? "bg-status-approved/10 text-status-approved" : "bg-status-rejected/10 text-status-rejected"}`}>{linha.estadoResidencia === "valido" ? "Válida" : "Inválida"}</span></TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${linha.estado === "Ativo" ? "bg-status-approved/10 text-status-approved" : linha.estado === "Pendente" ? "bg-status-pending/10 text-status-pending" : linha.estado === "Rejeitada" ? "bg-status-rejected/10 text-status-rejected" : "bg-muted text-muted-foreground"}`}>{linha.estado}</span></TableCell><TableCell className="max-w-[260px] text-sm text-muted-foreground">{linha.mensagemEstado || "-"}</TableCell><TableCell className="max-w-[260px] text-sm text-muted-foreground">{linha.motivoRejeicao || "-"}</TableCell><TableCell className="text-sm text-muted-foreground">{linha.dataRegisto}</TableCell>
                  <TableCell className="px-5 text-right">{linha.residenciaId ? <Link href={`/residencias/${linha.residenciaId}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" aria-label={`Ver ${linha.nome}`}><Eye className="h-4 w-4 text-muted-foreground" /></Button></Link> : <span className="text-xs text-muted-foreground">-</span>}</TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </div>
          {visiveis.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Nenhum morador encontrado.</p>}
          <footer className="flex flex-col gap-3 border-t border-border p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Mostrando {filtradas.length ? (pagina - 1) * PAGE_SIZE + 1 : 0} a {Math.min(pagina * PAGE_SIZE, filtradas.length)} de {filtradas.length} registos</span><div className="flex items-center gap-1"><Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina((valor) => valor - 1)} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></Button><span className="px-3">Página {pagina} de {totalPaginas}</span><Button variant="outline" size="sm" disabled={pagina === totalPaginas} onClick={() => setPagina((valor) => valor + 1)} aria-label="Próxima página"><ChevronRight className="h-4 w-4" /></Button></div></footer>
        </>}
      </div>
    </div>
  )
}
