import type { NormalizedRow, DiagnosticsItem } from '../domain/types'

/**
 * Resultado do parse de uma linha do TXT do banco
 */
export interface ParseLineResult {
  /** Linha normalizada (undefined se header ou erro) */
  row?: NormalizedRow
  /** Diagnóstico (info para header, error para falhas) */
  diag?: DiagnosticsItem
}

/**
 * Layout do TXT do banco (fixed-width):
 * - pos 0: tipo (1=header, 2=dados)
 * - pos 1-9: sequencial (9 dígitos)
 * - pos 10-21: matrícula base (12 dígitos)
 * - pos 22-33: matrícula completa (12 dígitos: 10 base + 2 sufixo)
 * - pos 34-43: evento (10 dígitos)
 * - pos 44-49: competência (6 dígitos: MMAAAA)
 * - pos 50-56: valor em centavos (7 dígitos)
 * - pos 57-62: referência (6 dígitos)
 * - pos 63+: sequencial final
 */
const MIN_LINE_LENGTH = 57 // Mínimo para extrair valor

/**
 * Parseia uma linha do arquivo TXT do banco
 * @param line Conteúdo da linha (sem quebra de linha)
 * @param lineNo Número da linha (1-indexed)
 * @returns Linha normalizada e/ou diagnóstico
 */
export function parseBankLine(line: string, lineNo: number): ParseLineResult {
  // Remover possíveis caracteres de controle (CR, etc)
  const cleanLine = line.replace(/[\r\n]/g, '')

  // Linha vazia: ignorar silenciosamente
  if (cleanLine.trim() === '') {
    return {}
  }

  const tipo = cleanLine[0]

  // Header: tipo = '1'
  if (tipo === '1') {
    return {
      diag: {
        severity: 'info',
        code: 'BANK_HEADER',
        message: `Header do arquivo do banco detectado`,
        details: { lineNo, raw: cleanLine.slice(0, 50) },
      },
    }
  }

  // Linha de dados: tipo = '2'
  if (tipo === '2') {
    // Verificar tamanho mínimo
    if (cleanLine.length < MIN_LINE_LENGTH) {
      return {
        diag: {
          severity: 'error',
          code: 'BANK_LINE_TOO_SHORT',
          message: `Linha ${lineNo} muito curta (${cleanLine.length} chars, mínimo ${MIN_LINE_LENGTH})`,
          details: { lineNo, length: cleanLine.length, raw: cleanLine },
        },
      }
    }

    // Extrair matrícula completa (12 dígitos: pos 22-33)
    const matriculaCompleta = cleanLine.slice(22, 34)

    // Validar se é numérico
    if (!/^\d{12}$/.test(matriculaCompleta)) {
      return {
        diag: {
          severity: 'error',
          code: 'BANK_INVALID_MATRICULA',
          message: `Linha ${lineNo}: matrícula inválida "${matriculaCompleta}"`,
          details: { lineNo, matriculaCompleta, raw: cleanLine },
        },
      }
    }

    // Base = primeiros 10 dígitos, Sufixo = últimos 2 dígitos
    const base = parseInt(matriculaCompleta.slice(0, 10), 10)
    const sufixo = parseInt(matriculaCompleta.slice(10, 12), 10)
    const matricula = `${base}-${sufixo}`

    // Extrair valor (7 dígitos em centavos: pos 50-56)
    const valorRaw = cleanLine.slice(50, 57)

    if (!/^\d{7}$/.test(valorRaw)) {
      return {
        diag: {
          severity: 'error',
          code: 'BANK_INVALID_VALOR',
          message: `Linha ${lineNo}: valor inválido "${valorRaw}"`,
          details: { lineNo, valorRaw, raw: cleanLine },
        },
      }
    }

    const valorCentavos = parseInt(valorRaw, 10)
    const valor = valorCentavos / 100

    // Extrair competência (6 dígitos: pos 44-49, formato MMAAAA)
    const competenciaRaw = cleanLine.slice(44, 50)
    let competencia: string | undefined

    if (/^\d{6}$/.test(competenciaRaw)) {
      const mes = competenciaRaw.slice(0, 2)
      const ano = competenciaRaw.slice(2, 6)
      competencia = `${mes}/${ano}`
    }

    // Extrair evento (10 dígitos: pos 34-43)
    const eventoRaw = cleanLine.slice(34, 44)
    let evento: string | undefined

    if (/^\d+$/.test(eventoRaw)) {
      evento = String(parseInt(eventoRaw, 10))
    }

    const row: NormalizedRow = {
      source: 'banco',
      matricula,
      valor,
      meta: {
        competencia,
        evento,
        confidence: 'high',
      },
      rawRef: {
        lineNo,
        raw: cleanLine,
      },
    }

    return { row }
  }

  // Tipo desconhecido
  return {
    diag: {
      severity: 'warn',
      code: 'BANK_UNKNOWN_LINE_TYPE',
      message: `Linha ${lineNo}: tipo desconhecido "${tipo}"`,
      details: { lineNo, tipo, raw: cleanLine.slice(0, 50) },
    },
  }
}
