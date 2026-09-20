"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle2, ChevronRight, FilePlus, XCircle, RefreshCw } from "lucide-react"
import { collection, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/Services/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"

type NotificationType = "registos" | "validacoes" | "rejeicoes" | "atualizacoes"
type NotificationIcon = "registo" | "aprovado" | "rejeitada" | "atualizacao"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  icon: NotificationIcon
  residenceId: string
  createdAt: number
}

type NotificationData = Record<string, unknown>

const textValue = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback
const timestampValue = (value: unknown) => {
  if (!value || typeof value !== "object" || !("seconds" in value)) return 0
  const seconds = value.seconds
  return typeof seconds === "number" ? seconds : 0
}

const getNotification = (id: string, data: NotificationData): NotificationItem => {
  const code = textValue(data.codigo, "Sem código")
  const justification = [data.justificativaReenvio, data.justificativa, data.mensagemReenvio, data.justificativaEdicao].map((value) => textValue(value)).find(Boolean) || ""
  const justificationAttachment = [data.anexoJustificacao, data.documentoJustificacao, data.imagemJustificacao, data.justificativaArquivo, data.comprovativoReenvio].map((value) => textValue(value)).find(Boolean) || ""
  const timestamp = timestampValue(data.editadoEm) || timestampValue(data.atualizadoEm) || timestampValue(data.criadoEm)
  const status = textValue(data.status)

  if (justification && (status === "pendente" || Boolean(data.reenviadoParaRevisao) || Boolean(data.editadoEm))) {
    return {
      id: `resubmitted-${id}-${timestamp || "atual"}`,
      title: "Cadastro reenviado para revisão",
      message: `Residência [${code}]: ${justification}${justificationAttachment ? " Anexo de justificação enviado para análise." : ""}`,
      type: "registos",
      icon: "registo",
      residenceId: id,
      createdAt: timestamp,
    }
  }

  if (status === "rejeitada") {
    return {
      id: `rejected-${id}`,
      title: "Registo rejeitado",
      message: textValue(data.motivoRejeicao, `O registo [${code}] foi rejeitado.`),
      type: "rejeicoes",
      icon: "rejeitada",
      residenceId: id,
      createdAt: timestampValue(data.rejeitadoEm) || timestamp,
    }
  }

  if (data.estadoResidencia === "invalido") {
    return {
      id: `invalid-${id}`,
      title: "Residência marcada como inválida",
      message: textValue(data.mensagemEstado, `A residência [${code}] foi marcada como inválida.`),
      type: "rejeicoes",
      icon: "rejeitada",
      residenceId: id,
      createdAt: timestampValue(data.estadoAlteradoEm) || timestamp,
    }
  }

  if (status === "aprovado") {
    return {
      id: `approved-${id}`,
      title: "Registo aprovado",
      message: `Residência [${code}] foi validada e o QR Code foi gerado.`,
      type: "validacoes",
      icon: "aprovado",
      residenceId: id,
      createdAt: timestampValue(data.aprovadoEm) || timestamp,
    }
  }

  return {
    id: `pending-${id}`,
    title: "Novo registo pendente",
    message: `A residência de ${textValue(data.nome_morador, "um morador")} aguarda validação.`,
    type: "registos",
    icon: "registo",
    residenceId: id,
    createdAt: timestamp,
  }
}

const getEventNotification = (id: string, data: NotificationData): NotificationItem => ({
  id: `event-${id}`,
  title: textValue(data.titulo, "Nova atividade na residência"),
  message: textValue(data.mensagem, "Existe uma nova atividade para verificar."),
  type: data.tipo === "validacoes" || data.tipo === "rejeicoes" || data.tipo === "registos" || data.tipo === "atualizacoes" ? data.tipo : "atualizacoes",
  icon: data.tipo === "validacoes" ? "aprovado" : data.tipo === "rejeicoes" ? "rejeitada" : data.tipo === "atualizacoes" ? "atualizacao" : "registo",
  residenceId: textValue(data.residenciaId),
  createdAt: timestampValue(data.criadoEm),
})

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [residenceNotifications, setResidenceNotifications] = useState<NotificationItem[]>([])
  const [eventNotifications, setEventNotifications] = useState<NotificationItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let unsubscribeResidences: (() => void) | undefined
    let unsubscribeEvents: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeResidences?.()
      unsubscribeEvents?.()
      setResidenceNotifications([])
      setEventNotifications([])
      if (!user) return

      unsubscribeResidences = onSnapshot(collection(db, "residencias"), (snapshot) => {
        setResidenceNotifications(snapshot.docs.map((item) => getNotification(item.id, item.data())))
      }, (error) => {
        if (auth.currentUser) console.error("Erro ao carregar notificações:", error)
      })

      unsubscribeEvents = onSnapshot(collection(db, "notificacoes"), (snapshot) => {
        setEventNotifications(snapshot.docs
          .map((item) => getEventNotification(item.id, item.data()))
          .filter((item) => item.residenceId))
      }, (error) => {
        if (auth.currentUser) console.error("Erro ao carregar atividades das residências:", error)
      })
    })

    return () => {
      unsubscribeAuth()
      unsubscribeResidences?.()
      unsubscribeEvents?.()
    }
  }, [])

  const notifications = useMemo(() => {
    const latestEventByResidence = new Map<string, number>()
    eventNotifications.forEach((item) => {
      latestEventByResidence.set(item.residenceId, Math.max(latestEventByResidence.get(item.residenceId) || 0, item.createdAt))
    })
    const fallbackNotifications = residenceNotifications.filter((item) => {
      const latestEvent = latestEventByResidence.get(item.residenceId)
      return latestEvent === undefined || item.createdAt > latestEvent
    })
    return [...eventNotifications, ...fallbackNotifications]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
  }, [eventNotifications, residenceNotifications])

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

  const goToResidence = (residenceId: string) => {
    setOpen(false)
    router.push(`/residencias/${residenceId}`)
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
              <button key={item.id} onClick={() => goToResidence(item.residenceId)} className="w-full text-left p-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 group">
                <div className="mt-0.5 shrink-0">
                  {item.icon === "registo" && <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><FilePlus className="h-4 w-4" /></div>}
                  {item.icon === "aprovado" && <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-4 w-4" /></div>}
                  {item.icon === "rejeitada" && <div className="p-2 rounded-xl bg-destructive/10 text-destructive"><XCircle className="h-4 w-4" /></div>}
                  {item.icon === "atualizacao" && <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><RefreshCw className="h-4 w-4" /></div>}
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
