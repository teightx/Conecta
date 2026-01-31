import type { NormalizedRow, DiagnosticsItem } from '../domain/types'
import { parseBRL } from './parseBRL'

/**
 * Resultado da extração do relatório CSV da prefeitura
 */
export interface CsvReportExtractionResult {
  rows: NormalizedRow[]
  diagnostics: DiagnosticsItem[]
  competencia?: string
}

/**
 * Extrai dados do relatório CSV "Relação de Trabalhadores por Evento"
 * 
 * Formato esperado:
 * - Cabeçalho com competência (ex: "Mês/Ano: 01/2026")
 * - Seções por evento (ex: "Evento: 002 - CONSIGNADO BB")
 * - Linhas de dados começando com matrícula (ex: "85-1,NOME,...")
 * - Valores monetários entre aspas no formato pt-BR (ex: "1.234,56")
 * 
 * @param text Conteúdo do arquivo CSV
 * @returns Linhas normalizadas + diagnósticos
 */
export function extractFromCsvReport(text: string): CsvReportExtractionResult {
  const rows: NormalizedRow[] = []
  const diagnostics: DiagnosticsItem[] = []

  // Contadores para diagnóstico
  let totalLines = 0
  let dataLinesDetected = 0
  let extractedRows = 0
  let discardedNoValue = 0
  let discardedNoMatricula = 0
  const eventosVistos = new Set<string>()

  // Estado do parser
  let competenciaFound: string | undefined
  let eventoAtual: string | undefined

  // Regex patterns
  const competenciaRegexFull = /\b(\d{2})\/(\d{4})\b/           // 01/2026
  const competenciaRegexCompact = /\b(0[1-9]|1[0-2])(\d{4})\b/  // 012026
  const eventoRegex = /Evento:\s*(\d{1,3})/i
  const matriculaRegex = /^(\d{1,6}-\d{1,3}),/
  const valorEntreAspasRegex = /"([\d.,]+)"/g

  // Dividir em linhas
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    totalLines++
    const trimmedLine = line.trim()

    // Ignorar linhas vazias
    if (trimmedLine === '') {
      continue
    }

    // Detectar competência (apenas primeira ocorrência)
    if (!competenciaFound) {
      // Tentar formato completo: 01/2026
      const matchFull = trimmedLine.match(competenciaRegexFull)
      if (matchFull) {
        competenciaFound = `${matchFull[1]}/${matchFull[2]}`
      } else {
        // Tentar formato compacto: 012026
        const matchCompact = trimmedLine.match(competenciaRegexCompact)
        if (matchCompact) {
          competenciaFound = `${matchCompact[1]}/${matchCompact[2]}`
        }
      }
    }

    // Detectar mudança de evento
    const eventoMatch = trimmedLine.match(eventoRegex)
    if (eventoMatch) {
      const eventoNum = parseInt(eventoMatch[1], 10)
      eventoAtual = eventoNum.toString().padStart(3, '0')
      eventosVistos.add(eventoAtual)
      continue
    }

    // Detectar linha de dados (começa com matrícula)
    const matriculaMatch = trimmedLine.match(matriculaRegex)
    if (matriculaMatch) {
      dataLinesDetected++
      const matricula = matriculaMatch[1]

      // Validar matrícula
      if (!matricula || matricula.length < 3) {
        discardedNoMatricula++
        continue
      }

      // Extrair todos os valores entre aspas
      const valoresMatch = [...trimmedLine.matchAll(valorEntreAspasRegex)]
      
      if (valoresMatch.length === 0) {
        discardedNoValue++
        continue
      }

      // Pegar o último valor (é o "valor final" do relatório)
      const ultimoValorStr = valoresMatch[valoresMatch.length - 1][1]
      const valor = parseBRL(ultimoValorStr)

      if (valor === null) {
        discardedNoValue++
        continue
      }

      // Criar NormalizedRow
      const row: NormalizedRow = {
        source: 'prefeitura',
        matricula,
        valor,
        meta: {
          competencia: competenciaFound,
          evento: eventoAtual,
          confidence: 'high',
        },
        rawRef: {
          raw: trimmedLine,
        },
      }

      rows.push(row)
      extractedRows++
    }
  }

  // Diagnóstico final de resumo
  diagnostics.push({
    severity: extractedRows > 0 ? 'info' : 'error',
    code: 'prefeitura_csv_v1_summary',
    message: `Extração CSV: ${extractedRows} linhas extraídas de ${dataLinesDetected} detectadas`,
    details: {
      totalLines,
      dataLinesDetected,
      extractedRows,
      discardedNoValue,
      discardedNoMatricula,
      competenciaFound,
      eventosVistosCount: eventosVistos.size,
      eventosVistos: Array.from(eventosVistos),
    },
  })

  // Se não extraiu nada, adicionar erro específico
  if (extractedRows === 0) {
    diagnostics.push({
      severity: 'error',
      code: 'prefeitura_extraction_failed',
      message: 'Nenhuma linha de dados extraída do arquivo da prefeitura',
      details: {
        totalLines,
        dataLinesDetected,
        discardedNoValue,
        discardedNoMatricula,
      },
    })
  }

  return { rows, diagnostics, competencia: competenciaFound }
}
