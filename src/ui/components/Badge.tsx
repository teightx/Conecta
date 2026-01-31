import { type ReactNode } from 'react'

type BadgeVariant = 'success' | 'info' | 'warning' | 'neutral' | 'error'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

/**
 * Badge para indicar status
 * Suporta light/dark mode via CSS custom properties
 */
export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  const sizeStyles = sizes[size]

  return (
    <span className={`cc-badge cc-badge--${variant}`} style={sizeStyles}>
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// TAMANHOS
// ─────────────────────────────────────────────────────────────

const sizes: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    height: '20px',
    padding: '0 6px',
    fontSize: '11px',
  },
  md: {
    height: '24px',
    padding: '0 10px',
    fontSize: '12px',
  },
}

