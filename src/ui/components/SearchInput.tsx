import { tokens } from '../styles/tokens'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Input de busca com ícone de lupa e botão de limpar
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: SearchInputProps) {
  return (
    <div className="search-input-wrapper">
      <SearchIcon />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          <ClearIcon />
        </button>
      )}

      <style>{searchInputCSS}</style>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={tokens.colors.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="search-icon"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const searchInputCSS = `
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 300px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 36px 10px 40px;
    font-size: ${tokens.typography.fontSize.sm};
    color: ${tokens.colors.textPrimary};
    background-color: ${tokens.colors.surface};
    border: 1px solid ${tokens.colors.surfaceBorder};
    border-radius: ${tokens.radius.md};
    transition: all ${tokens.transitions.fast};
  }

  .search-input::placeholder {
    color: ${tokens.colors.textMuted};
  }

  .search-input:focus {
    outline: none;
    border-color: ${tokens.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.15);
  }

  .search-clear {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    color: ${tokens.colors.textMuted};
    background: none;
    border: none;
    border-radius: ${tokens.radius.full};
    cursor: pointer;
    transition: all ${tokens.transitions.fast};
  }

  .search-clear:hover {
    color: ${tokens.colors.textSecondary};
    background-color: rgba(0, 0, 0, 0.05);
  }
`
