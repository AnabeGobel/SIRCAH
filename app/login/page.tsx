"use client" // Indica que este é um Client Component

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Lock, Eye, EyeOff } from "lucide-react" // Ícones modernos da biblioteca Lucide
import { toast } from "sonner"

// ─── IMPORTS DO FIREBASE ─────────────────────────────────────────────────────
import { auth } from "@/lib/Services/firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"

const GLOBAL_ADMIN_EMAIL = "admin@gmail.com"

export default function LoginPage() {
  const router = useRouter() // Hook para navegação entre páginas

  // Estados locais para controlar os campos do formulário e interface
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // Controla se a senha está visível
  const [rememberMe, setRememberMe] = useState(false) // Estado do "Lembrar-me"
  const [isLoading, setIsLoading] = useState(false) // Controla o estado de carregamento do botão

  // Função disparada ao submeter o formulário (Autenticação Real)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que a página recarregue ao clicar no botão
    setIsLoading(true) // Ativa a animação de carregamento
    
    try {
      // Faz a validação real usando o serviço de Auth do Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password)
      
      toast.success("Sessão iniciada com sucesso!")
      
      const authenticatedEmail = credential.user.email?.trim().toLowerCase()
      router.push(authenticatedEmail === GLOBAL_ADMIN_EMAIL ? "/admin-global/dashboard" : "/dashboard")
    } catch (error: unknown) {
      const errorCode = error instanceof Error && "code" in error ? String(error.code) : ""
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("Erro ao autenticar:", errorCode)
      
      // Tratamento amigável das falhas comuns de autenticação
      if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        toast.error("Email ou palavra-passe incorretos.")
      } else if (errorCode === "auth/too-many-requests") {
        toast.error("Muitas tentativas falhadas. Conta temporariamente bloqueada.")
      } else {
        toast.error("Erro ao entrar: " + errorMessage)
      }
    } finally {
      setIsLoading(false) // Desativa a animação de carregamento
    }
  }

  return (
    // Contentor principal: centraliza o login e define o fundo bege claro
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Padrão decorativo de fundo (pequenos pontos) */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Círculos decorativos desfocados para dar profundidade ao design */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF5F6D]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FF5F6D]/8 rounded-full blur-3xl" />

      {/* Botão de Voltar: Link para a Landing Page (/) */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1B] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Voltar</span>
      </Link>

      {/* Contentor do Cartão de Login */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Círculo com Avatar flutuante acima do card */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
          <div className="w-24 h-24 bg-[#FF5F6D] rounded-full flex items-center justify-center shadow-xl shadow-[#FF5F6D]/30">
            <User className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Corpo principal do Cartão (Branco com efeito de vidro) */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl pt-16 pb-8 px-8 relative"
          style={{
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Cabeçalho do Card */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1B] mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-[#6B7280]">
              Aceda ao painel de gestão do SIRCAR
            </p>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Campo de Email */}
            <div className="relative">
              <div className="flex items-center bg-[#EAE9E4] rounded-xl overflow-hidden">
                <div className="flex items-center justify-center w-14 h-14 border-r border-[#D5D4D0]">
                  <User className="w-5 h-5 text-[#FF5F6D]" />
                </div>
                <input
                  type="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email de acesso"
                  className="flex-1 h-14 px-4 bg-transparent text-[#1A1A1B] placeholder:text-[#6B7280] focus:outline-none text-sm disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Campo de Palavra-passe */}
            <div className="relative">
              <div className="flex items-center bg-[#EAE9E4] rounded-xl overflow-hidden">
                <div className="flex items-center justify-center w-14 h-14 border-r border-[#D5D4D0]">
                  <Lock className="w-5 h-5 text-[#FF5F6D]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"} // Alterna entre texto e senha
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Palavra-passe"
                  className="flex-1 h-14 px-4 bg-transparent text-[#1A1A1B] placeholder:text-[#6B7280] focus:outline-none text-sm disabled:opacity-50"
                  required
                />
                {/* Botão para mostrar/esconder senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-[#6B7280] hover:text-[#FF5F6D] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Opções: Lembrar-me e Esqueci a senha */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={rememberMe}
                  disabled={isLoading}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-[#D5D4D0] data-[state=checked]:bg-[#FF5F6D] data-[state=checked]:border-[#FF5F6D]"
                />
                <span className="text-sm text-[#1A1A1B]">Lembrar-me</span>
              </label>
              <Link 
                href="/recuperar-senha"
                className="text-sm text-[#6B7280] hover:text-[#FF5F6D] transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão de Submissão com estado de carregamento */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#FF5F6D] hover:bg-[#e5545f] text-white font-semibold text-base uppercase tracking-wide rounded-xl shadow-lg shadow-[#FF5F6D]/30 hover:shadow-xl hover:shadow-[#FF5F6D]/40 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    {/* Animação de Spinner */}
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>A entrar...</span>
                  </div>
                ) : (
                  "LOGIN"
                )}
              </Button>
            </div>
          </form>

          {/* Divisor Visual */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#E5E4E0]" />
            <span className="text-xs text-[#6B7280]">ou</span>
            <div className="flex-1 h-px bg-[#E5E4E0]" />
          </div>

          {/* Rodapé do Card: Solicitar Acesso */}
          <div className="text-center">
            <p className="text-sm text-[#6B7280]">
              Novo no sistema?{" "}
              <Link 
                href="/contacto"
                className="text-[#FF5F6D] font-medium hover:underline"
              >
                Solicitar acesso
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé da Página: Logo e Versão */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-8 h-8 bg-[#FF5F6D] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1A1A1B]">SIRCAR</span>
          <span className="text-xs text-[#6B7280]">v1.0</span>
        </div>
      </div>
    </div>
  )
}