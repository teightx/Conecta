import { useState, type ReactNode } from 'react'
import { useThemeContext } from '../theme/ThemeContext'

interface AppShellProps {
  children: ReactNode
}

/**
 * Layout base da aplicação
 * Topbar com toggle de tema + Container centralizado
 */
export function AppShell({ children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useThemeContext()

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar-inner">
          {/* Logo */}
          <div className="app-logo">
            <LogoIcon />
            <span className="app-logo-text">Conecta Consig</span>
          </div>

          {/* Desktop nav + theme toggle */}
          <div className="app-nav-desktop">
            <nav className="app-nav-links">
              <a href="#ajuda" className="app-nav-link">
                Ajuda
              </a>
              <a href="#privacidade" className="app-nav-link">
                Privacidade
              </a>
            </nav>
            
            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="app-mobile-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            
            <button
              className="app-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="app-mobile-menu">
          <a href="#ajuda" className="app-mobile-link">
            Ajuda
          </a>
          <a href="#privacidade" className="app-mobile-link">
            Privacidade
          </a>
        </div>
      )}

      {/* Main content */}
      <main className="app-main">{children}</main>

      <style>{appShellCSS}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cc-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function SunIcon() {
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
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const appShellCSS = `
  .app-shell {
    min-height: 100vh;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
    display: flex;
    flex-direction: column;
  }

  .app-topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--cc-surface-elevated);
    backdrop-filter: var(--cc-blur);
    -webkit-backdrop-filter: var(--cc-blur);
    border-bottom: 1px solid var(--cc-border);
    transition: background 300ms ease, border-color 300ms ease;
  }

  .app-topbar-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .app-logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--cc-text);
    letter-spacing: -0.02em;
  }

  .app-nav-desktop {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .app-nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .app-nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--cc-text-secondary);
    text-decoration: none;
    transition: color 150ms ease;
  }

  .app-nav-link:hover {
    color: var(--cc-primary);
  }

  .app-mobile-actions {
    display: none;
    align-items: center;
    gap: 8px;
  }

  .app-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--cc-text-secondary);
    border-radius: 8px;
    transition: background 150ms ease;
  }

  .app-menu-btn:hover {
    background: var(--cc-surface-2);
  }

  .app-mobile-menu {
    display: flex;
    flex-direction: column;
    padding: 8px 16px 16px;
    background: var(--cc-surface-elevated);
    border-bottom: 1px solid var(--cc-border);
    backdrop-filter: var(--cc-blur);
    -webkit-backdrop-filter: var(--cc-blur);
  }

  .app-mobile-link {
    padding: 12px 16px;
    font-size: 15px;
    color: var(--cc-text);
    text-decoration: none;
    border-radius: 8px;
    transition: background 150ms ease;
  }

  .app-mobile-link:hover {
    background: var(--cc-surface-2);
  }

  .app-main {
    flex: 1;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px;
    padding-bottom: calc(var(--action-bar-reserve, 104px) + env(safe-area-inset-bottom));
  }

  /* Mobile */
  @media (max-width: 768px) {
    .app-topbar-inner {
      padding: 10px 16px;
    }

    .app-logo-text {
      font-size: 14px;
    }

    .app-nav-desktop {
      display: none;
    }

    .app-mobile-actions {
      display: flex;
    }

    .app-main {
      padding: 24px 16px;
      padding-bottom: calc(var(--action-bar-reserve, 104px) + env(safe-area-inset-bottom));
    }
  }
`
