/**
 * ActionBar - Barra de ação sticky na parte inferior
 * 
 * Características:
 * - position: sticky (fica no fluxo, não sobrepõe conteúdo)
 * - backdrop-filter blur (Apple-style)
 * - safe-area para iOS (env(safe-area-inset-bottom))
 * - Botão com altura mínima de 44-48px (touch target iOS)
 */

interface ActionBarProps {
  /** Texto do botão principal */
  primaryLabel: string
  /** Callback do botão principal */
  onPrimary: () => void
  /** Desabilitar botão */
  primaryDisabled?: boolean
  /** Texto de ajuda abaixo do botão */
  helperText?: string
  /** Mostrar ícone de loading */
  loading?: boolean
}

export function ActionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  helperText,
  loading = false,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      <div className="action-bar__inner">
        <button
          type="button"
          className="action-bar__btn"
          onClick={onPrimary}
          disabled={primaryDisabled || loading}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Gerando...
            </>
          ) : (
            primaryLabel
          )}
        </button>
        
        {helperText && (
          <p className="action-bar__helper">
            <LockIcon />
            {helperText}
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  )
}
