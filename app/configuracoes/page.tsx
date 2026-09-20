"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Activity,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  LogOut,
  MoonStar,
  Palette,
  Shield,
  ShieldCheck,
  SunMedium,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { auth, db } from "@/lib/Services/firebaseConfig"
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import { NotificationBell } from "@/components/notification-bell"

const DEFAULT_ACTIVITY = [
  { id: 1, action: "Login realizado com sucesso", time: "Hoje, 09:42" },
  { id: 2, action: 'Residência "Bairro Nascente" foi atualizada', time: "Ontem, 18:10" },
  { id: 3, action: "Nova notificação enviada aos utilizadores", time: "Ontem, 12:05" },
  { id: 4, action: "Perfil de acesso foi alterado", time: "3 dias atrás, 08:35" },
]

const DEFAULT_SESSIONS = [
  { id: 1, device: "Chrome · Windows", location: "Lisboa, Portugal", active: "Ativa agora", current: true },
  { id: 2, device: "Safari · iPhone", location: "Porto, Portugal", active: "Há 12 minutos", current: false },
  { id: 3, device: "Firefox · Ubuntu", location: "Coimbra, Portugal", active: "Há 2 horas", current: false },
]

const formatarCsv = (rows: Record<string, string | number | boolean>[]) => {
  if (!rows.length) return "Campo,Valor\nNenhum dado selecionado,"

  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header]
      const text = value === null || value === undefined ? "" : String(value)
      return `"${text.replace(/"/g, '""')}"`
    })
    lines.push(values.join(","))
  })

  return lines.join("\n")
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [perfilTipo, setPerfilTipo] = useState("Administrador")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [darkMode, setDarkMode] = useState(false)
  const [novosRegistos, setNovosRegistos] = useState(true)
  const [emailDiario, setEmailDiario] = useState(false)
  const [alertasCriticos, setAlertasCriticos] = useState(true)

  // Estados do Modal de Senha
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [senhaActual, setSenhaActual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState("")
  const [mostrarSenhaActual, setMostrarSenhaActual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)

  // Estados de Exportação
  const [exportFormat, setExportFormat] = useState("json")
  const [exportRange, setExportRange] = useState("30")
  const [selectedExport, setSelectedExport] = useState({
    perfil: true,
    preferencias: true,
    seguranca: true,
    historico: true,
  })

  const [activityLog, setActivityLog] = useState(DEFAULT_ACTIVITY)
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS)
  const [privacidadeAceite, setPrivacidadeAceite] = useState(true)

  const solicitarPermissaoNotificacao = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission()
      }
    }
  }

  const handleToggleNovosRegistos = async (checked: boolean) => {
    setNovosRegistos(checked)
    if (!currentUser) return
    if (checked) await solicitarPermissaoNotificacao()

    try {
      const docRef = doc(db, "usuariosWeb", currentUser.uid)
      await updateDoc(docRef, { "configuracoes.novosRegistos": checked })
      toast.success(checked ? "Alertas de novos registos ativados." : "Alertas de novos registos desativados.")
    } catch (error) {
      console.error("Erro ao guardar configuração:", error)
      setNovosRegistos(!checked)
      toast.error("Erro ao guardar a preferência de notificação.")
    }
  }

  const handleToggleEmailDiario = async (checked: boolean) => {
    setEmailDiario(checked)
    if (!currentUser) return

    try {
      const docRef = doc(db, "usuariosWeb", currentUser.uid)
      await updateDoc(docRef, { "configuracoes.emailDiario": checked })
      toast.success(checked ? "Resumo diário por email ativado." : "Resumo diário por email desativado.")
    } catch (error) {
      console.error("Erro ao guardar configuração:", error)
      setEmailDiario(!checked)
      toast.error("Erro ao guardar a preferência de notificação.")
    }
  }

  const handleToggleAlertasCriticos = async (checked: boolean) => {
    setAlertasCriticos(checked)
    if (!currentUser) return
    if (checked) await solicitarPermissaoNotificacao()

    try {
      const docRef = doc(db, "usuariosWeb", currentUser.uid)
      await updateDoc(docRef, { "configuracoes.alertasCriticos": checked })
      toast.success(checked ? "Alertas críticos ativados." : "Alertas críticos desativados.")
    } catch (error) {
      console.error("Erro ao guardar configuração:", error)
      setAlertasCriticos(!checked)
      toast.error("Erro ao guardar a preferência de notificação.")
    }
  }

  const handleAlterarSenha = async () => {
    setErroSenha("")

    if (!senhaActual.trim()) {
      setErroSenha("Introduza a sua senha actual.")
      return
    }
    if (novaSenha.length < 6) {
      setErroSenha("A nova senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.")
      return
    }
    if (novaSenha === senhaActual) {
      setErroSenha("A nova senha não pode ser igual à senha actual.")
      return
    }

    setSalvandoSenha(true)

    try {
      const credencial = EmailAuthProvider.credential(currentUser.email, senhaActual)
      await reauthenticateWithCredential(currentUser, credencial)
      await updatePassword(currentUser, novaSenha)

      toast.success("Senha alterada com sucesso!")
      fecharModalSenha()
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setErroSenha("Senha actual incorrecta. Tente novamente.")
          break
        case "auth/weak-password":
          setErroSenha("A nova senha é fraca. Use pelo menos 6 caracteres.")
          break
        case "auth/requires-recent-login":
          setErroSenha("Sessão expirada. Faça logout e login novamente antes de alterar a senha.")
          break
        case "auth/too-many-requests":
          setErroSenha("Demasiadas tentativas. Aguarde alguns minutos e tente novamente.")
          break
        default:
          setErroSenha("Erro ao alterar senha: " + (error.message || "Erro inesperado."))
      }
    } finally {
      setSalvandoSenha(false)
    }
  }

  const fecharModalSenha = () => {
    setModalSenhaAberto(false)
    setSenhaActual("")
    setNovaSenha("")
    setConfirmarSenha("")
    setErroSenha("")
    setMostrarSenhaActual(false)
    setMostrarNovaSenha(false)
  }

  const handleThemeChange = async (checked: boolean) => {
    setDarkMode(checked)

    if (checked) {
      document.documentElement.classList.add("dark")
      toast.success("Modo escuro ativado!")
    } else {
      document.documentElement.classList.remove("dark")
      toast.success("Modo claro ativado!")
    }

    if (currentUser) {
      try {
        localStorage.setItem(`theme_${currentUser.uid}`, checked ? "dark" : "light")
        const docRef = doc(db, "usuariosWeb", currentUser.uid)
        await updateDoc(docRef, { "configuracoes.darkMode": checked })
      } catch (err) {
        console.error("Erro ao guardar preferência de tema:", err)
      }
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    setSalvandoPerfil(true)

    try {
      const emailLimpo = email.trim()
      const nomeLimpo = nome.trim()

      if (emailLimpo !== currentUser.email) {
        await updateEmail(currentUser, emailLimpo)
      }

      const docRef = doc(db, "usuariosWeb", currentUser.uid)
      await updateDoc(docRef, {
        nome: nomeLimpo,
        email: emailLimpo,
        telefone: telefone.trim(),
        perfilTipo,
        avatarUrl,
      })

      toast.success("Perfil atualizado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      if (error.code === "auth/requires-recent-login") {
        toast.error("Para mudar o e-mail, precisa de fazer login novamente por segurança.")
      } else {
        toast.error("Erro ao atualizar dados: " + (error.message || "Erro inesperado"))
      }
    } finally {
      setSalvandoPerfil(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const handleExport = () => {
    const selectedKeys = Object.entries(selectedExport)
      .filter(([, value]) => value)
      .map(([key]) => key)

    if (!selectedKeys.length) {
      toast.error("Selecione pelo menos um tipo de dados para exportar.")
      return
    }

    const payload: Record<string, unknown> = {
      exportadoEm: new Date().toISOString(),
      utilizador: nome || email || "Utilizador",
      intervalo: exportRange,
      formato: exportFormat,
    }

    if (selectedKeys.includes("perfil")) {
      payload.perfil = { nome, email, telefone, perfilTipo }
    }
    if (selectedKeys.includes("preferencias")) {
      payload.preferencias = { tema: darkMode ? "escuro" : "claro", novosRegistos, emailDiario, alertasCriticos }
    }
    if (selectedKeys.includes("seguranca")) {
      payload.seguranca = { autenticacao: "Senha protegida", politicas: privacidadeAceite ? "aceite" : "pendente" }
    }
    if (selectedKeys.includes("historico")) {
      payload.historico = activityLog
    }

    const content =
      exportFormat === "json"
        ? JSON.stringify(payload, null, 2)
        : formatarCsv([
            { nome, email, telefone, perfilTipo },
            {
              tema: darkMode ? "escuro" : "claro",
              novosRegistos: String(novosRegistos),
              emailDiario: String(emailDiario),
              alertasCriticos: String(alertasCriticos),
            },
          ])

    const blob = new Blob([content], {
      type: exportFormat === "json" ? "application/json" : "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `sircah-configuracoes-${Date.now()}.${exportFormat}`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("Exportação realizada com sucesso.")
  }

  const handleRemoveSession = (sessionId: number) => {
    setSessions((current) => current.filter((session) => session.id !== sessionId))
    toast.success("Sessão removida com sucesso.")
  }

  useEffect(() => {
    let unsubscribeSnap: (() => void) | undefined
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnap?.()
      unsubscribeSnap = undefined

      if (!user) {
        setCurrentUser(null)
        setLoading(false)
        document.documentElement.classList.remove("dark")
        return
      }

      setCurrentUser(user)
      setEmail(user.email || "")
      setNome(user.displayName || "Utilizador Web")

      const temaLocalExclusivo = localStorage.getItem(`theme_${user.uid}`)
      if (temaLocalExclusivo === "dark") {
        setDarkMode(true)
        document.documentElement.classList.add("dark")
      } else if (temaLocalExclusivo === "light") {
        setDarkMode(false)
        document.documentElement.classList.remove("dark")
      }

      const docRef = doc(db, "usuariosWeb", user.uid)
      unsubscribeSnap = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.nome) setNome(data.nome)
            if (data.email) setEmail(data.email)
            if (data.telefone) setTelefone(data.telefone)
            if (data.perfilTipo) setPerfilTipo(data.perfilTipo)
            if (data.avatarUrl) setAvatarUrl(data.avatarUrl)

            if (data.configuracoes) {
              setNovosRegistos(data.configuracoes.novosRegistos ?? true)
              setEmailDiario(data.configuracoes.emailDiario ?? false)
              setAlertasCriticos(data.configuracoes.alertasCriticos ?? true)

              const isDark = data.configuracoes.darkMode ?? false
              setDarkMode(isDark)
              document.documentElement.classList.toggle("dark", isDark)
              localStorage.setItem(`theme_${user.uid}`, isDark ? "dark" : "light")
            }
          }
          setLoading(false)
        },
        (error) => {
          if (auth.currentUser) console.error("Erro ao carregar Firestore:", error)
          setLoading(false)
        },
      )
    })

    return () => {
      unsubscribeAuth()
      unsubscribeSnap?.()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">A carregar configurações...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="page-shell-header h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* 1. PERFIL DO UTILIZADOR */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">1. Minha Conta</h2>
                  <p className="text-sm text-muted-foreground">Informações pessoais e dados do perfil</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 p-5 text-center">
                  <div className="relative mb-3">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-background text-2xl font-semibold text-foreground shadow-sm">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span>{(nome || "U").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{nome || "Utilizador"}</p>
                  <span className="mt-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    {perfilTipo}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full rounded-xl border-border hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Alterar foto
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Nome completo</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Tipo de perfil</label>
                      <select
                        value={perfilTipo}
                        onChange={(e) => setPerfilTipo(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option>Administrador</option>
                        <option>Gestor</option>
                        <option>Morador</option>
                        <option>Operador</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email de contacto</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Telefone</label>
                      <input
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={salvandoPerfil}
                      className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                    >
                      {salvandoPerfil ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...
                        </>
                      ) : (
                        "Guardar perfil"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PREFERÊNCIAS E APARÊNCIA */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">2. Preferências & Aparência</h2>
                  <p className="text-sm text-muted-foreground">Personalize a sua interface e alertas</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Tema de fundo</p>
                    <p className="text-xs text-muted-foreground">Alternar entre modo claro e escuro</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {darkMode ? <MoonStar className="h-4 w-4 text-primary" /> : <SunMedium className="h-4 w-4 text-amber-500" />}
                    <Switch checked={darkMode} onCheckedChange={handleThemeChange} />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Novos registos</p>
                    <p className="text-xs text-muted-foreground">Alertas ao registar residências</p>
                  </div>
                  <Switch checked={novosRegistos} onCheckedChange={handleToggleNovosRegistos} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Resumo diário</p>
                    <p className="text-xs text-muted-foreground">Receber relatório por email</p>
                  </div>
                  <Switch checked={emailDiario} onCheckedChange={handleToggleEmailDiario} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alertas críticos</p>
                    <p className="text-xs text-muted-foreground">Notificações urgentes do sistema</p>
                  </div>
                  <Switch checked={alertasCriticos} onCheckedChange={handleToggleAlertasCriticos} />
                </div>
              </div>
            </section>

            {/* 3. EXPORTAR DADOS */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">3. Exportar Dados</h2>
                  <p className="text-sm text-muted-foreground">Baixar cópia das suas definições e histórico</p>
                </div>
              </div>

              <Link href="/backup" className="mb-5 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                <div>
                  <p className="text-sm font-semibold text-foreground">Backup de dados do sistema</p>
                  <p className="mt-1 text-xs text-muted-foreground">Exportar residências, bairros, moradores e histórico em PDF, DOCX ou Excel.</p>
                </div>
                <Download className="h-5 w-5 shrink-0 text-primary" />
              </Link>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(selectedExport).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() =>
                            setSelectedExport((current) => ({
                              ...current,
                              [key]: !current[key as keyof typeof current],
                            }))
                          }
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="capitalize text-foreground">
                          {key === "historico" ? "Histórico" : key === "seguranca" ? "Segurança" : key}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Formato</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Intervalo</label>
                      <select
                        value={exportRange}
                        onChange={(e) => setExportRange(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="all">Todo o histórico</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Download className="h-4 w-4 text-primary" />
                      Resumo da Exportação
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>• {selectedExport.perfil ? "✓ Perfil Pessoal" : "✕ Perfil Omitido"}</li>
                      <li>• {selectedExport.preferencias ? "✓ Definições de Sistema" : "✕ Definições Omitidas"}</li>
                      <li>• {selectedExport.seguranca ? "✓ Registos de Segurança" : "✕ Segurança Omitida"}</li>
                      <li>• {selectedExport.historico ? "✓ Histórico de Atividades" : "✕ Histórico Omitido"}</li>
                    </ul>
                  </div>

                  <Button
                    className="mt-4 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Ficheiro
                  </Button>
                </div>
              </div>
            </section>

            {/* 4. SEGURANÇA E PRIVACIDADE */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">4. Segurança e Privacidade</h2>
                  <p className="text-sm text-muted-foreground">Palavra-passe, sessões ativas e política de privacidade</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Modificação de Palavra-Passe */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Palavra-passe de Acesso</p>
                    <p className="text-xs text-muted-foreground">Atualize a sua palavra-passe periodicamente por segurança</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-border hover:bg-muted"
                    onClick={() => setModalSenhaAberto(true)}
                  >
                    <KeyRound className="mr-2 h-4 w-4 text-primary" />
                    Alterar Palavra-passe
                  </Button>
                </div>

                {/* Sessões Ativas */}
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Sessões ativas
                  </div>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{session.device}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.location} · {session.active}
                          </p>
                        </div>
                        <Button
                          variant={session.current ? "secondary" : "outline"}
                          size="sm"
                          className="rounded-xl border-border"
                          disabled={session.current}
                          onClick={() => handleRemoveSession(session.id)}
                        >
                          {session.current ? "Atual" : "Revogar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de Atividade */}
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    Histórico de atividades recentes
                  </div>
                  <div className="space-y-2.5">
                    {activityLog.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Política de Privacidade */}
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    Termos de privacidade
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Os seus dados são utilizados exclusivamente para as operações internas do sistema SIRCAH. Pode rever e
                    revogar acessos a qualquer momento nesta interface.
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Termos aceites</p>
                      <p className="text-xs text-muted-foreground">Confirmação de conformidade com a política</p>
                    </div>
                    <Switch checked={privacidadeAceite} onCheckedChange={setPrivacidadeAceite} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODAL DE ALTERAÇÃO DE SENHA */}
      {modalSenhaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Alterar Palavra-passe</h3>
              </div>
              <button
                onClick={fecharModalSenha}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {erroSenha && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {erroSenha}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Palavra-passe Atual</label>
                <div className="relative mt-1">
                  <input
                    type={mostrarSenhaActual ? "text" : "password"}
                    value={senhaActual}
                    onChange={(e) => setSenhaActual(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaActual(!mostrarSenhaActual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarSenhaActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Nova Palavra-passe</label>
                <div className="relative mt-1">
                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Confirmar Nova Palavra-passe</label>
                <input
                  type={mostrarNovaSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" className="rounded-xl border-border" onClick={fecharModalSenha}>
                Cancelar
              </Button>
              <Button
                onClick={handleAlterarSenha}
                disabled={salvandoSenha}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {salvandoSenha ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A alterar...
                  </>
                ) : (
                  "Confirmar Alteração"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}