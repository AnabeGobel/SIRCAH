"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle2, ChevronRight, FilePlus, XCircle } from "lucide-react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/Services/firebaseConfig"
import { Button } from "@/components/ui/button"

type NotificationType = "registos" | "validacoes" | "rejeicoes"
type NotificationIcon = "registo" | "aprovado" | "rejeitada"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  icon: NotificationIcon
}

const getNotification = (id: string, data: Record<string, any>): NotificationItem => {
  const code = data.codigo || "Sem código"
  const justification = data.justificativaReenvio || data.justificativa || data.mensagemReenvio || data.justificativaEdicao || ""
  const justificationAttachment = data.anexoJustificacao || data.documentoJustificacao || data.imagemJustificacao || data.justificativaArquivo || data.comprovativoReenvio || ""

  if (justification && (data.status === "pendente" || data.reenviadoParaRevisao || data.editadoEm)) {
    return {
      id: `resubmitted-${id}-${data.editadoEm?.seconds || "atual"}`,
      title: "Cadastro reenviado para revisão",
      message: `Residência [${code}]: ${justification}${justificationAttachment ? " Anexo de justificação enviado para análise." : ""}`,
      type: "registos",
      icon: "registo",
    }
  }

  if (data.status === "rejeitada") {
    return {
      id: `rejected-${id}`,
      title: "Registo rejeitado",
      message: data.motivoRejeicao || `O registo [${code}] foi rejeitado.`,
      type: "rejeicoes",
      icon: "rejeitada",
    }
  }

  if (data.estadoResidencia === "invalido") {
    return {
      id: `invalid-${id}`,
      title: "Residência marcada como inválida",
      message: data.mensagemEstado || `A residência [${code}] foi marcada como inválida.`,
      type: "rejeicoes",
      icon: "rejeitada",
    }
  }

  if (data.status === "aprovado") {
    return {
      id: `approved-${id}`,
      title: "Registo aprovado",
      message: `Residência [${code}] foi validada e o QR Code foi gerado.`,
      type: "validacoes",
      icon: "aprovado",
    }
  }

  return {
    id: `pending-${id}`,
    title: "Novo registo pendente",
    message: `A residência de ${data.nome_morador || "um morador"} aguarda validação.`,
    type: "registos",
    icon: "registo",
  }
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "residencias"),
      (snapshot) => {
        setNotifications(snapshot.docs.map((item) => getNotification(item.id, item.data())).slice(0, 10))
      },
      (error) => console.error("Erro ao carregar notificações:", error),
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const goToHistory = (type: NotificationType) => {
    setOpen(false)
    router.push(`/historico?filtro=${type}`)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 relative shrink-0 rounded-xl hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {notifications.length > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse" />}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h3 className="font-semibold text-sm text-foreground">Notificações</h3></div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{notifications.length} recentes</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {notifications.length ? notifications.map((item) => (
              <button key={item.id} onClick={() => goToHistory(item.type)} className="w-full text-left p-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 group">
                <div className="mt-0.5 shrink-0">
                  {item.icon === "registo" && <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><FilePlus className="h-4 w-4" /></div>}
                  {item.icon === "aprovado" && <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-4 w-4" /></div>}
                  {item.icon === "rejeitada" && <div className="p-2 rounded-xl bg-destructive/10 text-destructive"><XCircle className="h-4 w-4" /></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-foreground truncate">{item.title}</p><p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.message}</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 self-center" />
              </button>
            )) : <div className="p-6 text-center text-xs text-muted-foreground">Nenhuma notificação recente.</div>}
          </div>
          <div className="p-2 border-t border-border bg-muted/20 text-center"><button onClick={() => goToHistory("todos" as NotificationType)} className="text-xs font-medium text-primary hover:underline py-1 w-full">Ver todo o histórico de rastreabilidade</button></div>
        </div>
      )}
    </div>
  )
}
