import { Badge } from './Badge'
import type { ReconciliationItem } from '../../core/domain/types'

interface MobileResultListProps {
  items: ReconciliationItem[]
}

/**
 * Lista de resultados para mobile (cards compactos)
 * Suporta light/dark mode via CSS variables
 */
export function MobileResultList({ items }: MobileResultListProps) {
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
      <div className="mobile-result-empty">
        <p>Nenhum item encontrado.</p>
        <style>{mobileListCSS}</style>
      </div>
    )
  }

  return (
    <div className="mobile-result-list">
      {items.map((item, index) => (
        <div key={`${item.matricula}-${index}`} className="mobile-result-card">
          <div className="mobile-result-header">
            {getStatusBadge(item.status)}
            <span className="mobile-result-matricula">{item.matricula}</span>
          </div>
          {(item.nome || item.cpf) && (
            <div className="mobile-result-info">
              {item.nome && <span className="mobile-result-name">{item.nome}</span>}
              {item.cpf && <span className="mobile-result-cpf">{item.cpf}</span>}
            </div>
          )}
          <div className="mobile-result-values">
            <div className="mobile-result-value">
              <span className="mobile-result-label">Banco</span>
              <span className="mobile-result-amount">
                {formatMoney(item.valorBanco)}
              </span>
            </div>
            <div className="mobile-result-value">
              <span className="mobile-result-label">Prefeitura</span>
              <span className="mobile-result-amount">
                {formatMoney(item.valorPrefeitura)}
              </span>
            </div>
          </div>
          {item.obs && <p className="mobile-result-obs">{item.obs}</p>}
        </div>
      ))}

      <style>{mobileListCSS}</style>
    </div>
  )
}

const mobileListCSS = `
  .mobile-result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mobile-result-card {
    padding: 14px;
    background: var(--cc-surface);
    border: 1px solid var(--cc-border);
    border-radius: var(--cc-radius-md);
    box-shadow: var(--cc-shadow-sm);
    backdrop-filter: var(--cc-blur);
    -webkit-backdrop-filter: var(--cc-blur);
  }

  .mobile-result-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .mobile-result-matricula {
    font-family: var(--cc-font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--cc-text);
  }

  .mobile-result-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--cc-border);
  }

  .mobile-result-name {
    font-size: 13px;
    color: var(--cc-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-result-cpf {
    font-family: var(--cc-font-mono);
    font-size: 12px;
    color: var(--cc-text-muted);
  }

  .mobile-result-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 4px;
  }

  .mobile-result-value {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .mobile-result-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--cc-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .mobile-result-amount {
    font-family: var(--cc-font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--cc-text);
  }

  .mobile-result-obs {
    font-size: 12px;
    color: var(--cc-text-muted);
    margin: 0;
    padding-top: 10px;
    border-top: 1px solid var(--cc-border);
    line-height: 1.4;
  }

  .mobile-result-empty {
    padding: 40px 20px;
    text-align: center;
    color: var(--cc-text-muted);
    font-size: 14px;
  }
`
