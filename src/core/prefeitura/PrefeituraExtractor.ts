import type { NormalizedRow, DiagnosticsItem } from '../domain/types'
import { extractFromCsvReport } from './extractFromCsvReport'

/**
 * Formato detectado do arquivo da prefeitura
 */
export type PrefeituraFormato = 'csv_report_v1' | 'unknown'

/**
 * Resultado da extração da prefeitura
 */
export interface PrefeituraExtractionResult {
  rows: NormalizedRow[]
  diagnostics: DiagnosticsItem[]
  competencia?: string
  formato: PrefeituraFormato
}

/**
 * Extrator de dados da prefeitura
 * Suporta diferentes formatos de arquivo (CSV, XLS futuro)
 */
export class PrefeituraExtractor {
  /**
   * Extrai dados do arquivo da prefeitura
   * @param file Arquivo selecionado pelo usuário
   * @returns Linhas normalizadas + diagnósticos + formato detectado
   */
  async extract(file: File): Promise<PrefeituraExtractionResult> {
    const extension = this.getExtension(file.name)

    // CSV: usar extrator de relatório CSV v1
    if (extension === 'csv') {
      const text = await file.text()
      const result = extractFromCsvReport(text)

      return {
        ...result,
        formato: 'csv_report_v1',
      }
    }

    // Formato não suportado
    return {
      rows: [],
      diagnostics: [
        {
          severity: 'error',
          code: 'prefeitura_unsupported_format',
          message: `Formato de arquivo não suportado: .${extension || '(sem extensão)'}`,
          details: {
            fileName: file.name,
            extension,
            supportedFormats: ['csv'],
          },
        },
      ],
      competencia: undefined,
      formato: 'unknown',
    }
  }

  /**
   * Extrai extensão do nome do arquivo (lowercase)
   */
  private getExtension(fileName: string): string {
    const parts = fileName.split('.')
    if (parts.length < 2) {
      return ''
    }
    return parts[parts.length - 1].toLowerCase()
  }
}
