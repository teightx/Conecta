import { useThemeContext } from '../theme/ThemeContext'

type IllustrationName = 'upload' | 'processing' | 'result'
type IllustrationSize = 'sm' | 'md' | 'lg'

interface IllustrationProps {
  name: IllustrationName
  size?: IllustrationSize
  className?: string
}

const sizeMap: Record<IllustrationSize, { width: number; height: number }> = {
  sm: { width: 120, height: 100 },
  md: { width: 180, height: 140 },
  lg: { width: 240, height: 180 },
}

/**
 * Componente de ilustração com fallback SVG inline
 * Escolhe automaticamente versão light/dark baseado no tema
 */
export function Illustration({ name, size = 'md', className }: IllustrationProps) {
  const { isDark } = useThemeContext()
  const dimensions = sizeMap[size]

  // Renderiza SVG inline como fallback (sempre funciona, sem dependência de arquivo)
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: 0.85,
      }}
    >
      {name === 'upload' && <UploadIllustration {...dimensions} isDark={isDark} />}
      {name === 'processing' && <ProcessingIllustration {...dimensions} isDark={isDark} />}
      {name === 'result' && <ResultIllustration {...dimensions} isDark={isDark} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ILUSTRAÇÕES SVG (inline, sem dependência externa)
// ─────────────────────────────────────────────────────────────

interface IllustrationSvgProps {
  width: number
  height: number
  isDark: boolean
}

function UploadIllustration({ width, height, isDark }: IllustrationSvgProps) {
  const colors = isDark ? {
    bg: '#1e293b',
    bgLight: '#334155',
    accent: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.3)',
    line: '#475569',
    check: '#10b981',
  } : {
    bg: '#e2e8f0',
    bgLight: '#f1f5f9',
    accent: '#2563eb',
    accentLight: 'rgba(37, 99, 235, 0.15)',
    line: '#cbd5e1',
    check: '#059669',
  }

  return (
    <svg width={width} height={height} viewBox="0 0 180 140" fill="none">
      {/* Document 1 */}
      <rect x="25" y="30" width="52" height="68" rx="6" fill={colors.bg} stroke={colors.line} strokeWidth="1.5" />
      <rect x="34" y="44" width="34" height="4" rx="2" fill={colors.line} />
      <rect x="34" y="54" width="28" height="4" rx="2" fill={colors.line} />
      <rect x="34" y="64" width="32" height="4" rx="2" fill={colors.line} />
      <rect x="34" y="74" width="20" height="4" rx="2" fill={colors.line} />
      
      {/* Document 2 */}
      <rect x="103" y="30" width="52" height="68" rx="6" fill={colors.bg} stroke={colors.line} strokeWidth="1.5" />
      <rect x="112" y="44" width="34" height="4" rx="2" fill={colors.line} />
      <rect x="112" y="54" width="28" height="4" rx="2" fill={colors.line} />
      <rect x="112" y="64" width="32" height="4" rx="2" fill={colors.line} />
      <rect x="112" y="74" width="20" height="4" rx="2" fill={colors.line} />
      
      {/* Arrow */}
      <path d="M82 64 L90 56 L90 60 L98 60 L98 68 L90 68 L90 72 Z" fill={colors.accent} opacity="0.8" />
      
      {/* Success circle */}
      <circle cx="90" cy="110" r="16" fill={colors.accentLight} />
      <path d="M82 110 L87 115 L98 104" stroke={colors.check} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Decorative dots */}
      <circle cx="30" cy="20" r="3" fill={colors.accent} opacity="0.4" />
      <circle cx="150" cy="25" r="4" fill={colors.accent} opacity="0.3" />
      <circle cx="160" cy="100" r="2" fill={colors.accent} opacity="0.2" />
    </svg>
  )
}

function ProcessingIllustration({ width, height, isDark }: IllustrationSvgProps) {
  const colors = isDark ? {
    bg: '#1e293b',
    bgLight: '#334155',
    accent: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.2)',
    line: '#475569',
    check: '#10b981',
    checkBg: 'rgba(16, 185, 129, 0.2)',
  } : {
    bg: '#e2e8f0',
    bgLight: '#f1f5f9',
    accent: '#2563eb',
    accentLight: 'rgba(37, 99, 235, 0.12)',
    line: '#cbd5e1',
    check: '#059669',
    checkBg: 'rgba(5, 150, 105, 0.12)',
  }

  return (
    <svg width={width} height={height} viewBox="0 0 200 150" fill="none">
      {/* Clipboard */}
      <rect x="55" y="20" width="90" height="110" rx="8" fill={colors.bg} stroke={colors.line} strokeWidth="1.5" />
      
      {/* Clip top */}
      <rect x="80" y="12" width="40" height="16" rx="4" fill={colors.bgLight} stroke={colors.line} strokeWidth="1" />
      <rect x="88" y="17" width="24" height="6" rx="2" fill={colors.line} />
      
      {/* Lines */}
      <rect x="70" y="42" width="60" height="5" rx="2.5" fill={colors.line} />
      <rect x="70" y="55" width="50" height="5" rx="2.5" fill={colors.line} />
      <rect x="70" y="68" width="55" height="5" rx="2.5" fill={colors.line} />
      <rect x="70" y="81" width="40" height="5" rx="2.5" fill={colors.line} />
      
      {/* Check circles */}
      <circle cx="75" cy="102" r="10" fill={colors.checkBg} />
      <path d="M70 102 L73 105 L80 98" stroke={colors.check} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      <circle cx="100" cy="102" r="10" fill={colors.checkBg} />
      <path d="M95 102 L98 105 L105 98" stroke={colors.check} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Spinner */}
      <circle cx="125" cy="102" r="9" stroke={colors.accentLight} strokeWidth="2" fill="none" />
      <path d="M125 93 a9 9 0 0 1 9 9" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 125 102" to="360 125 102" dur="1s" repeatCount="indefinite" />
      </path>
      
      {/* Decorative */}
      <circle cx="40" cy="40" r="4" fill={colors.accent} opacity="0.3" />
      <circle cx="165" cy="50" r="3" fill={colors.check} opacity="0.3" />
    </svg>
  )
}

function ResultIllustration({ width, height, isDark }: IllustrationSvgProps) {
  const colors = isDark ? {
    bg: '#1e293b',
    bgLight: '#334155',
    accent: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.2)',
    line: '#475569',
    check: '#10b981',
    checkBg: 'rgba(16, 185, 129, 0.25)',
    star: '#fbbf24',
  } : {
    bg: '#e2e8f0',
    bgLight: '#f1f5f9',
    accent: '#2563eb',
    accentLight: 'rgba(37, 99, 235, 0.12)',
    line: '#cbd5e1',
    check: '#059669',
    checkBg: 'rgba(5, 150, 105, 0.15)',
    star: '#f59e0b',
  }

  return (
    <svg width={width} height={height} viewBox="0 0 180 140" fill="none">
      {/* Document */}
      <rect x="45" y="15" width="90" height="105" rx="8" fill={colors.bg} stroke={colors.line} strokeWidth="1.5" />
      
      {/* Lines */}
      <rect x="60" y="32" width="60" height="5" rx="2.5" fill={colors.line} />
      <rect x="60" y="45" width="50" height="5" rx="2.5" fill={colors.line} />
      <rect x="60" y="58" width="55" height="5" rx="2.5" fill={colors.line} />
      <rect x="60" y="71" width="40" height="5" rx="2.5" fill={colors.line} />
      
      {/* Big success checkmark */}
      <circle cx="90" cy="98" r="20" fill={colors.checkBg} />
      <path d="M79 98 L86 105 L101 90" stroke={colors.check} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Stars/sparkles */}
      <path d="M35 45 L37 40 L39 45 L44 47 L39 49 L37 54 L35 49 L30 47 Z" fill={colors.star} opacity="0.6" />
      <path d="M145 35 L147 31 L149 35 L153 37 L149 39 L147 43 L145 39 L141 37 Z" fill={colors.star} opacity="0.5" />
      <circle cx="155" cy="90" r="3" fill={colors.accent} opacity="0.4" />
      <circle cx="25" cy="80" r="2" fill={colors.accent} opacity="0.3" />
    </svg>
  )
}
