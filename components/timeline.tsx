"use client"

import { Check, Clock, AlertCircle, QrCode, FileText } from "lucide-react"

export interface TimelineEvent {
  data: string
  hora: string
  evento: string
  tipo: "registo" | "validacao" | "qrcode" | "pendente" | "rejeitado"
  agente?: string
  sortDate?: string // Adicionamos suporte ao campo de ordenação opcionalmente
}

interface TimelineProps {
  events: TimelineEvent[]
}

const iconMap = {
  registo: FileText,
  validacao: Check,
  qrcode: QrCode,
  pendente: Clock,
  rejeitado: AlertCircle,
}

const colorMap = {
  registo: "bg-blue-500",
  validacao: "bg-status-approved",
  qrcode: "bg-primary",
  pendente: "bg-status-pending",
  rejeitado: "bg-status-rejected",
}

export function Timeline({ events }: TimelineProps) {
  // Proteção: Se não houver eventos, não renderiza nada para não quebrar
  if (!events || events.length === 0) return null;

  return (
    <div className="relative">
      {events.map((event, index) => {
        // Garantimos que o tipo existe no mapa, senão usamos um padrão (registo)
        const Icon = iconMap[event.tipo] || iconMap.registo
        const isLast = index === events.length - 1

        return (
          <div key={index} className="flex gap-4 pb-6 relative">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 w-[1px] h-[calc(100%-12px)] bg-border" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-6 h-6 rounded-full ${colorMap[event.tipo] || "bg-gray-400"} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-foreground">
                {event.evento || "Evento sem descrição"}
              </p>
              {event.agente && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  por {event.agente}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {/* Fallback para data e hora */}
                {event.data || "--/--/----"} {event.hora || "--:--"}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}