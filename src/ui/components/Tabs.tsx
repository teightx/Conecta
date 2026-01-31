import { tokens } from '../styles/tokens'

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
 * Tabs com underline suave e scroll horizontal em mobile
 */
export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs-container">
      <div className="tabs-scroll">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <style>{tabsCSS}</style>
    </div>
  )
}

const tabsCSS = `
  .tabs-container {
    border-bottom: 1px solid ${tokens.colors.surfaceBorder};
    margin-bottom: ${tokens.spacing.lg};
  }

  .tabs-scroll {
    display: flex;
    gap: ${tokens.spacing.xs};
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 1px;
  }

  .tabs-scroll::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: ${tokens.spacing.xs};
    padding: ${tokens.spacing.md} ${tokens.spacing.base};
    font-size: ${tokens.typography.fontSize.sm};
    font-weight: ${tokens.typography.fontWeight.medium};
    color: ${tokens.colors.textMuted};
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all ${tokens.transitions.fast};
    margin-bottom: -1px;
  }

  .tab-item:hover {
    color: ${tokens.colors.textSecondary};
  }

  .tab-item.active {
    color: ${tokens.colors.primary};
    border-bottom-color: ${tokens.colors.primary};
  }

  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 18px;
    padding: 0 6px;
    font-size: ${tokens.typography.fontSize.xs};
    font-weight: ${tokens.typography.fontWeight.semibold};
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: ${tokens.radius.full};
  }

  .tab-item.active .tab-count {
    background-color: rgba(0, 102, 204, 0.1);
    color: ${tokens.colors.primary};
  }
`
