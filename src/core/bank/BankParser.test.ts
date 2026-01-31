import { describe, it, expect } from 'vitest'
import { parseBankLine } from './parseLine'

describe('parseBankLine', () => {
  describe('linha válida', () => {
    it('deve extrair matrícula corretamente', () => {
      // Linha real: matrícula 85-1, evento 2, competência 01/2026, valor 400.49
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row).toBeDefined()
      expect(result.row?.matricula).toBe('85-1')
      expect(result.diag).toBeUndefined()
    })

    it('deve extrair valor corretamente (centavos -> reais)', () => {
      // valor = 0040049 centavos = 400.49 reais
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row?.valor).toBe(400.49)
    })

    it('deve extrair competência no formato MM/AAAA', () => {
      // competência = 012026 -> 01/2026
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row?.meta?.competencia).toBe('01/2026')
    })

    it('deve extrair evento como string numérica', () => {
      // evento = 0000000002 -> "2"
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row?.meta?.evento).toBe('2')
    })

    it('deve preencher rawRef com lineNo e raw', () => {
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 42)

      expect(result.row?.rawRef?.lineNo).toBe(42)
      expect(result.row?.rawRef?.raw).toBe(line)
    })

    it('deve ter source = "banco"', () => {
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row?.source).toBe('banco')
    })

    it('deve ter confidence = "high"', () => {
      const line =
        '2000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 1)

      expect(result.row?.meta?.confidence).toBe('high')
    })
  })

  describe('matrícula com sufixo diferente', () => {
    it('deve extrair matrícula 278-1 corretamente', () => {
      // Matrícula completa: 000000027801
      const line =
        '2000000003000000027800000000027801000000001501202600157000900550000000004'
      const result = parseBankLine(line, 3)

      expect(result.row?.matricula).toBe('278-1')
    })

    it('deve extrair matrícula com sufixo 2', () => {
      // Matrícula completa: 000000040302 -> 403-2
      const line =
        '2000000019000000040300000000040302000000000201202600425840720700000000020'
      const result = parseBankLine(line, 19)

      expect(result.row?.matricula).toBe('403-2')
    })
  })

  describe('header', () => {
    it('deve retornar diag info para header (tipo 1)', () => {
      const line = '118012026DEBITOS'
      const result = parseBankLine(line, 1)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeDefined()
      expect(result.diag?.severity).toBe('info')
      expect(result.diag?.code).toBe('BANK_HEADER')
    })
  })

  describe('linha curta', () => {
    it('deve retornar erro para linha muito curta', () => {
      const line = '2000000001000000008500000000' // muito curta
      const result = parseBankLine(line, 5)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeDefined()
      expect(result.diag?.severity).toBe('error')
      expect(result.diag?.code).toBe('BANK_LINE_TOO_SHORT')
    })
  })

  describe('linha vazia', () => {
    it('deve ignorar linha vazia silenciosamente', () => {
      const result = parseBankLine('', 10)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeUndefined()
    })

    it('deve ignorar linha só com espaços', () => {
      const result = parseBankLine('   \t  ', 10)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeUndefined()
    })
  })

  describe('tipo desconhecido', () => {
    it('deve retornar warn para tipo desconhecido', () => {
      const line = '9000000001000000008500000000008501000000000201202600400490720120000000001'
      const result = parseBankLine(line, 7)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeDefined()
      expect(result.diag?.severity).toBe('warn')
      expect(result.diag?.code).toBe('BANK_UNKNOWN_LINE_TYPE')
    })
  })

  describe('matrícula inválida', () => {
    it('deve retornar erro para matrícula não numérica', () => {
      // Substituindo parte da matrícula por letras
      const line =
        '2000000001000000008500000000ABCD01000000000201202600400490720120000000001'
      const result = parseBankLine(line, 8)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeDefined()
      expect(result.diag?.severity).toBe('error')
      expect(result.diag?.code).toBe('BANK_INVALID_MATRICULA')
    })
  })

  describe('valor inválido', () => {
    it('deve retornar erro para valor não numérico', () => {
      // Substituindo valor por letras
      const line =
        '200000000100000000850000000000850100000000020120260ABCDEFG0720120000000001'
      const result = parseBankLine(line, 9)

      expect(result.row).toBeUndefined()
      expect(result.diag).toBeDefined()
      expect(result.diag?.severity).toBe('error')
      expect(result.diag?.code).toBe('BANK_INVALID_VALOR')
    })
  })
})
