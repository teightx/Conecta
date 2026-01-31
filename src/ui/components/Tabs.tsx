export interface TabItem {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

/**
 * Tabs como Segmented Control (Apple-style)
 * Suporta light/dark mode via CSS variables
 */
export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="segmented-control">
      <div className="segmented-scroll">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`segmented-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="segmented-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="segmented-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <style>{tabsCSS}</style>
    </div>
  )
}

const tabsCSS = `
  .segmented-control {
    margin-bottom: 20px;
  }

  .segmented-scroll {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    background: var(--cc-surface-2);
    border: 1px solid var(--cc-border);
    border-radius: var(--cc-radius-md);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    max-width: 100%;
  }

  .segmented-scroll::-webkit-scrollbar {
    display: none;
  }

  .segmented-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 500;
    color: var(--cc-text-secondary);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 150ms ease;
  }

  .segmented-item:hover:not(.active) {
    color: var(--cc-text);
    background: var(--cc-surface);
  }

  .segmented-item.active {
    color: var(--cc-text);
    background: var(--cc-surface-solid);
    box-shadow: var(--cc-shadow-sm);
  }

  .segmented-label {
    line-height: 1.2;
  }

  .segmented-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    background: var(--cc-border);
    border-radius: 9px;
    line-height: 1;
  }

  .segmented-item.active .segmented-count {
    background: var(--cc-primary-light);
    color: var(--cc-primary);
  }

  /* Mobile: scroll horizontal com fade */
  @media (max-width: 640px) {
    .segmented-scroll {
      display: flex;
      width: 100%;
    }
    
    .segmented-item {
      padding: 8px 12px;
      font-size: 13px;
    }
    
    .segmented-count {
      font-size: 10px;
      min-width: 16px;
      height: 16px;
    }
  }
`
