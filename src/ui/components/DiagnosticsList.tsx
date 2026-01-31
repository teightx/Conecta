import { Badge } from './Badge'
import type { DiagnosticsItem } from '../../core/domain/types'

interface DiagnosticsListProps {
  diagnostics: DiagnosticsItem[]
}

/**
 * Lista de diagnósticos
 * Suporta light/dark mode via CSS variables
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
    gap: 8px;
  }

  .diagnostics-item {
    padding: 14px;
    background: var(--cc-surface-2);
    border: 1px solid var(--cc-border);
    border-radius: var(--cc-radius-md);
  }

  .diagnostics-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  .diagnostics-code {
    font-family: var(--cc-font-mono);
    font-size: 11px;
    color: var(--cc-text-muted);
  }

  .diagnostics-message {
    font-size: 14px;
    color: var(--cc-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .diagnostics-empty {
    padding: 32px;
    text-align: center;
    color: var(--cc-text-muted);
  }
`
