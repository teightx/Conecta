import { describe, it, expect } from 'vitest'
import { parseBRL } from './parseBRL'
import { extractFromCsvReport } from './extractFromCsvReport'

// =============================================================================
// parseBRL
// =============================================================================

describe('parseBRL', () => {
  describe('valores válidos', () => {
    it('deve converter "400,49" para 400.49', () => {
      expect(parseBRL('400,49')).toBe(400.49)
    })

    it('deve converter "1.234,56" para 1234.56', () => {
      expect(parseBRL('1.234,56')).toBe(1234.56)
    })

    it('deve converter "0,00" para 0', () => {
      expect(parseBRL('0,00')).toBe(0)
    })

    it('deve remover aspas duplas', () => {
      expect(parseBRL('"400,49"')).toBe(400.49)
    })

    it('deve remover aspas simples', () => {
      expect(parseBRL("'1.234,56'")).toBe(1234.56)
    })

    it('deve converter valor grande "138.282,94"', () => {
      expect(parseBRL('138.282,94')).toBe(138282.94)
    })

    it('deve aceitar valor inteiro "100,00"', () => {
      expect(parseBRL('100,00')).toBe(100)
    })
  })

  describe('valores inválidos', () => {
    it('deve retornar null para string vazia', () => {
      expect(parseBRL('')).toBeNull()
    })

    it('deve retornar null para string com só espaços', () => {
      expect(parseBRL('   ')).toBeNull()
    })

    it('deve retornar null para texto não numérico', () => {
      expect(parseBRL('abc')).toBeNull()
    })

    it('deve retornar null para null/undefined simulado', () => {
      expect(parseBRL(null as unknown as string)).toBeNull()
      expect(parseBRL(undefined as unknown as string)).toBeNull()
    })
  })
})

// =============================================================================
// extractFromCsvReport
// =============================================================================

describe('extractFromCsvReport', () => {
  // CSV sintético para testes
  const csvSintetico = `
,,PREFEITURA MUNICIPAL DE TESTE,,,,,,,,,,Mês/Ano,
,,"RUA TESTE, 123",,,,,,,,,,,01/2026
,,CNPJ: 00.000.000/0001-00,,,,,,,,,,Folha Mensal,
Relação de Trabalhadores por Evento ,,,,,,,,,,,,,
Matrícula,Nome do Trabalhador,,,,,,,Referência,,Qtde.,,Valor,
Evento:  002 - CONSIGNADO BB,,,,,,,,,,,,,
85-1,REGINALDO RODRIGUES,,,,,,000.281.393-99,,1/0,"0,00",,"400,49",
85-1,REGINALDO RODRIGUES,,,,,,000.281.393-99,,1/0,"0,00",,"26,83",
Evento:  015 - CONSIGNADO CEF,,,,,,,,,,,,,
99-1,MARIA WILLANA,,,,,,000.709.903-79,,1/0,"0,00",,"1.234,56",
`

  describe('extração básica', () => {
    it('deve extrair 3 linhas de dados', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows).toHaveLength(3)
    })

    it('deve extrair matrícula corretamente', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].matricula).toBe('85-1')
      expect(result.rows[2].matricula).toBe('99-1')
    })

    it('deve extrair valor corretamente (último valor entre aspas)', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].valor).toBe(400.49)
      expect(result.rows[1].valor).toBe(26.83)
      expect(result.rows[2].valor).toBe(1234.56)
    })
  })

  describe('competência', () => {
    it('deve detectar competência do cabeçalho', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.competencia).toBe('01/2026')
    })

    it('deve preencher meta.competencia em cada linha', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].meta?.competencia).toBe('01/2026')
    })
  })

  describe('evento', () => {
    it('deve detectar evento e preencher meta.evento', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].meta?.evento).toBe('002')
      expect(result.rows[1].meta?.evento).toBe('002')
      expect(result.rows[2].meta?.evento).toBe('015')
    })
  })

  describe('source e confidence', () => {
    it('deve ter source = "prefeitura"', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].source).toBe('prefeitura')
    })

    it('deve ter confidence = "high"', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].meta?.confidence).toBe('high')
    })
  })

  describe('diagnósticos', () => {
    it('deve incluir diagnóstico de resumo', () => {
      const result = extractFromCsvReport(csvSintetico)
      const summary = result.diagnostics.find(
        (d) => d.code === 'prefeitura_csv_v1_summary'
      )
      expect(summary).toBeDefined()
      expect(summary?.severity).toBe('info')
    })

    it('deve contar eventos vistos', () => {
      const result = extractFromCsvReport(csvSintetico)
      const summary = result.diagnostics.find(
        (d) => d.code === 'prefeitura_csv_v1_summary'
      )
      expect(summary?.details?.eventosVistosCount).toBe(2)
    })

    it('deve retornar erro se nenhuma linha extraída', () => {
      const csvVazio = 'linha sem dados\noutra linha\n'
      const result = extractFromCsvReport(csvVazio)
      const failed = result.diagnostics.find(
        (d) => d.code === 'prefeitura_extraction_failed'
      )
      expect(failed).toBeDefined()
      expect(failed?.severity).toBe('error')
    })
  })

  describe('rawRef', () => {
    it('deve preencher rawRef.raw com a linha original', () => {
      const result = extractFromCsvReport(csvSintetico)
      expect(result.rows[0].rawRef?.raw).toContain('85-1')
      expect(result.rows[0].rawRef?.raw).toContain('REGINALDO')
    })
  })

  describe('competência formato compacto', () => {
    it('deve detectar competência no formato 012026', () => {
      const csv = `Competência: 012026\n85-1,TESTE,,,,,"100,00",`
      const result = extractFromCsvReport(csv)
      expect(result.competencia).toBe('01/2026')
    })
  })

  describe('linhas descartadas', () => {
    it('deve descartar linha sem valor entre aspas', () => {
      const csv = `01/2026\nEvento: 002\n85-1,TESTE,sem valor\n99-1,OK,,,"50,00",`
      const result = extractFromCsvReport(csv)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].matricula).toBe('99-1')
    })
  })
})
