interface StatCardProps {
  title: string
  value: number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * Card de estatística com número grande
 * Suporta light/dark mode via CSS variables
 */
export function StatCard({ title, value, variant = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <span className="stat-card-value">
        {value.toLocaleString('pt-BR')}
      </span>
      <span className="stat-card-title">{title}</span>

      <style>{statCardCSS}</style>
    </div>
  )
}

const statCardCSS = `
  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    background: var(--cc-surface);
    border-radius: var(--cc-radius-lg);
    border: 1px solid var(--cc-border);
    box-shadow: var(--cc-shadow-glass);
    backdrop-filter: var(--cc-blur);
    -webkit-backdrop-filter: var(--cc-blur);
    text-align: center;
    min-width: 0;
    transition: all 200ms ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--cc-shadow-lg);
  }

  .stat-card-value {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  .stat-card-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--cc-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Variantes */
  .stat-card--default .stat-card-value {
    color: var(--cc-text);
  }

  .stat-card--success {
    border-color: var(--cc-success);
    border-color: rgba(5, 150, 105, 0.3);
  }
  .stat-card--success .stat-card-value {
    color: var(--cc-success);
  }

  .stat-card--warning {
    border-color: rgba(217, 119, 6, 0.3);
  }
  .stat-card--warning .stat-card-value {
    color: var(--cc-warning);
  }

  .stat-card--error {
    border-color: rgba(220, 38, 38, 0.3);
  }
  .stat-card--error .stat-card-value {
    color: var(--cc-danger);
  }

  .stat-card--info {
    border-color: rgba(8, 145, 178, 0.3);
  }
  .stat-card--info .stat-card-value {
    color: var(--cc-info);
  }

  @media (max-width: 640px) {
    .stat-card {
      padding: 16px 12px;
    }

    .stat-card-value {
      font-size: 1.375rem;
    }

    .stat-card-title {
      font-size: 10px;
    }
  }
`
