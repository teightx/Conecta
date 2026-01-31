import { type ReactNode } from 'react'

type BannerVariant = 'warning' | 'info' | 'error'

interface InlineBannerProps {
  variant?: BannerVariant
  title?: string
  children: ReactNode
}

/**
 * Banner inline para avisos e informações
 * Suporta light/dark mode via CSS classes
 */
export function InlineBanner({
  variant = 'info',
  title,
  children,
}: InlineBannerProps) {
  return (
    <div className={`inline-banner inline-banner--${variant}`}>
      <span className="inline-banner-icon">
        {variant === 'warning' && <WarningIcon />}
        {variant === 'info' && <InfoIcon />}
        {variant === 'error' && <ErrorIcon />}
      </span>
      <div className="inline-banner-content">
        {title && (
          <strong className="inline-banner-title">
            {title}
          </strong>
        )}
        <span className="inline-banner-text">
          {children}
        </span>
      </div>

      <style>{bannerCSS}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const bannerCSS = `
  .inline-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    border-radius: var(--cc-radius-md);
    border: 1px solid;
  }

  .inline-banner--warning {
    background: var(--cc-warning-light);
    border-color: var(--cc-warning);
    border-color: rgba(217, 119, 6, 0.25);
    color: var(--cc-warning);
  }

  .inline-banner--info {
    background: var(--cc-info-light);
    border-color: var(--cc-info);
    border-color: rgba(8, 145, 178, 0.25);
    color: var(--cc-info);
  }

  .inline-banner--error {
    background: var(--cc-danger-light);
    border-color: var(--cc-danger);
    border-color: rgba(220, 38, 38, 0.25);
    color: var(--cc-danger);
  }

  .inline-banner-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  .inline-banner-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .inline-banner-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
  }

  .inline-banner-text {
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.9;
  }
`
