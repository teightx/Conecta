import { Badge } from './Badge'
import type { ReconciliationItem } from '../../core/domain/types'

interface ResultTableProps {
  items: ReconciliationItem[]
}

/**
 * Tabela de resultados para desktop
 * Suporta light/dark mode via CSS variables
 */
export function ResultTable({ items }: ResultTableProps) {
  const formatMoney = (value?: number) => {
    if (value === undefined) return '—'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const getStatusBadge = (status: ReconciliationItem['status']) => {
    const config: Record<
      ReconciliationItem['status'],
      { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }
    > = {
      bateu: { label: 'Bateu', variant: 'success' },
      so_no_banco: { label: 'Só banco', variant: 'error' },
      so_na_prefeitura: { label: 'Só prefeitura', variant: 'warning' },
      divergente: { label: 'Divergência', variant: 'info' },
      diagnostico: { label: 'Diagnóstico', variant: 'neutral' },
    }
    const { label, variant } = config[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  if (items.length === 0) {
    return (
      <div className="result-table-empty">
        <p>Nenhum item encontrado.</p>
        <style>{tableCSS}</style>
      </div>
    )
  }

  return (
    <div className="result-table-wrapper">
      <table className="result-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Matrícula</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Banco (R$)</th>
            <th>Prefeitura (R$)</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.matricula}-${index}`}>
              <td>{getStatusBadge(item.status)}</td>
              <td className="result-table-mono">{item.matricula}</td>
              <td className="result-table-name">{item.nome || '—'}</td>
              <td className="result-table-cpf">{item.cpf || '—'}</td>
              <td className="result-table-money">{formatMoney(item.valorBanco)}</td>
              <td className="result-table-money">{formatMoney(item.valorPrefeitura)}</td>
              <td className="result-table-obs">{item.obs || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{tableCSS}</style>
    </div>
  )
}

const tableCSS = `
  .result-table-wrapper {
    overflow-x: auto;
    border-radius: var(--cc-radius-md);
  }

  .result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .result-table th {
    padding: 12px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--cc-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--cc-surface-2);
    border-bottom: 1px solid var(--cc-border);
    white-space: nowrap;
  }

  .result-table td {
    padding: 12px 14px;
    color: var(--cc-text);
    border-bottom: 1px solid var(--cc-border);
    vertical-align: middle;
  }

  .result-table tbody tr {
    transition: background-color 100ms ease;
  }

  .result-table tbody tr:hover {
    background: var(--cc-primary-light);
  }

  .result-table tbody tr:last-child td {
    border-bottom: none;
  }

  .result-table-mono {
    font-family: var(--cc-font-mono);
    font-size: 12px;
    font-weight: 500;
  }

  .result-table-money {
    font-family: var(--cc-font-mono);
    font-size: 12px;
    font-weight: 500;
    text-align: right;
    white-space: nowrap;
  }

  .result-table-name {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-table-cpf {
    font-family: var(--cc-font-mono);
    font-size: 12px;
    white-space: nowrap;
    color: var(--cc-text-secondary);
  }

  .result-table-obs {
    font-size: 12px;
    color: var(--cc-text-muted);
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-table-empty {
    padding: 48px 24px;
    text-align: center;
    color: var(--cc-text-muted);
    font-size: 14px;
  }
`
