import { tokens } from '../styles/tokens'
import { Badge } from './Badge'
import type { DiagnosticsItem } from '../../core/domain/types'

interface DiagnosticsListProps {
  diagnostics: DiagnosticsItem[]
}

/**
 * Lista de diagnósticos (não tabela pesada)
 */
export function DiagnosticsList({ diagnostics }: DiagnosticsListProps) {
  if (diagnostics.length === 0) {
    return (
      <div className="diagnostics-empty">
        <p>Nenhum diagnóstico registrado.</p>
        <style>{diagnosticsCSS}</style>
      </div>
    )
  }

  const getSeverityBadge = (severity: DiagnosticsItem['severity']) => {
    const config: Record<
      DiagnosticsItem['severity'],
      { label: string; variant: 'success' | 'warning' | 'error' }
    > = {
      info: { label: 'Info', variant: 'success' },
      warn: { label: 'Aviso', variant: 'warning' },
      error: { label: 'Erro', variant: 'error' },
    }
    const { label, variant } = config[severity]
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="diagnostics-list">
      {diagnostics.map((diag, index) => (
        <div key={index} className="diagnostics-item">
          <div className="diagnostics-header">
            {getSeverityBadge(diag.severity)}
            <span className="diagnostics-code">{diag.code}</span>
          </div>
          <p className="diagnostics-message">{diag.message}</p>
        </div>
      ))}

      <style>{diagnosticsCSS}</style>
    </div>
  )
}

const diagnosticsCSS = `
  .diagnostics-list {
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacing.sm};
  }

  .diagnostics-item {
    padding: ${tokens.spacing.base};
    background-color: rgba(0, 0, 0, 0.01);
    border: 1px solid ${tokens.colors.surfaceBorder};
    border-radius: ${tokens.radius.md};
  }

  .diagnostics-header {
    display: flex;
    align-items: center;
    gap: ${tokens.spacing.md};
    margin-bottom: ${tokens.spacing.xs};
  }

  .diagnostics-code {
    font-family: ${tokens.typography.fontFamilyMono};
    font-size: ${tokens.typography.fontSize.xs};
    color: ${tokens.colors.textMuted};
  }

  .diagnostics-message {
    font-size: ${tokens.typography.fontSize.sm};
    color: ${tokens.colors.textSecondary};
    margin: 0;
    line-height: 1.5;
  }

  .diagnostics-empty {
    padding: ${tokens.spacing.xl};
    text-align: center;
    color: ${tokens.colors.textMuted};
  }
`
