"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
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

// Integração das dependências lógicas sugeridas
import { cadastrarUsuarioWeb } from "@/lib/usuario/user-service"
import { toast } from "sonner"

interface NewUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    senha: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação extra de segurança no frontend antes de enviar
    if (!formData.funcao) {
      toast.error("Por favor, selecione um perfil/função para o utilizador.")
      return
    }

    if (formData.senha.length < 6) {
      toast.error("A senha inicial deve conter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      // Envia os dados estruturados para a tua função do Firebase
      await cadastrarUsuarioWeb({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        funcao: formData.funcao,
        senha: formData.senha,
      })
      
      toast.success("Utilizador cadastrado com sucesso!")
      
      // Limpar formulário
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        funcao: "",
        senha: "",
      })
      
      onClose()
      
      // Executa o recarregamento para atualizar a tabela do Firebase em tempo real
      window.location.reload()
    } catch (error: any) {
      console.error("Erro capturado no modal:", error)
      toast.error("Erro ao cadastrar: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-[28px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="p-8">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Novo Utilizador
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Preencha os dados para criar uma nova conta no SIRCAH
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
                className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary"
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
                  disabled={loading}
                  placeholder="email@exemplo.ao"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-xl bg-muted/30 border-border"
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
                  className="h-11 rounded-xl bg-muted/30 border-border"
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
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="agente">Agente</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                className="h-11 rounded-xl bg-muted/30 border-border"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-[#FF5F6D] hover:bg-[#FF5F6D]/90 text-white shadow-lg shadow-red-200 disabled:opacity-70"
              >
                {loading ? "A processar..." : "Criar Conta"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}