"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { buscarResidencias } from "@/lib/residencia/residenciaService"

export default function BemVindoPage() {
  // Estados para as estatísticas reais
  const [stats, setStats] = useState({
    total: 0,
    taxaAprovacao: 0,
    bairros: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // CORREÇÃO: Nome junto, sem espaços vazios
    const carregarEstatisticasReais = async () => {
      try {
        setLoading(true)
        // O serviço abaixo já consulta o teu Firebase Firestore internamente
        const todasResidencias = await buscarResidencias("") 
        
        if (todasResidencias && todasResidencias.length > 0) {
          const totalDocs = todasResidencias.length
          
          // 1. Filtra as aprovadas para calcular a percentagem
          const aprovadas = todasResidencias.filter((r: any) => r.estado === "aprovado").length
          const percentagemAprovacao = totalDocs > 0 ? Math.round((aprovadas / totalDocs) * 100) : 0
          
          // 2. Extrai bairros únicos ignorando campos vazios
          const listaBairros = todasResidencias
            .map((r: any) => r.bairro?.trim().toLowerCase())
            .filter((bairro: string) => bairro)
          const bairrosUnicos = new Set(listaBairros).size

          setStats({
            total: totalDocs,
            taxaAprovacao: percentagemAprovacao,
            bairros: bairrosUnicos > 0 ? bairrosUnicos : 0
          })
        }
      } catch (error) {
        console.error("Erro ao processar métricas do Firebase:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarEstatisticasReais()
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F6F2] relative overflow-hidden">
      {/* Background Pattern - Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#FF5F6D]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF5F6D]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#F2C94C]/5 rounded-full blur-2xl" />

      {/* Header */}
      <header className="relative z-10 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/bem-vindo" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF5F6D] rounded-xl flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1A1A1B]">SIRCAH</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/bem-vindo" 
              className="text-sm font-medium text-[#1A1A1B] hover:text-[#FF5F6D] transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/sobre" 
              className="text-sm font-medium text-[#6B7280] hover:text-[#FF5F6D] transition-colors"
            >
              Sobre
            </Link>
            <Link 
              href="/contacto" 
              className="text-sm font-medium text-[#6B7280] hover:text-[#FF5F6D] transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Login Button */}
          <Link href="/login">
            <Button 
              variant="outline" 
              className="rounded-full border-[#1A1A1B] text-[#1A1A1B] hover:bg-[#1A1A1B] hover:text-white px-6"
            >
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-[#E5E4E0] rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-[#27AE60] rounded-full animate-pulse" />
            <span className="text-sm text-[#6B7280]">Sistema Ativo na Provincia do Huambo</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A1A1B] leading-tight mb-6 text-balance">
            Bem-vindo ao{" "}
            <span className="text-[#FF5F6D]">SIRCAR</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
           Sistema de Indetificação Residencial por Código Único com Recurso de Realidade Aumentada para Apoio 
           a serviços de Emergência e Lógistica No Município do Huambo. 
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-[#FF5F6D] hover:bg-[#e5545f] text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-[#FF5F6D]/25 hover:shadow-xl hover:shadow-[#FF5F6D]/30 transition-all"
              >
                Comecar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="ghost"
                size="lg"
                className="text-[#1A1A1B] hover:bg-[#1A1A1B]/5 rounded-full px-8 py-6 text-base font-medium"
              >
                Aceder ao Painel
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-[#E5E4E0]/50 min-h-[100px]">
            <div className="text-center">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#6B7280]" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-[#1A1A1B]">{stats.total}</p>
              )}
              <p className="text-sm text-[#6B7280] mt-1">Residencias Registadas</p>
            </div>
            <div className="text-center">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#6B7280]" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-[#1A1A1B]">{stats.taxaAprovacao}%</p>
              )}
              <p className="text-sm text-[#6B7280] mt-1">Taxa de Aprovacao</p>
            </div>
            <div className="text-center">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#6B7280]" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-[#1A1A1B]">{stats.bairros}</p>
              )}
              <p className="text-sm text-[#6B7280] mt-1">Bairros Cobertos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E4E0] to-transparent" />
    </div>
  )
}