import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'cc_theme'

/**
 * Hook para gerenciar tema (light/dark)
 * - Persiste em localStorage
 * - Respeita prefers-color-scheme se não houver preferência salva
 * - Aplica data-theme no html
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // SSR safety
    if (typeof window === 'undefined') return 'light'
    
    // 1. Verificar localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    
    // 2. Verificar prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  // Aplicar tema no html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Ouvir mudanças no prefers-color-scheme (apenas se não houver preferência salva)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Só muda automaticamente se não houver preferência salva
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}
