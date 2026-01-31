import { useState, useMemo } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { StatCard } from '../components/StatCard'
import { Tabs, type TabItem } from '../components/Tabs'
import { SearchInput } from '../components/SearchInput'
import { ResultTable } from '../components/ResultTable'
import { MobileResultList } from '../components/MobileResultList'
import { DiagnosticsList } from '../components/DiagnosticsList'
import { Illustration } from '../components/Illustration'
import type { ReconciliationResult } from '../../core/domain/types'

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

interface ResultScreenProps {
  result: ReconciliationResult
  onNewUpload: () => void
  onDownload: () => void
  canDownload: boolean
}

type TabId = 'todos' | 'bateu' | 'so_no_banco' | 'so_na_prefeitura' | 'divergente' | 'diagnosticos'

/**
 * Tela 3 - Resultado da validação
 */
export function ResultScreen({
  result,
  onNewUpload,
  onDownload,
  canDownload,
}: ResultScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('todos')
  const [query, setQuery] = useState('')

  const { summary, items, diagnostics } = result

  // ─────────────────────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────────────────────

  const tabs: TabItem[] = [
    { id: 'todos', label: 'Todos', count: items.length },
    { id: 'bateu', label: 'Bateu', count: summary.counts.bateu },
    { id: 'so_no_banco', label: 'Só banco', count: summary.counts.so_no_banco },
    { id: 'so_na_prefeitura', label: 'Só prefeitura', count: summary.counts.so_na_prefeitura },
    { id: 'divergente', label: 'Divergências', count: summary.counts.divergente },
    { id: 'diagnosticos', label: 'Diagnósticos', count: diagnostics.length },
  ]

  // ─────────────────────────────────────────────────────────────
  // FILTRO
  // ─────────────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    let filtered = items

    // Filtrar por tab
    if (activeTab !== 'todos' && activeTab !== 'diagnosticos') {
      filtered = filtered.filter((item) => item.status === activeTab)
    }

    // Filtrar por busca (matrícula, nome ou CPF)
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter((item) =>
        item.matricula.toLowerCase().includes(q) ||
        (item.nome && item.nome.toLowerCase().includes(q)) ||
        (item.cpf && item.cpf.includes(q))
      )
    }

    return filtered
  }, [items, activeTab, query])

  // ─────────────────────────────────────────────────────────────
  // RESUMO RÁPIDO
  // ─────────────────────────────────────────────────────────────

  const quickSummary = useMemo(() => {
    const reasons: string[] = []

    if (summary.counts.divergente > 0) {
      reasons.push('Valores divergentes entre banco e prefeitura')
    }
    if (summary.counts.so_no_banco > 0) {
      reasons.push('Itens do banco ausentes na prefeitura')
    }
    if (summary.counts.so_na_prefeitura > 0) {
      reasons.push('Itens da prefeitura ausentes no banco')
    }
    if (diagnostics.some((d) => d.severity === 'warn' || d.severity === 'error')) {
      reasons.push('Extração parcial ou formato variável')
    }

    return reasons.slice(0, 3)
  }, [summary.counts, diagnostics])

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="result-screen">
      {/* Header com ações */}
      <header className="result-header">
        <div className="result-header-left">
          <h1 className="result-title">Resultado da validação</h1>
          <p className="result-subtitle">
            Conferência pronta para download em Excel.
          </p>
          <div className="result-chips">
            {summary.competencia && (
              <Badge variant="info">Competência: {summary.competencia}</Badge>
            )}
            <Badge
              variant={
                summary.extracao === 'completa'
                  ? 'success'
                  : summary.extracao === 'parcial'
                  ? 'warning'
                  : 'error'
              }
            >
              Extração: {summary.extracao}
            </Badge>
          </div>
        </div>
        <div className="result-header-actions">
          <Button variant="secondary" onClick={onNewUpload}>
            Novo upload
          </Button>
          <Button
            variant="primary"
            onClick={onDownload}
            disabled={!canDownload}
          >
            Baixar Excel
          </Button>
        </div>
      </header>

      {/* Cards de contagem */}
      <div className="result-stats">
        <StatCard title="Bateu" value={summary.counts.bateu} variant="success" />
        <StatCard title="Só banco" value={summary.counts.so_no_banco} variant="error" />
        <StatCard title="Só prefeitura" value={summary.counts.so_na_prefeitura} variant="warning" />
        <StatCard title="Divergências" value={summary.counts.divergente} variant="info" />
      </div>

      {/* Grid principal */}
      <div className="result-grid">
        {/* Coluna esquerda - Tabela */}
        <div className="result-main">
          <Card>
            {/* Search + Tabs */}
            <div className="result-toolbar">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Buscar matrícula"
              />
            </div>

            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as TabId)}
            />

            {/* Conteúdo */}
            <div className="result-content">
              {activeTab === 'diagnosticos' ? (
                <DiagnosticsList diagnostics={diagnostics} />
              ) : (
                <>
                  {/* Desktop: tabela */}
                  <div className="result-table-desktop">
                    <ResultTable items={filteredItems} />
                  </div>
                  {/* Mobile: lista */}
                  <div className="result-table-mobile">
                    <MobileResultList items={filteredItems} />
                  </div>
                </>
              )}
            </div>

            {/* CTA inferior */}
            <div className="result-cta">
              <Button
                variant="primary"
                onClick={onDownload}
                disabled={!canDownload}
                style={{ width: '100%', maxWidth: '320px' }}
              >
                Baixar Excel
              </Button>
            </div>
          </Card>
        </div>

        {/* Coluna direita - Resumo */}
        <aside className="result-aside">
          <Card padding="md">
            <h3 className="result-aside-title">Resumo rápido</h3>
            <div className="result-aside-stat">
              <span className="result-aside-label">Taxa de match</span>
              <span className="result-aside-value">
                {summary.taxaMatch?.toFixed(1) || 0}%
              </span>
            </div>

            {quickSummary.length > 0 && (
              <>
                <h4 className="result-aside-subtitle">
                  Principais motivos de problema:
                </h4>
                <ul className="result-aside-list">
                  {quickSummary.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Ilustração */}
          <div className="result-illustration">
            <Illustration name="result" size="md" />
          </div>
        </aside>
      </div>

      <style>{resultCSS}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ILUSTRAÇÃO
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const resultCSS = `
  .result-screen {
    width: 100%;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .result-header-left {
    flex: 1;
    min-width: 280px;
  }

  .result-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--cc-text);
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .result-subtitle {
    font-size: 15px;
    color: var(--cc-text-secondary);
    margin-bottom: 12px;
  }

  .result-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .result-header-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }

  .result-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .result-grid {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 28px;
    align-items: start;
  }

  .result-main {
    min-width: 0;
  }

  .result-toolbar {
    margin-bottom: 16px;
  }

  .result-content {
    margin-bottom: 24px;
    max-height: 480px;
    overflow-y: auto;
    border-radius: var(--cc-radius-md);
  }

  .result-table-desktop {
    display: block;
  }

  .result-table-mobile {
    display: none;
  }

  .result-cta {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid var(--cc-border);
  }

  .result-aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .result-aside-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--cc-text);
    margin-bottom: 12px;
  }

  .result-aside-stat {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 14px 16px;
    background: var(--cc-primary-light);
    border: 1px solid var(--cc-primary);
    border-color: rgba(37, 99, 235, 0.15);
    border-radius: var(--cc-radius-md);
    margin-bottom: 16px;
  }

  .result-aside-label {
    font-size: 13px;
    color: var(--cc-text-secondary);
  }

  .result-aside-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--cc-primary);
    letter-spacing: -0.02em;
  }

  .result-aside-subtitle {
    font-size: 11px;
    font-weight: 600;
    color: var(--cc-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }

  .result-aside-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: var(--cc-text-secondary);
    line-height: 1.5;
  }

  .result-aside-list li::before {
    content: '•';
    margin-right: 8px;
    color: #ef4444;
  }

  .result-illustration {
    display: flex;
    justify-content: center;
    padding: 16px;
  }

  /* Tablet */
  @media (max-width: 900px) {
    .result-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .result-aside {
      order: 2;
    }

    .result-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile */
  @media (max-width: 640px) {
    .result-header {
      flex-direction: column;
      gap: 16px;
    }

    .result-header-actions {
      width: 100%;
      flex-direction: column;
      gap: 8px;
    }

    .result-header-actions button {
      width: 100%;
    }

    .result-title {
      font-size: 1.375rem;
    }

    .result-subtitle {
      font-size: 14px;
    }

    .result-stats {
      gap: 8px;
    }

    .result-table-desktop {
      display: none;
    }

    .result-table-mobile {
      display: block;
    }

    .result-illustration {
      display: none;
    }

    .result-content {
      max-height: none;
    }
  }
`
