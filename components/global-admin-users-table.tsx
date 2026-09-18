"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, Power, Search, ShieldCheck, UserRound, Users, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  alterarEstadoUtilizadorGlobal,
  observarUtilizadoresGlobais,
  type TipoUtilizadorGlobal,
  type UtilizadorGlobal,
} from "@/lib/admin-global/usuarios-service"

type Filtro = "todos" | TipoUtilizadorGlobal

const initials = (name: string) => name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U"

export function GlobalAdminUsersTable({ tipoInicial = "todos" }: { tipoInicial?: Filtro }) {
  const [utilizadores, setUtilizadores] = useState<UtilizadorGlobal[]>([])
  const [filtro, setFiltro] = useState<Filtro>(tipoInicial)
  const [pesquisa, setPesquisa] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    return observarUtilizadoresGlobais((items) => {
      setUtilizadores(items)
      setLoading(false)
      setError("")
    }, (snapshotError) => {
      console.error("Erro ao carregar utilizadores globais:", snapshotError)
      setLoading(false)
      setError("Não foi possível carregar os dados. Verifique as regras do Firestore para agentes e moradores.")
    })
  }, [])

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()
    return utilizadores.filter((item) => {
      const correspondeTipo = filtro === "todos" || item.tipo === filtro
      const correspondePesquisa = !termo || [item.nome, item.email, item.telefone].some((value) => value.toLowerCase().includes(termo))
      return correspondeTipo && correspondePesquisa
    })
  }, [filtro, pesquisa, utilizadores])

  const alternarEstado = async (item: UtilizadorGlobal) => {
    setUpdatingId(item.id)
    try {
      await alterarEstadoUtilizadorGlobal(item)
      toast.success(item.estado === "ativo" ? "Utilizador desativado." : "Utilizador ativado.")
    } catch (updateError) {
      console.error("Erro ao alterar estado do utilizador:", updateError)
      toast.error("Não foi possível alterar o estado deste utilizador.")
    } finally {
      setUpdatingId(null)
    }
  }

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {(["todos", "agente", "morador", "administrador"] as Filtro[]).map((option) => <Button key={option} variant={filtro === option ? "default" : "outline"} size="sm" onClick={() => setFiltro(option)} className="h-9 rounded-full px-4">{option === "todos" ? "Todos" : option === "agente" ? "Agentes" : option === "morador" ? "Moradores" : "Administradores"}</Button>)}
      </div>
      <div className="relative w-full lg:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={pesquisa} onChange={(event) => setPesquisa(event.target.value)} placeholder="Pesquisar nome, email ou telefone" className="h-10 rounded-xl pl-9" /></div>
    </div>

    {error && <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-12 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />A carregar utilizadores...</div> : <div className="overflow-x-auto rounded-2xl border border-border bg-card"><Table className="min-w-[780px]"><TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="px-6 py-4">Utilizador</TableHead><TableHead>Tipo</TableHead><TableHead>Telefone</TableHead><TableHead>Estado</TableHead><TableHead className="px-6 text-right">Acção</TableHead></TableRow></TableHeader><TableBody>{filtrados.map((item) => <TableRow key={`${item.tipo}-${item.id}`} className="border-border hover:bg-muted/50"><TableCell className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(item.nome)}</div><div><p className="font-medium text-foreground">{item.nome}</p><p className="text-xs text-muted-foreground">{item.email || "Email não registado"}</p></div></div></TableCell><TableCell><span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{item.tipo === "agente" ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}{item.tipo === "agente" ? "Agente" : "Morador"}</span></TableCell><TableCell className="text-sm text-muted-foreground">{item.telefone || "Não registado"}</TableCell><TableCell><span className={item.estado === "ativo" ? "inline-flex items-center gap-1.5 text-sm font-medium text-status-approved" : "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"}>{item.estado === "ativo" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{item.estado === "ativo" ? "Ativo" : "Inativo"}</span></TableCell><TableCell className="px-6 text-right"><Button variant="outline" size="sm" disabled={updatingId === item.id} onClick={() => alternarEstado(item)} className="gap-2 rounded-xl">{updatingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}{item.estado === "ativo" ? "Desativar" : "Ativar"}</Button></TableCell></TableRow>)}</TableBody></Table>{filtrados.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground"><Users className="mx-auto mb-3 h-6 w-6" />Nenhum utilizador encontrado.</div>}</div>}
  </div>
}
