"use client"

import { useEffect, useState } from "react"
import { UserPlus, UserPen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/lib/Services/firebaseConfig"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { cadastrarUsuarioWeb } from "@/lib/usuario/user-service"
import { toast } from "sonner"

type UserRole = "administrador" | "agente" | "visualizador"

interface NewUserModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: "create" | "edit"
  user?: {
    id: string
    nome: string
    email: string
    telefone?: string
    funcao: UserRole
  }
}

const defaultFormData = {
  nome: "",
  email: "",
  telefone: "",
  funcao: "",
  senha: "",
}

export function NewUserModal({ isOpen, onClose, mode = "create", user }: NewUserModalProps) {
  const isEditMode = mode === "edit" && Boolean(user)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)

  useEffect(() => {
    if (!isOpen) return

    if (isEditMode && user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        funcao: user.funcao || "",
        senha: "",
      })
      return
    }

    setFormData(defaultFormData)
  }, [isOpen, isEditMode, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.funcao) {
      toast.error("Por favor, selecione um perfil/função para o utilizador.")
      return
    }

    if (!isEditMode && formData.senha.length < 6) {
      toast.error("A senha inicial deve conter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      if (isEditMode && user) {
        await updateDoc(doc(db, "usuariosWeb", user.id), {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          funcao: formData.funcao,
          role: formData.funcao,
          perfil: formData.funcao,
          atualizadoEm: serverTimestamp(),
        })

        toast.success("Função do utilizador atualizada com sucesso!")
      } else {
        await cadastrarUsuarioWeb({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          funcao: formData.funcao,
          senha: formData.senha,
        })

        toast.success("Utilizador cadastrado com sucesso!")
      }

      setFormData(defaultFormData)
      onClose()
      window.location.reload()
    } catch (error: any) {
      console.error("Erro capturado no modal:", error)
      toast.error(isEditMode ? "Erro ao atualizar utilizador: " + (error.message || "Erro desconhecido") : "Erro ao cadastrar: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-[28px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="p-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isEditMode ? <UserPen className="h-8 w-8 text-primary" /> : <UserPlus className="h-8 w-8 text-primary" />}
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {isEditMode ? "Editar Utilizador" : "Novo Utilizador"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              {isEditMode ? "Atualize a função e os dados principais do utilizador." : "Preencha os dados para criar uma nova conta no SIRCAH"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                Nome Completo
              </Label>
              <Input
                id="nome"
                required
                disabled={loading}
                placeholder="Ex: João António"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="h-11 rounded-xl border-border bg-muted/30 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  disabled={loading || isEditMode}
                  placeholder="email@exemplo.ao"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-xl border-border bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium text-foreground">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  required
                  disabled={loading}
                  placeholder="+244 9XX XXX XXX"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="h-11 rounded-xl border-border bg-muted/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcao" className="text-sm font-medium text-foreground">
                Perfil / Função
              </Label>
              <Select
                disabled={loading}
                value={formData.funcao}
                onValueChange={(value: string) => setFormData({ ...formData, funcao: value })}
              >
                <SelectTrigger className="h-11 rounded-xl border-border bg-muted/30">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="agente">Agente</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium text-foreground">
                  Senha Inicial
                </Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  disabled={loading}
                  placeholder="Defina uma senha segura"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="h-11 rounded-xl border-border bg-muted/30"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="h-11 flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-xl bg-[#FF5F6D] text-white shadow-lg shadow-red-200 hover:bg-[#FF5F6D]/90 disabled:opacity-70"
              >
                {loading ? "A processar..." : isEditMode ? "Guardar" : "Criar Conta"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}