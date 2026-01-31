interface ProgressBarProps {
  percent: number
  showLabel?: boolean
}

/**
 * Barra de progresso horizontal
 * Suporta light/dark mode via CSS variables
 */
export function ProgressBar({ percent, showLabel = true }: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent))

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">{Math.round(clampedPercent)}%</span>
      )}

      <style>{progressBarCSS}</style>
    </div>
  )
}

const progressBarCSS = `
  .progress-bar-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .progress-bar-track {
    flex: 1;
    height: 8px;
    background: var(--cc-surface-2);
    border: 1px solid var(--cc-border);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cc-primary) 0%, var(--cc-primary-hover) 100%);
    border-radius: 4px;
    transition: width 300ms ease-out;
  }

  .progress-bar-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--cc-text);
    min-width: 40px;
    text-align: right;
  }
`
