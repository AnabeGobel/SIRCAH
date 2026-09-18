import { Home, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  className?: string
}

function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl bg-card border border-border p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                trendUp ? "text-status-approved" : "text-status-rejected"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-muted">{icon}</div>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  total: number
  pendentes: number
  aprovadas: number
  rejeitadas: number
}

export function StatsCards({ total, pendentes, aprovadas, rejeitadas }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total de Residências"
        value={total}
        icon={<Home className="h-5 w-5 text-foreground" />}
        trend="+12% este mês"
        trendUp
      />
      <StatCard
        title="Pendentes"
        value={pendentes}
        icon={<Clock className="h-5 w-5 text-status-pending" />}
      />
      <StatCard
        title="Aprovadas"
        value={aprovadas}
        icon={<CheckCircle className="h-5 w-5 text-status-approved" />}
        trend="+8% esta semana"
        trendUp
      />
      <StatCard
        title="Rejeitadas"
        value={rejeitadas}
        icon={<XCircle className="h-5 w-5 text-status-rejected" />}
      />
    </div>
  )
}
