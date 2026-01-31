import { tokens } from '../styles/tokens'

interface StatCardProps {
  title: string
  value: number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * Card de estatística com número grande
 */
export function StatCard({ title, value, variant = 'default' }: StatCardProps) {
  const colors = variantColors[variant]

  return (
    <div className="stat-card" style={{ borderColor: colors.border }}>
      <span className="stat-card-value" style={{ color: colors.value }}>
        {value.toLocaleString('pt-BR')}
      </span>
      <span className="stat-card-title">{title}</span>

      <style>{statCardCSS}</style>
    </div>
  )
}

const variantColors: Record<
  string,
  { value: string; border: string }
> = {
  default: {
    value: tokens.colors.textPrimary,
    border: tokens.colors.surfaceBorder,
  },
  success: {
    value: '#1a7f37',
    border: 'rgba(46, 160, 67, 0.3)',
  },
  warning: {
    value: '#9a6700',
    border: 'rgba(212, 167, 44, 0.3)',
  },
  error: {
    value: '#cf222e',
    border: 'rgba(255, 59, 48, 0.3)',
  },
  info: {
    value: '#0550ae',
    border: 'rgba(9, 105, 218, 0.3)',
  },
}

const statCardCSS = `
  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${tokens.spacing.lg} ${tokens.spacing.base};
    background-color: ${tokens.colors.surface};
    border-radius: ${tokens.radius.lg};
    border: 1px solid;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    text-align: center;
    min-width: 120px;
  }

  .stat-card-value {
    font-size: 2rem;
    font-weight: ${tokens.typography.fontWeight.bold};
    line-height: 1.1;
    margin-bottom: ${tokens.spacing.xs};
  }

  .stat-card-title {
    font-size: ${tokens.typography.fontSize.xs};
    font-weight: ${tokens.typography.fontWeight.medium};
    color: ${tokens.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  @media (max-width: 640px) {
    .stat-card {
      padding: ${tokens.spacing.base} ${tokens.spacing.sm};
    }

    .stat-card-value {
      font-size: 1.5rem;
    }
  }
`
