"use client"

import { use } from "react"
import { GlobalAdminUsersTable } from "@/components/global-admin-users-table"
import {
  Activity,
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  FileBarChart,
  FileClock,
  Gauge,
  Globe2,
  Home,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react"

const pages: Record<string, { title: string; eyebrow: string; description: string; icon: typeof Home; metrics: [string, string, string][] }> = {
  dashboard: { title: "Visão geral da plataforma", eyebrow: "Dashboard", description: "Acompanhe a operação global do SIRCAH num único espaço de controlo.", icon: Gauge, metrics: [["Residências na rede", "1.248", "+8,4% este mês"], ["Utilizadores activos", "3.862", "+12,1% este mês"], ["Receita mensal", "Kz 2,84M", "+6,8% este mês"], ["Disponibilidade", "99,94%", "Dentro do objectivo"]] },
  residencias: { title: "Residências", eyebrow: "Rede residencial", description: "Supervisione residências, estados de validação e cobertura geográfica da plataforma.", icon: Home, metrics: [["Total registado", "1.248", "Em toda a rede"], ["A aguardar validação", "86", "Requer atenção"], ["Aprovadas", "1.104", "88,5% do total"], ["Com localização", "1.219", "97,7% do total"]] },
  "utilizadores/moradores": { title: "Moradores", eyebrow: "Utilizadores", description: "Consulte o universo de moradores registados e a sua actividade na plataforma.", icon: Users, metrics: [["Total de moradores", "3.214", "+9,2% este mês"], ["Activos", "2.987", "92,9% do total"], ["Novos este mês", "184", "Registos confirmados"], ["Pendentes", "43", "A validar"]] },
  "utilizadores/agentes": { title: "Agentes", eyebrow: "Utilizadores", description: "Gira agentes de campo, equipas e o desempenho das operações atribuídas.", icon: ShieldCheck, metrics: [["Agentes registados", "126", "Em 18 equipas"], ["Activos agora", "98", "Disponíveis"], ["Tarefas concluídas", "1.842", "Este mês"], ["Taxa de conclusão", "94,6%", "Acima do objectivo"]] },
  "utilizadores/administradores": { title: "Administradores", eyebrow: "Utilizadores", description: "Controle perfis administrativos e os níveis de acesso à plataforma.", icon: ShieldCheck, metrics: [["Administradores", "18", "Contas activas"], ["Administradores globais", "2", "Acesso total"], ["Acessos hoje", "47", "Sessões registadas"], ["Alertas de segurança", "0", "Sem ocorrências"]] },
  empresas: { title: "Empresas", eyebrow: "Ecossistema", description: "Acompanhe organizações parceiras, contratos e o estado de cada relação.", icon: Building2, metrics: [["Empresas activas", "34", "+3 este trimestre"], ["Em onboarding", "6", "Em implementação"], ["Contratos activos", "29", "85,3% da carteira"], ["Pendências", "4", "A acompanhar"]] },
  planos: { title: "Planos", eyebrow: "Modelo de negócio", description: "Defina e acompanhe os planos disponibilizados às organizações.", icon: FileBarChart, metrics: [["Planos publicados", "4", "2 recomendados"], ["Subscritores", "34", "Empresas activas"], ["Conversão média", "68,2%", "Últimos 90 dias"], ["Plano principal", "Profissional", "61% da base"]] },
  subscricoes: { title: "Subscrições", eyebrow: "Modelo de negócio", description: "Supervisione ciclos de subscrição, renovações e estados de pagamento.", icon: WalletCards, metrics: [["Subscrições activas", "31", "91,2% da carteira"], ["A renovar", "5", "Próximos 30 dias"], ["Em atraso", "2", "Requer contacto"], ["Retenção", "94,1%", "Trimestre actual"]] },
  "financas/receitas": { title: "Receitas", eyebrow: "Finanças", description: "Visão consolidada das receitas geradas pela plataforma.", icon: CircleDollarSign, metrics: [["Receita este mês", "Kz 2,84M", "+6,8%"], ["Receita anual", "Kz 28,6M", "Acumulado"], ["Ticket médio", "Kz 91,6K", "Por subscrição"], ["Previsão", "Kz 3,1M", "Próximo mês"]] },
  "financas/pagamentos": { title: "Pagamentos", eyebrow: "Finanças", description: "Acompanhe pagamentos recebidos, pendentes e reconciliados.", icon: WalletCards, metrics: [["Recebidos", "Kz 2,54M", "89,4% do total"], ["Pendentes", "Kz 188K", "12 transacções"], ["Reconciliados", "98,7%", "Este mês"], ["Falhados", "3", "A investigar"]] },
  "financas/despesas": { title: "Despesas", eyebrow: "Finanças", description: "Controle despesas operacionais e os compromissos financeiros do sistema.", icon: FileClock, metrics: [["Despesas do mês", "Kz 842K", "Dentro do orçamento"], ["Orçamento", "Kz 1,1M", "76,5% utilizado"], ["Pendentes", "Kz 96K", "A aprovar"], ["Variação", "-4,2%", "Face ao mês anterior"]] },
  relatorios: { title: "Relatórios", eyebrow: "Inteligência", description: "Consulte indicadores consolidados para apoiar decisões de gestão.", icon: FileBarChart, metrics: [["Relatórios disponíveis", "18", "5 actualizados hoje"], ["Exportações este mês", "74", "PDF e XLSX"], ["Utilizadores activos", "12", "Com acesso"], ["Última actualização", "09:42", "Hoje"]] },
  "monitorizacao/aplicacao-movel": { title: "Aplicação móvel", eyebrow: "Monitorização", description: "Observe disponibilidade, utilização e eventos da aplicação móvel.", icon: Gauge, metrics: [["Disponibilidade", "99,82%", "Últimas 24 horas"], ["Sessões activas", "642", "Neste momento"], ["Versão actual", "2.4.1", "86% actualizados"], ["Incidentes", "0", "Sem incidentes"]] },
  "monitorizacao/plataforma-web": { title: "Plataforma Web", eyebrow: "Monitorização", description: "Acompanhe saúde, desempenho e disponibilidade dos serviços web.", icon: Globe2, metrics: [["Disponibilidade", "99,94%", "Últimas 24 horas"], ["Tempo de resposta", "184 ms", "Média actual"], ["Pedidos hoje", "48,2K", "+14,6%"], ["Incidentes", "0", "Sem incidentes"]] },
  auditoria: { title: "Auditoria", eyebrow: "Governança", description: "Rastreie alterações, acessos e eventos relevantes da plataforma.", icon: FileClock, metrics: [["Eventos registados", "2.841", "Últimos 30 dias"], ["Acessos administrativos", "384", "No período"], ["Acções críticas", "27", "Revisadas"], ["Alertas", "0", "Sem pendências"]] },
  notificacoes: { title: "Notificações", eyebrow: "Comunicação", description: "Centralize avisos operacionais e comunicações para os utilizadores.", icon: Activity, metrics: [["Enviadas este mês", "1.284", "Todos os canais"], ["Taxa de entrega", "98,6%", "Dentro do objectivo"], ["Não lidas", "46", "A acompanhar"], ["Campanhas activas", "3", "Em execução"]] },
  configuracoes: { title: "Configurações", eyebrow: "Governança", description: "Defina parâmetros globais, integrações e políticas da plataforma.", icon: ShieldCheck, metrics: [["Parâmetros globais", "24", "Configurados"], ["Integrações", "6", "Todas operacionais"], ["Políticas activas", "8", "Em vigor"], ["Última alteração", "Hoje", "Por admin global"]] },
  "sobre-contacto": { title: "Sobre / Contacto", eyebrow: "SIRCAH", description: "Informação institucional, suporte e canais de contacto da plataforma.", icon: Globe2, metrics: [["Versão da plataforma", "1.0.0", "Produção"], ["Estado do suporte", "Operacional", "Resposta média 2h"], ["Contactos abertos", "7", "A responder"], ["Documentação", "Actualizada", "17 Set 2026"]] },
}

export default function GlobalAdminSectionPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)
  const key = slug.join("/")
  const page = pages[key] || pages.dashboard
  const Icon = page.icon

  if (key === "utilizadores/moradores" || key === "utilizadores/agentes" || key === "utilizadores/administradores") {
    const tipoInicial: "morador" | "agente" | "administrador" = key.endsWith("moradores") ? "morador" : key.endsWith("agentes") ? "agente" : "administrador"
    return <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Utilizadores</p><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Dados reais de {tipoInicial === "morador" ? "moradores" : "agentes"} registados no ecossistema global.</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div></div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"><GlobalAdminUsersTable tipoInicial={tipoInicial} /></div>
    </div>
  }

  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{page.eyebrow}</p><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{page.description}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{page.metrics.map(([label, value, detail]) => <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p><p className="mt-2 text-xs font-medium text-status-approved">{detail}</p></div>)}</div>
    <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"><div className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex items-center justify-between border-b border-border pb-4"><div><h2 className="font-semibold text-card-foreground">Actividade recente</h2><p className="mt-1 text-xs text-muted-foreground">Últimos eventos desta área</p></div><ArrowUpRight className="h-5 w-5 text-muted-foreground" /></div><div className="divide-y divide-border">{["Dados sincronizados com sucesso", "Novo evento de operação registado", "Indicadores actualizados", "Verificação de permissões concluída"].map((event, index) => <div key={event} className="flex items-center gap-3 py-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Activity className="h-4 w-4" /></div><div className="flex-1"><p className="text-sm font-medium text-card-foreground">{event}</p><p className="mt-1 text-xs text-muted-foreground">{index + 1}h atrás · Sistema SIRCAH</p></div><span className="text-xs font-medium text-status-approved">Concluído</span></div>)}</div></div><div className="rounded-2xl bg-sidebar p-6 text-sidebar-foreground"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Estado global</p><h2 className="mt-3 text-xl font-semibold">Operação estável</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Todos os serviços essenciais estão disponíveis e sem incidentes críticos.</p><div className="mt-8 space-y-4">{[["Serviços", "100%"], ["Segurança", "Protegida"], ["Sincronização", "Em dia"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-sidebar-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-status-approved">{value}</span></div>)}</div></div></section>
    <div className="rounded-2xl border border-dashed border-border bg-muted p-5 text-sm text-muted-foreground">Esta área já está disponível para o perfil Administrador Global. As operações e ligações aos dados específicos podem ser activadas gradualmente sem alterar o painel operacional existente.</div>
  </div>
}
