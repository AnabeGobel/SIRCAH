import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileKey2,
  Home,
  KeyRound,
  LockKeyhole,
  MapPinned,
  QrCode,
  ScanLine,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react"

const capabilities = [
  {
    title: "Gestão de Residências",
    description: "Consultar, analisar, validar, actualizar e gerir os registos das residências.",
    icon: Home,
    color: "bg-[#FFF0F1] text-[#FF5F6D]",
  },
  {
    title: "Gestão de Utilizadores",
    description: "Consultar e gerir os utilizadores registados de acordo com as permissões administrativas.",
    icon: Users,
    color: "bg-[#FFF8DF] text-[#B88900]",
  },
  {
    title: "Localização Residencial",
    description: "Visualizar no mapa as residências registadas e as respectivas informações de localização.",
    icon: MapPinned,
    color: "bg-[#EAF8EF] text-[#27AE60]",
  },
  {
    title: "Códigos e QR Codes",
    description: "Consultar os códigos únicos associados às residências e acompanhar os respectivos registos.",
    icon: QrCode,
    color: "bg-[#EEF4FF] text-[#3B82F6]",
  },
  {
    title: "Validação de Registos",
    description: "Analisar pedidos e definir o estado das residências: aprovado, rejeitado ou em análise.",
    icon: ClipboardCheck,
    color: "bg-[#F4EEFF] text-[#805AD5]",
  },
  {
    title: "Monitorização",
    description: "Acompanhar informações gerais sobre residências e utilizadores através dos indicadores do painel.",
    icon: BarChart3,
    color: "bg-[#FFF1E8] text-[#E97832]",
  },
]

const panelAreas = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Residências", icon: Home },
  { label: "QR Codes", icon: QrCode },
  { label: "Mapa", icon: MapPinned },
  { label: "Histórico", icon: ScanLine },
  { label: "Utilizadores", icon: Users },
  { label: "Moradores", icon: Users },
  { label: "Configurações", icon: Settings2 },
]

const securityItems = [
  { title: "Autenticação", description: "Acesso mediante credenciais.", icon: KeyRound },
  { title: "Controlo de acesso", description: "Permissões para operações administrativas.", icon: ShieldCheck },
  { title: "Protecção dos dados", description: "Acesso restrito às informações armazenadas.", icon: LockKeyhole },
  { title: "Integridade", description: "Controlo das operações sobre os registos.", icon: CheckCircle2 },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F6F2] text-[#1A1A1B]">
      <header className="relative z-10 border-b border-[#E5E4E0]/80 bg-[#F7F6F2]/85 px-6 py-5 backdrop-blur-md lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5F6D] shadow-lg shadow-[#FF5F6D]/20">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">SIRCAH</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B7280] sm:block">Painel administrativo</span>
            </div>
          </Link>
          <nav className="flex items-center gap-5 sm:gap-8">
            <Link href="/" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#FF5F6D]">Início</Link>
            <span className="text-sm font-semibold text-[#FF5F6D]">Sobre</span>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1B] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:px-5">
              Entrar <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <section className="mx-auto max-w-4xl py-16 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF5F6D]/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF5F6D]">
              <span className="h-2 w-2 rounded-full bg-[#27AE60]" /> O ambiente de gestão do SIRCAH
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Sobre o Painel <span className="text-[#FF5F6D]">Administrativo</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
              Plataforma Web destinada à gestão, supervisão e controlo das informações residenciais e dos utilizadores do SIRCAH.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-medium text-[#1A1A1B]">
              <div className="flex items-center gap-2 rounded-xl border border-[#E5E4E0] bg-white/75 px-4 py-3"><ScanLine className="h-4 w-4 text-[#FF5F6D]" /> Dados centralizados</div>
              <div className="flex items-center gap-2 rounded-xl border border-[#E5E4E0] bg-white/75 px-4 py-3"><ShieldCheck className="h-4 w-4 text-[#27AE60]" /> Gestão autorizada</div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E5E4E0] py-16 md:py-20">
          <div className="mb-10 max-w-2xl"><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">O que é?</p><h2 className="text-3xl font-bold tracking-tight md:text-4xl">Um centro de comando para a gestão residencial</h2><p className="mt-4 leading-relaxed text-[#6B7280]">O Painel Web Administrativo é o ambiente de gestão do SIRCAH. Aqui, o administrador acompanha e gere os dados registados, valida residências, gere utilizadores e supervisiona as informações usadas pelos serviços associados ao sistema.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => { const Icon = item.icon; return <article key={item.title} className="group rounded-2xl border border-[#E5E4E0] bg-white/80 p-6 transition-all hover:-translate-y-1 hover:border-[#FF5F6D]/35 hover:shadow-xl hover:shadow-[#1A1A1B]/5"><div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}><Icon className="h-6 w-6" /></div><h3 className="text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{item.description}</p></article> })}
          </div>
          <div className="mt-8 grid gap-4 rounded-2xl border border-[#E5E4E0] bg-white p-5 md:grid-cols-2 md:p-7"><div className="flex items-start gap-4"><div className="rounded-xl bg-[#FFF0F1] p-3 text-[#FF5F6D]"><ScanLine className="h-5 w-5" /></div><div><h3 className="font-bold">Aplicação móvel</h3><p className="mt-1 text-sm text-[#6B7280]">Utilizada pelos utilizadores em campo para registar informações.</p></div></div><div className="flex items-start gap-4"><div className="rounded-xl bg-[#F7F6F2] p-3 text-[#6B7280]"><Settings2 className="h-5 w-5" /></div><div><h3 className="font-bold">Painel Web</h3><p className="mt-1 text-sm text-[#6B7280]">Utilizado pelo administrador para gerir e supervisionar os dados.</p></div></div></div>
        </section>

        <section className="rounded-[2rem] bg-white/75 px-6 py-14 md:px-12 md:py-16">
          <div className="text-center"><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Como funciona?</p><h2 className="text-3xl font-bold tracking-tight md:text-4xl">Do registo à decisão</h2></div>
          <div className="mx-auto mt-12 grid max-w-5xl items-center gap-3 md:grid-cols-5"><div className="rounded-2xl border border-[#E5E4E0] bg-[#F7F6F2] p-5 text-center"><ScanLine className="mx-auto mb-3 h-6 w-6 text-[#FF5F6D]" /><p className="font-bold">Registo</p><p className="mt-1 text-xs text-[#6B7280]">Dados recolhidos</p></div><ChevronRight className="mx-auto hidden h-5 w-5 text-[#FF5F6D] md:block" /><div className="rounded-2xl border border-[#E5E4E0] bg-[#F7F6F2] p-5 text-center"><Database className="mx-auto mb-3 h-6 w-6 text-[#3B82F6]" /><p className="font-bold">Base de dados</p><p className="mt-1 text-xs text-[#6B7280]">Informação sincronizada</p></div><ChevronRight className="mx-auto hidden h-5 w-5 text-[#FF5F6D] md:block" /><div className="rounded-2xl border border-[#FF5F6D]/30 bg-[#FFF0F1] p-5 text-center"><Home className="mx-auto mb-3 h-6 w-6 text-[#FF5F6D]" /><p className="font-bold">Painel</p><p className="mt-1 text-xs text-[#6B7280]">Consulta e análise</p></div></div>
          <div className="mx-auto mt-3 hidden h-8 w-px bg-[#FF5F6D]/40 md:block" /><p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-[#6B7280]">Os dados registados através da plataforma são disponibilizados ao administrador no Painel Web, onde podem ser consultados, analisados e geridos conforme as permissões definidas.</p>
        </section>

        <section className="py-16 md:py-20"><div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Navegação</p><h2 className="text-3xl font-bold tracking-tight md:text-4xl">As principais áreas do painel</h2><p className="mt-4 leading-relaxed text-[#6B7280]">Cada área foi pensada para tornar a operação diária mais clara, rápida e controlada.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{panelAreas.map((area) => { const Icon = area.icon; return <div key={area.label} className="flex min-h-24 flex-col justify-between rounded-2xl border border-[#E5E4E0] bg-white/80 p-4"><Icon className="h-5 w-5 text-[#FF5F6D]" /><span className="text-sm font-semibold">{area.label}</span></div> })}</div></div></section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-[#E5E4E0] bg-white p-7 md:p-10"><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Segurança e controlo de acesso</p><h2 className="text-3xl font-bold tracking-tight">Gestão com responsabilidade</h2><p className="mt-4 max-w-xl leading-relaxed text-[#6B7280]">O acesso é protegido por autenticação e mecanismos de controlo de permissões. As operações são destinadas a utilizadores autorizados, reduzindo o risco de alterações indevidas.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{securityItems.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-xl border border-[#E5E4E0] bg-[#F7F6F2] p-4"><Icon className="mb-4 h-5 w-5 text-[#FF5F6D]" /><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{item.description}</p></div> })}</div></div><div className="rounded-2xl border border-[#E5E4E0] bg-white p-7 md:p-10"><p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Tecnologias utilizadas</p><h2 className="text-2xl font-bold tracking-tight">Uma base preparada para crescer</h2><div className="mt-7 space-y-4">{[{ name: "Next.js", detail: "Interface e estrutura da aplicação Web.", icon: FileKey2 }, { name: "Firebase Authentication", detail: "Autenticação dos utilizadores.", icon: KeyRound }, { name: "Cloud Firestore", detail: "Armazenamento e sincronização dos dados.", icon: Database }, { name: "Mapas e geolocalização", detail: "Visualização da localização residencial.", icon: MapPinned }].map((tech) => { const Icon = tech.icon; return <div key={tech.name} className="flex items-center gap-4"><div className="rounded-xl bg-[#FFF0F1] p-3 text-[#FF5F6D]"><Icon className="h-5 w-5" /></div><div><p className="font-semibold">{tech.name}</p><p className="text-sm text-[#6B7280]">{tech.detail}</p></div></div> })}</div></div></section>

        <section className="py-16 text-center md:py-20"><div className="mx-auto max-w-3xl rounded-[2rem] border border-[#FF5F6D]/20 bg-[#FFF0F1]/60 px-6 py-12 md:px-12"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5F6D] text-white shadow-lg shadow-[#FF5F6D]/20"><Home className="h-7 w-7" /></div><h2 className="mt-6 text-3xl font-bold tracking-tight">Objectivo do painel</h2><p className="mt-4 leading-relaxed text-[#6B7280]">Centralizar a gestão das informações do SIRCAH, proporcionando ao administrador ferramentas para acompanhar registos residenciais, validar informações, gerir utilizadores e supervisionar os dados utilizados pela plataforma.</p><Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF5F6D] px-6 py-3 font-semibold text-white shadow-lg shadow-[#FF5F6D]/20 transition-all hover:-translate-y-0.5 hover:bg-[#e5545f]">Aceder ao painel <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>

      <footer className="relative z-10 border-t border-[#E5E4E0] px-6 py-7 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[#6B7280] sm:flex-row"><span>© {new Date().getFullYear()} SIRCAH</span><span>Painel Web Administrativo</span></div></footer>
    </div>
  )
}
