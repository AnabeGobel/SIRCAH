"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  UserRound,
} from "lucide-react"

const contactDetails = [
  {
    title: "E-mail",
    value: "anabegobel@gmail.com",
    description: "Para dúvidas, suporte técnico e comunicação de problemas.",
    icon: Mail,
    color: "bg-[#FFF0F1] text-[#FF5F6D]",
  },
  {
    title: "Telefone",
    value: "945 397 959",
    description: "Para assuntos que necessitem de contacto directo.",
    icon: Phone,
    color: "bg-[#EAF8EF] text-[#27AE60]",
  },
  {
    title: "Localização",
    value: "Huambo, Angola",
    description: "Área de referência do projecto SIRCAH.",
    icon: MapPin,
    color: "bg-[#FFF8DF] text-[#B88900]",
  },
  {
    title: "Horário de atendimento",
    value: "Segunda a sexta-feira, 08:00 - 15:00",
    description: "Período preferencial para atendimento.",
    icon: Clock3,
    color: "bg-[#EEF4FF] text-[#3B82F6]",
  },
]

const quickHelp = [
  { title: "Suporte técnico", description: "Problemas relacionados com o funcionamento do painel.", icon: LifeBuoy },
  { title: "Problemas de acesso", description: "Dificuldades com autenticação ou acesso à conta.", icon: UserRound },
  { title: "Comunicar um problema", description: "Informar erros ou informações incorrectas encontradas no sistema.", icon: MessageSquare },
]

export default function ContactoPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
    event.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1B]">
      <header className="border-b border-[#E5E4E0]/80 bg-[#F7F6F2]/90 px-6 py-5 backdrop-blur-md lg:px-12">
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
            <Link href="/sobre" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#FF5F6D]">Sobre</Link>
            <span className="text-sm font-semibold text-[#FF5F6D]">Contacto</span>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1B] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:px-5">
              Entrar <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <section className="mx-auto max-w-3xl py-16 text-center md:py-20">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F1] text-[#FF5F6D]"><MessageSquare className="h-7 w-7" /></div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Estamos disponíveis para ajudar</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">Entre em contacto</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6B7280]">Tem alguma dúvida, encontrou um problema ou precisa de apoio relacionado com o Painel Administrativo? Entre em contacto com a equipa responsável pelo SIRCAH.</p>
        </section>

        <section className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-5"><p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Informações</p><h2 className="text-3xl font-bold tracking-tight">Fale connosco</h2></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contactDetails.map((detail) => { const Icon = detail.icon; return <article key={detail.title} className="rounded-2xl border border-[#E5E4E0] bg-white p-5"><div className="flex items-start gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${detail.color}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><h3 className="font-bold">{detail.title}</h3><p className="mt-1 break-words text-sm font-semibold text-[#1A1A1B]">{detail.value}</p><p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{detail.description}</p></div></div></article> })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E4E0] bg-white p-6 md:p-8">
            <div className="mb-7"><p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Mensagem</p><h2 className="text-3xl font-bold tracking-tight">Envie uma mensagem</h2><p className="mt-2 text-sm text-[#6B7280]">Preencha os campos abaixo e descreva como podemos ajudar.</p></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold">Nome<input required name="nome" type="text" placeholder="Digite o seu nome" className="mt-1 h-11 w-full rounded-xl border border-[#E5E4E0] bg-[#F7F6F2] px-4 font-normal outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#FF5F6D] focus:ring-2 focus:ring-[#FF5F6D]/15" /></label>
                <label className="space-y-2 text-sm font-semibold">E-mail<input required name="email" type="email" placeholder="Digite o seu e-mail" className="mt-1 h-11 w-full rounded-xl border border-[#E5E4E0] bg-[#F7F6F2] px-4 font-normal outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#FF5F6D] focus:ring-2 focus:ring-[#FF5F6D]/15" /></label>
              </div>
              <label className="block space-y-2 text-sm font-semibold">Assunto<select required name="assunto" defaultValue="" className="mt-1 h-11 w-full rounded-xl border border-[#E5E4E0] bg-[#F7F6F2] px-4 font-normal outline-none transition-colors focus:border-[#FF5F6D] focus:ring-2 focus:ring-[#FF5F6D]/15"><option value="" disabled>Seleccione o assunto</option><option>Dúvida</option><option>Suporte técnico</option><option>Problema no sistema</option><option>Sugestão</option><option>Segurança</option><option>Outro</option></select></label>
              <label className="block space-y-2 text-sm font-semibold">Mensagem<textarea required name="mensagem" placeholder="Descreva a sua mensagem..." rows={5} className="mt-1 w-full resize-y rounded-xl border border-[#E5E4E0] bg-[#F7F6F2] px-4 py-3 font-normal outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#FF5F6D] focus:ring-2 focus:ring-[#FF5F6D]/15" /></label>
              <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5F6D] px-5 font-semibold text-white shadow-md shadow-[#FF5F6D]/15 transition-all hover:-translate-y-0.5 hover:bg-[#e5545f] sm:w-auto"><Send className="h-4 w-4" /> Enviar mensagem</button>
              {sent && <p role="status" className="flex items-center gap-2 rounded-xl bg-[#EAF8EF] px-4 py-3 text-sm font-medium text-[#21864B]"><CheckCircle2 className="h-4 w-4 shrink-0" /> Mensagem enviada com sucesso. A equipa responsável analisará a sua solicitação.</p>}
            </form>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#E5E4E0] bg-white p-6 md:p-8"><p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Contactos rápidos</p><h2 className="text-2xl font-bold tracking-tight">Precisa de ajuda?</h2><div className="mt-6 space-y-4">{quickHelp.map((item) => { const Icon = item.icon; return <div key={item.title} className="flex gap-3"><div className="rounded-xl bg-[#FFF0F1] p-2.5 text-[#FF5F6D]"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{item.description}</p></div></div> })}</div></div>
          <div className="rounded-2xl border border-[#E5E4E0] bg-white p-6 md:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#FFF8DF] p-3 text-[#B88900]"><MapPin className="h-5 w-5" /></div><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FF5F6D]">Onde estamos</p><h2 className="text-2xl font-bold tracking-tight">Huambo, Angola</h2></div></div><div className="mt-6 flex min-h-44 items-center justify-center rounded-xl border border-[#E5E4E0] bg-[#F7F6F2]"><div className="text-center"><MapPin className="mx-auto h-8 w-8 text-[#FF5F6D]" /><p className="mt-2 text-sm font-semibold">Área de referência do projecto</p><p className="mt-1 text-xs text-[#6B7280]">Município do Huambo, Angola</p></div></div></div>
        </section>

        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-[#F2C94C]/40 bg-[#FFF8DF] p-4 text-sm text-[#806600]"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><p><span className="font-bold">Nota de segurança:</span> não partilhe palavras-passe, códigos de acesso ou outras informações confidenciais através do formulário de contacto.</p></div>
      </main>

      <footer className="border-t border-[#E5E4E0] px-6 py-7 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[#6B7280] sm:flex-row"><span>© {new Date().getFullYear()} SIRCAH</span><span>Painel Web Administrativo</span></div></footer>
    </div>
  )
}
