"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { fetchTodasResidencias, Residencia, StatusResidencia } from "@/lib/residence-service"

interface UseResidencesState {
  residencias:       Residencia[]   // todas, sem filtro
  filtradas:         Residencia[]   // resultado após pesquisa + filtro de status
  carregando:        boolean
  erro:              string | null
  termoPesquisa:     string
  setTermoPesquisa:  (t: string) => void
  filtroStatus:      "todas" | StatusResidencia
  setFiltroStatus:   (s: "todas" | StatusResidencia) => void
  recarregar:        () => void
  // Quando a pesquisa é por bairro, devolve estatísticas desse bairro
  statsBairro:       { bairro: string; total: number; aprovadas: number; pendentes: number; rejeitadas: number } | null
}

/**
 * Hook central da página de mapa.
 * Carrega todas as residências do Firestore e expõe pesquisa + filtros.
 *
 * A pesquisa cobre:
 *  - código          (ex: "RES-2035")
 *  - nome do morador (ex: "Maria Fernandes")
 *  - telefone        (ex: "923456789")
 *  - bairro          (ex: "Académico") → activa o resumo estatístico do bairro
 */
export const useResidences = (): UseResidencesState => {
  const [residencias,    setResidencias]    = useState<Residencia[]>([])
  const [carregando,     setCarregando]     = useState(true)
  const [erro,           setErro]           = useState<string | null>(null)
  const [termoPesquisa,  setTermoPesquisa]  = useState("")
  const [filtroStatus,   setFiltroStatus]   = useState<"todas" | StatusResidencia>("todas")

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    fetchTodasResidencias()
      .then(setResidencias)
      .catch((e) => {
        console.error(e)
        setErro("Erro ao carregar residências. Verifique a conexão com o Firestore.")
      })
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ── Normaliza texto para comparação sem acentos/maiúsculas ─────────────────
  const normalizar = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  // ── Detecta se o termo corresponde a um bairro existente ────────────────────
  const bairrosUnicos = useMemo(
    () => Array.from(new Set(residencias.map((r) => r.bairro).filter(Boolean))),
    [residencias]
  )

  const bairroCorrespondente = useMemo(() => {
    if (!termoPesquisa.trim()) return null
    const termoNorm = normalizar(termoPesquisa)
    return bairrosUnicos.find((b) => normalizar(b).includes(termoNorm)) ?? null
  }, [termoPesquisa, bairrosUnicos])

  // ── Filtragem combinada: pesquisa + status ──────────────────────────────────
  const filtradas = useMemo(() => {
    let resultado = residencias

    // Filtro de status (independente da pesquisa)
    if (filtroStatus !== "todas") {
      resultado = resultado.filter((r) => r.status === filtroStatus)
    }

    // Filtro de pesquisa
    const termo = termoPesquisa.trim()
    if (termo) {
      const termoNorm = normalizar(termo)

      // Se o termo corresponde a um bairro, mostra TODAS as residências
      // desse bairro (pendentes + aprovadas + rejeitadas), respeitando
      // ainda o filtro de status se o utilizador tiver seleccionado um.
      if (bairroCorrespondente) {
        resultado = resultado.filter((r) => normalizar(r.bairro) === normalizar(bairroCorrespondente))
      } else {
        // Pesquisa por código, nome do morador ou telefone
        resultado = resultado.filter((r) => {
          const codigoMatch  = normalizar(r.codigo).includes(termoNorm)
          const nomeMatch    = normalizar(r.nome_morador).includes(termoNorm)
          const telefoneMatch= r.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""))
          const ruaMatch     = normalizar(r.rua).includes(termoNorm)
          return codigoMatch || nomeMatch || telefoneMatch || ruaMatch
        })
      }
    }

    return resultado
  }, [residencias, termoPesquisa, filtroStatus, bairroCorrespondente])

  // ── Estatísticas do bairro pesquisado ───────────────────────────────────────
  const statsBairro = useMemo(() => {
    if (!bairroCorrespondente) return null
    const doBairro = residencias.filter(
      (r) => normalizar(r.bairro) === normalizar(bairroCorrespondente)
    )
    return {
      bairro:     bairroCorrespondente,
      total:      doBairro.length,
      aprovadas:  doBairro.filter((r) => r.status === "aprovado").length,
      pendentes:  doBairro.filter((r) => r.status === "pendente").length,
      rejeitadas: doBairro.filter((r) => r.status === "rejeitada").length,
    }
  }, [bairroCorrespondente, residencias])

  return {
    residencias,
    filtradas,
    carregando,
    erro,
    termoPesquisa,
    setTermoPesquisa,
    filtroStatus,
    setFiltroStatus,
    recarregar: carregar,
    statsBairro,
  }
}
