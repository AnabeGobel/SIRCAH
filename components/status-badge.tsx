import { cn } from "@/lib/utils"

type Status = "pendente" | "aprovado" | "rejeitada"

const statusConfig: Record<Status, { label: string; className: string }> = {
  pendente: {
    label: "Pendente",
    className: "bg-status-pending/20 text-status-pending border-status-pending/30",
  },
  aprovado: {
    label: "Aprovado",
    className: "bg-status-approved/20 text-status-approved border-status-approved/30",
  },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-status-rejected/20 text-status-rejected border-status-rejected/30",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
