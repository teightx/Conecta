import type { NormalizedRow, DiagnosticsItem } from '../domain/types'
import { parseBankLine } from './parseLine'

/**
 * Resultado do parse completo do arquivo do banco
 */
export interface BankParseResult {
  /** Linhas normalizadas */
  rows: NormalizedRow[]
  /** Diagnósticos agregados */
  diagnostics: DiagnosticsItem[]
  /** Competência mais frequente (se detectada) */
  competencia?: string
}

/**
 * Parser do arquivo TXT do banco
 * 100% client-side, sem backend
 */
export class BankParser {
  /**
   * Parseia o arquivo TXT do banco
   * @param file Arquivo selecionado pelo usuário
   * @returns Linhas normalizadas + diagnósticos
   */
  async parse(file: File): Promise<BankParseResult> {
    const diagnostics: DiagnosticsItem[] = []
    const rows: NormalizedRow[] = []

    // Tentar ler como UTF-8 primeiro
    let content = await this.readFileAsText(file, 'utf-8')

    // Detectar caracteres inválidos (indicativo de encoding errado)
    const invalidChars = (content.match(/[\uFFFD]/g) || []).length
    if (invalidChars > 10) {
      diagnostics.push({
        severity: 'info',
        code: 'BANK_ENCODING_FALLBACK',
        message: `Detectados ${invalidChars} caracteres inválidos em UTF-8, tentando Latin1`,
        details: { invalidChars },
      })
      content = await this.readFileAsText(file, 'latin1')
    }

    // Processar linha a linha
    const lines = content.split(/\r?\n/)
    let validCount = 0
    let errorCount = 0
    let headerCount = 0
    const competenciaCount: Record<string, number> = {}

    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1
      const result = parseBankLine(lines[i], lineNo)

      if (result.row) {
        rows.push(result.row)
        validCount++

        // Contar competências
        if (result.row.meta?.competencia) {
          const comp = result.row.meta.competencia
          competenciaCount[comp] = (competenciaCount[comp] || 0) + 1
        }
      }

      if (result.diag) {
        // Agregar diagnósticos de header (não poluir com muitos)
        if (result.diag.code === 'BANK_HEADER') {
          headerCount++
        } else if (result.diag.severity === 'error') {
          errorCount++
          // Limitar diagnósticos de erro para não explodir memória
          if (errorCount <= 50) {
            diagnostics.push(result.diag)
          }
        } else {
          diagnostics.push(result.diag)
        }
      }
    }

    // Diagnóstico de header agregado
    if (headerCount > 0) {
      diagnostics.unshift({
        severity: 'info',
        code: 'BANK_HEADER_COUNT',
        message: `${headerCount} linha(s) de header detectada(s)`,
        details: { headerCount },
      })
    }

    // Diagnóstico final de contagem
    diagnostics.push({
      severity: errorCount > 0 ? 'warn' : 'info',
      code: 'BANK_PARSE_SUMMARY',
      message: `Processadas ${lines.length} linhas: ${validCount} válidas, ${errorCount} com erro`,
      details: {
        totalLines: lines.length,
        validCount,
        errorCount,
        headerCount,
      },
    })

    // Se muitos erros, adicionar aviso
    if (errorCount > 50) {
      diagnostics.push({
        severity: 'warn',
        code: 'BANK_ERRORS_TRUNCATED',
        message: `${errorCount - 50} erros adicionais omitidos`,
        details: { totalErrors: errorCount, shown: 50 },
      })
    }

    // Determinar competência mais frequente
    let competencia: string | undefined
    let maxCount = 0
    for (const [comp, count] of Object.entries(competenciaCount)) {
      if (count > maxCount) {
        maxCount = count
        competencia = comp
      }
    }

    return { rows, diagnostics, competencia }
  }

  /**
   * Lê arquivo como texto com encoding específico
   */
  private async readFileAsText(
    file: File,
    encoding: 'utf-8' | 'latin1'
  ): Promise<string> {
    if (encoding === 'utf-8') {
      return file.text()
    }

    // Fallback para Latin1 usando FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file, 'ISO-8859-1')
    })
  }
}
