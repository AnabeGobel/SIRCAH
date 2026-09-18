"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

// Importações do Firebase e Notificações
import { auth } from "@/lib/Services/firebaseConfig"
import { sendPasswordResetEmail } from "firebase/auth"
import { toast } from "sonner"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailLimpo = email.trim()
    if (!emailLimpo) {
      toast.error("Por favor, introduza um e-mail válido.")
      return
    }

    setIsLoading(true)
    
    try {
      // Envia o e-mail real de recuperação do Firebase
      await sendPasswordResetEmail(auth, emailLimpo)
      
      toast.success("E-mail de recuperação enviado com sucesso!")
      setIsSent(true)
    } catch (error: any) {
      console.error("Erro ao recuperar senha:", error)
      
      // Tratamento amigável de erros comuns do Firebase Auth
      if (error.code === "auth/user-not-found") {
        toast.error("Não encontrámos nenhuma conta associada a este e-mail.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("O formato do e-mail introduzido não é válido.")
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.")
      } else {
        toast.error("Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Decorative Blurs */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[#FF5F6D]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#F2C94C]/8 rounded-full blur-3xl" />

      {/* Back to Login */}
      <Link 
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1B] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Voltar ao Login</span>
      </Link>

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Floating Icon Circle */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-colors ${
            isSent 
              ? "bg-[#27AE60] shadow-[#27AE60]/30" 
              : "bg-[#FF5F6D] shadow-[#FF5F6D]/30"
          }`}>
            {isSent ? (
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
            ) : (
              <Mail className="w-10 h-10 text-white" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Main Card */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl pt-16 pb-8 px-8 relative"
          style={{
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)'
          }}
        >
          {isSent ? (
            /* Success State */
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#1A1A1B] mb-2">
                Email Enviado!
              </h1>
              <p className="text-sm text-[#6B7280] mb-6">
                Enviámos instruções para recuperar a sua senha para <span className="font-medium text-[#1A1A1B]">{email}</span>
              </p>
              
              <div className="bg-[#27AE60]/10 border border-[#27AE60]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#27AE60]">
                  Verifique a sua caixa de entrada e siga as instruções no e-mail.
                </p>
              </div>

              <Link href="/login">
                <Button
                  className="w-full h-14 bg-[#1A1A1B] hover:bg-[#333] text-white font-semibold text-base rounded-xl"
                >
                  Voltar ao Login
                </Button>
              </Link>

              <p className="text-xs text-[#6B7280] mt-4">
                Não recebeu o e-mail?{" "}
                <button 
                  onClick={() => setIsSent(false)}
                  className="text-[#FF5F6D] font-medium hover:underline cursor-pointer"
                >
                  Tentar novamente
                </button>
              </p>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#1A1A1B] mb-2">
                  Recuperar Senha
                </h1>
                <p className="text-sm text-[#6B7280]">
                  Insira o seu e-mail para receber instruções de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="relative">
                  <div className="flex items-center bg-[#EAE9E4] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-center w-14 h-14 border-r border-[#D5D4D0]">
                      <Mail className="w-5 h-5 text-[#FF5F6D]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="O seu e-mail"
                      className="flex-1 h-14 px-4 bg-transparent text-[#1A1A1B] placeholder:text-[#6B7280] focus:outline-none text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#FF5F6D] hover:bg-[#e5545f] text-white font-semibold text-base uppercase tracking-wide rounded-xl shadow-lg shadow-[#FF5F6D]/30 hover:shadow-xl hover:shadow-[#FF5F6D]/40 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>A enviar...</span>
                      </div>
                    ) : (
                      "ENVIAR INSTRUÇÕES"
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-[#6B7280]">
                  Lembrou-se da senha?{" "}
                  <Link 
                    href="/login"
                    className="text-[#FF5F6D] font-medium hover:underline"
                  >
                    Voltar ao login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Logo Below Card */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-8 h-8 bg-[#FF5F6D] rounded-lg flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1A1A1B]">SIRCAH</span>
        </div>
      </div>
    </div>
  )
}