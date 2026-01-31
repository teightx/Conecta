/**
 * Parser de valores monetários em formato brasileiro (pt-BR)
 * 
 * Aceita: "400,49", 400,49, 1.234,56, "1.234,56", 0,00, "0,00"
 */

/**
 * Converte string de valor monetário pt-BR para number
 * @param input Valor no formato brasileiro (ex: "1.234,56")
 * @returns Número ou null se inválido/vazio
 */
export function parseBRL(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Remover espaços
  let cleaned = input.trim()

  // Remover aspas (simples ou duplas)
  cleaned = cleaned.replace(/^["']|["']$/g, '')

  // Se ficou vazio, retornar null
  if (cleaned === '') {
    return null
  }

  // Remover separador de milhar (pontos)
  cleaned = cleaned.replace(/\./g, '')

  // Trocar vírgula decimal por ponto
  cleaned = cleaned.replace(',', '.')

  // Tentar converter para número
  const num = parseFloat(cleaned)

  // Validar se é número finito
  if (!Number.isFinite(num)) {
    return null
  }

  // Arredondar para 2 casas decimais para evitar problemas de ponto flutuante
  return Math.round(num * 100) / 100
}
