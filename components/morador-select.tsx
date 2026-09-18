"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react"
import { fetchTodosMoradores, Morador } from "@/lib/residencia/morador-service"
import { cn } from "@/lib/utils"

interface MoradorSelectProps {
  value: Morador | null
  onChange: (morador: Morador | null) => void
  disabled?: boolean
}

/**
 * Combobox com pesquisa para seleccionar o morador.
 * Ao seleccionar, expõe o objecto Morador completo (uid + nome + telefone)
 * para que o formulário pai preencha automaticamente os outros campos.
 */
export function MoradorSelect({ value, onChange, disabled }: MoradorSelectProps) {
  const [moradores,   setMoradores]   = useState<Morador[]>([])
  const [carregando,  setCarregando]  = useState(true)
  const [aberto,      setAberto]      = useState(false)
  const [pesquisa,    setPesquisa]    = useState("")
  const inputRef  = useRef<HTMLInputElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  // Carrega moradores do Firestore
  useEffect(() => {
    fetchTodosMoradores()
      .then(setMoradores)
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setAberto(false)
        setPesquisa("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Filtra moradores pelo texto de pesquisa
  const filtrados = moradores.filter((m) =>
    m.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    m.telefone.includes(pesquisa)
  )

  const handleSeleccionar = (morador: Morador) => {
    onChange(morador)
    setAberto(false)
    setPesquisa("")
  }

  const handleLimpar = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setPesquisa("")
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled || carregando}
        onClick={() => {
          setAberto((v) => !v)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border",
          "bg-muted/30 px-3 py-2 text-sm transition-colors",
          "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className={cn("flex items-center gap-2", !value && "text-muted-foreground")}>
          {carregando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A carregar moradores...
            </>
          ) : value ? (
            <>
              <User className="h-4 w-4 text-primary" />
              {value.nome}
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Seleccione o morador...
            </>
          )}
        </span>

        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={handleLimpar}
              className="rounded-md p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Campo de pesquisa dentro do dropdown */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar por nome ou telefone..."
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Lista */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtrados.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nenhum morador encontrado.
              </li>
            ) : (
              filtrados.map((m) => (
                <li
                  key={m.uid}
                  onClick={() => handleSeleccionar(m)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 cursor-pointer",
                    "hover:bg-muted/60 text-sm transition-colors",
                    value?.uid === m.uid && "bg-primary/5"
                  )}
                >
                  <div>
                    <p className="font-medium text-foreground">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">{m.telefone}</p>
                  </div>
                  {value?.uid === m.uid && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
