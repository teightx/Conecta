import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
}

/**
 * Botão base reutilizável
 * Usa CSS variables para suporte a light/dark mode
 */
export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`cc-btn cc-btn--${variant} ${className}`}
      disabled={isDisabled}
      style={style}
      {...props}
    >
      {loading && <Spinner />}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
      
      <style>{buttonCSS}</style>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        marginRight: '8px',
        animation: 'cc-spin 1s linear infinite',
      }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const buttonCSS = `
  @keyframes cc-spin {
    to { transform: rotate(360deg); }
  }

  .cc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    line-height: 1.2;
    border-radius: var(--cc-radius-lg);
    border: none;
    cursor: pointer;
    transition: all 200ms ease;
    white-space: nowrap;
  }

  .cc-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cc-btn--primary {
    background: var(--cc-primary);
    color: var(--cc-text-inverse);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .cc-btn--primary:hover:not(:disabled) {
    background: var(--cc-primary-hover);
  }

  .cc-btn--secondary {
    background: var(--cc-surface);
    color: var(--cc-text);
    border: 1px solid var(--cc-border);
    box-shadow: var(--cc-shadow-sm);
  }

  .cc-btn--secondary:hover:not(:disabled) {
    background: var(--cc-surface-2);
    border-color: var(--cc-border-strong);
  }

  .cc-btn--ghost {
    background: transparent;
    color: var(--cc-primary);
  }

  .cc-btn--ghost:hover:not(:disabled) {
    background: var(--cc-primary-light);
  }
`
