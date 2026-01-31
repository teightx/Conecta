export interface KeyValueItem {
  label: string
  value: string | number | undefined
  icon?: 'bullet' | 'check' | 'arrow'
}

interface KeyValueListProps {
  items: KeyValueItem[]
  size?: 'sm' | 'md'
}

/**
 * Lista de chave-valor com ícone opcional
 * Suporta light/dark mode via CSS variables
 */
export function KeyValueList({ items, size = 'sm' }: KeyValueListProps) {
  const fontSize = size === 'sm' ? '12px' : '14px'

  return (
    <ul className="kv-list">
      {items.map((item, index) => (
        <li key={index} className="kv-item" style={{ fontSize }}>
          <span className="kv-icon">{getIcon(item.icon)}</span>
          <span className="kv-label">{item.label}:</span>
          <span className="kv-value">{item.value ?? '—'}</span>
        </li>
      ))}

      <style>{kvListCSS}</style>
    </ul>
  )
}

function getIcon(icon?: 'bullet' | 'check' | 'arrow'): string {
  switch (icon) {
    case 'check':
      return '✓'
    case 'arrow':
      return '→'
    case 'bullet':
    default:
      return '•'
  }
}

const kvListCSS = `
  .kv-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .kv-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--cc-text-secondary);
    line-height: 1.5;
  }

  .kv-icon {
    color: var(--cc-text-muted);
    font-size: 10px;
    width: 12px;
    text-align: center;
  }

  .kv-label {
    color: var(--cc-text-muted);
  }

  .kv-value {
    color: var(--cc-text);
    font-weight: 500;
  }
`
