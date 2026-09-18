"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewUserModal } from "@/components/new-user-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db, auth } from "@/lib/Services/firebaseConfig"
import { collection, onSnapshot, query, where } from "firebase/firestore"

type FilterType = "todos" | "administradores" | "agentes"

interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  funcao: "administrador" | "agente" | "visualizador"
  ultimoAcesso: string
  estado: "ativo" | "inativo"
}

const roleLabels: Record<User["funcao"], string> = {
  administrador: "Administrador",
  agente: "Agente",
  visualizador: "Visualizador",
}

const roleColors: Record<User["funcao"], string> = {
  administrador: "bg-blue-500/10 text-blue-600",
  agente: "bg-purple-500/10 text-purple-600",
  visualizador: "bg-gray-500/10 text-gray-600",
}

export default function UsersPage() {
  const [filter, setFilter] = useState<FilterType>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribeProfile: () => void = () => {}

    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const profileQuery = query(collection(db, "usuariosWeb"), where("uid", "==", currentUser.uid))
      unsubscribeProfile = onSnapshot(profileQuery, (snapshot) => {
        const userData = snapshot.empty ? null : snapshot.docs[0].data()
        setIsAdmin(userData?.funcao?.trim() === "administrador")
        setIsLoading(false)
      }, (error) => {
        console.error("Erro ao ler perfil do administrador:", error)
        setIsAdmin(false)
        setIsLoading(false)
      })
    })

    const unsubscribeUsers = onSnapshot(collection(db, "usuariosWeb"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
          funcao: data.funcao || "visualizador",
          ultimoAcesso: data.ultimoAcesso || "Nunca",
          estado: data.estado || "ativo",
        } as User
      }))
    }, (error) => console.error("Erro ao listar utilizadores:", error))

    return () => {
      unsubscribeAuth()
      unsubscribeUsers()
      unsubscribeProfile()
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === "todos" || (filter === "administradores" && user.funcao === "administrador") || (filter === "agentes" && user.funcao === "agente")
    const term = searchQuery.toLowerCase()
    return matchesFilter && (!term || user.nome.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
  })

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">A verificar permissões no SIRCAH...</div>
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center"><div className="max-w-md space-y-2"><h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2><p className="text-sm text-muted-foreground">Esta área é restrita para contas de administrador do sistema web.</p></div></div>

  return (
    <div className="min-h-full bg-background p-2 sm:p-4">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex w-full items-center justify-between gap-4">
          <div><h1 className="text-xl font-semibold text-foreground sm:text-2xl">Gestão de Utilizadores</h1><p className="mt-1 hidden text-sm text-muted-foreground sm:block">Gerir acessos e permissões do sistema</p></div>
          <Button onClick={() => setShowNewUserModal(true)} className="h-10 shrink-0 gap-2 rounded-full px-4 text-sm sm:h-11 sm:px-6"><Plus className="h-4 w-4" /><span>Novo Utilizador</span></Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">{(["todos", "administradores", "agentes"] as FilterType[]).map((filterOption) => <Button key={filterOption} variant={filter === filterOption ? "default" : "outline"} size="sm" onClick={() => setFilter(filterOption)} className="h-9 rounded-full px-4 text-xs capitalize sm:text-sm">{filterOption}</Button>)}</div>
          <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Pesquisar utilizadores..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 w-full rounded-xl pl-9" /></div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border"><Table className="min-w-[700px]"><TableHeader><TableRow className="border-border bg-card hover:bg-transparent"><TableHead className="px-6 py-4">Utilizador</TableHead><TableHead>Função</TableHead><TableHead>Último Acesso</TableHead><TableHead>Estado</TableHead><TableHead className="px-6 text-right">Ações</TableHead></TableRow></TableHeader><TableBody>
          {filteredUsers.map((user) => <TableRow key={user.id} className="border-border transition-colors hover:bg-muted/50"><TableCell className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-sm font-semibold text-primary shadow-sm">{user.nome.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2)}</div><div><p className="text-sm font-medium text-foreground">{user.nome}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleColors[user.funcao]}`}>{roleLabels[user.funcao]}</span></TableCell><TableCell className="text-sm text-muted-foreground">{user.ultimoAcesso}</TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.estado === "ativo" ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}`}>{user.estado === "ativo" ? "Ativo" : "Inativo"}</span></TableCell><TableCell className="px-6"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted"><Pencil className="h-4 w-4 text-muted-foreground" /><span className="sr-only">Editar</span></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Eliminar</span></Button></div></TableCell></TableRow>)}
        </TableBody></Table></div>
        {filteredUsers.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhum utilizador encontrado.</p>}
      </div>
      <NewUserModal isOpen={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
    </div>
  )
}
