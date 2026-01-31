import { useState, useEffect } from 'react'
import { Card } from '../components/Card'
import { FileUploadCard } from '../components/FileUploadCard'
import { InlineBanner } from '../components/InlineBanner'
import { ActionBar } from '../components/ActionBar'
import { Illustration } from '../components/Illustration'
import { BankParser } from '../../core/bank/BankParser'
import { PrefeituraExtractor } from '../../core/prefeitura/PrefeituraExtractor'
import type { KeyValueItem } from '../components/KeyValueList'
import type { BankParsedData, PrefeituraParsedData } from '../state/appState'

// ─────────────────────────────────────────────────────────────
// TIPOS DE ESTADO LOCAL
// ─────────────────────────────────────────────────────────────

interface BankStats {
  lines: number
  competencia?: string
  ok: boolean
  diagnosticsCount: number
}

interface PrefStats {
  extracted: number
  competencia?: string
  formato: string
  extracao: 'completa' | 'parcial' | 'falhou'
  diagnosticsCount: number
  isUnknownFormat: boolean
}

interface UploadScreenProps {
  onGenerate?: () => void
  onBankParsed?: (data: BankParsedData | null) => void
  onPrefParsed?: (data: PrefeituraParsedData | null) => void
  canGenerate?: boolean
}

/**
 * Tela 1 - Upload de arquivos
 * Layout 2 colunas com leitura real dos arquivos
 */
export function UploadScreen({
  onGenerate,
  onBankParsed,
  onPrefParsed,
  canGenerate: canGenerateProp,
}: UploadScreenProps) {
  // Arquivos
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [prefFile, setPrefFile] = useState<File | null>(null)

  // Stats após leitura
  const [bankStats, setBankStats] = useState<BankStats | null>(null)
  const [prefStats, setPrefStats] = useState<PrefStats | null>(null)

  // Loading
  const [bankLoading, setBankLoading] = useState(false)
  const [prefLoading, setPrefLoading] = useState(false)

  // Usar prop se fornecida, senão calcular localmente
  const canGenerate =
    canGenerateProp !== undefined
      ? canGenerateProp
      : bankStats?.ok && prefStats?.extracao !== 'falhou' && !prefStats?.isUnknownFormat

  // ─────────────────────────────────────────────────────────────
  // LEITURA DO BANCO (TXT)
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!bankFile) {
      setBankStats(null)
      onBankParsed?.(null)
      return
    }

    const parser = new BankParser()
    setBankLoading(true)

    parser
      .parse(bankFile)
      .then((result) => {
        const stats: BankStats = {
          lines: result.rows.length,
          competencia: result.competencia,
          ok: result.rows.length > 0,
          diagnosticsCount: result.diagnostics.length,
        }
        setBankStats(stats)

        // Passar dados completos para o App
        onBankParsed?.({
          rows: result.rows,
          diagnostics: result.diagnostics,
          competencia: result.competencia,
          lines: result.rows.length,
        })
      })
      .catch(() => {
        setBankStats({
          lines: 0,
          ok: false,
          diagnosticsCount: 1,
        })
        onBankParsed?.(null)
      })
      .finally(() => {
        setBankLoading(false)
      })
  }, [bankFile, onBankParsed])

  // ─────────────────────────────────────────────────────────────
  // LEITURA DA PREFEITURA
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!prefFile) {
      setPrefStats(null)
      onPrefParsed?.(null)
      return
    }

    const extractor = new PrefeituraExtractor()
    setPrefLoading(true)

    extractor
      .extract(prefFile)
      .then((result) => {
        let extracao: 'completa' | 'parcial' | 'falhou' = 'completa'
        const hasErrors = result.diagnostics.some((d) => d.severity === 'error')
        const isUnknownFormat = result.formato === 'unknown'

        if (result.rows.length === 0 || isUnknownFormat) {
          extracao = 'falhou'
        } else if (hasErrors) {
          extracao = 'parcial'
        }

        const formatoDisplay =
          result.formato === 'csv_report_v1'
            ? 'CSV'
            : result.formato === 'unknown'
            ? 'Desconhecido'
            : result.formato

        const stats: PrefStats = {
          extracted: result.rows.length,
          competencia: result.competencia,
          formato: formatoDisplay,
          extracao,
          diagnosticsCount: result.diagnostics.length,
          isUnknownFormat,
        }
        setPrefStats(stats)

        // Passar dados completos para o App
        onPrefParsed?.({
          rows: result.rows,
          diagnostics: result.diagnostics,
          competencia: result.competencia,
          formato: result.formato,
          extracted: result.rows.length,
          extracao,
        })
      })
      .catch(() => {
        setPrefStats({
          extracted: 0,
          formato: 'Erro',
          extracao: 'falhou',
          diagnosticsCount: 1,
          isUnknownFormat: true,
        })
        onPrefParsed?.(null)
      })
      .finally(() => {
        setPrefLoading(false)
      })
  }, [prefFile, onPrefParsed])

  // ─────────────────────────────────────────────────────────────
  // MÉTRICAS PARA OS CARDS
  // ─────────────────────────────────────────────────────────────

  const bankMetrics: KeyValueItem[] | undefined = bankStats
    ? [
        { label: 'Linhas lidas', value: bankStats.lines, icon: 'bullet' },
        {
          label: 'Competência detectada',
          value: bankStats.competencia,
          icon: 'bullet',
        },
      ]
    : undefined

  const prefMetrics: KeyValueItem[] | undefined = prefStats
    ? [
        { label: 'Linhas extraídas', value: prefStats.extracted, icon: 'bullet' },
        {
          label: 'Extração',
          value: prefStats.extracao,
          icon: 'bullet',
        },
      ]
    : undefined

  // ─────────────────────────────────────────────────────────────
  // HANDLER
  // ─────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    onGenerate?.()
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="upload-screen">
      {/* Header */}
      <header className="upload-header">
        <h1 className="upload-title">Validar consignados</h1>
        <p className="upload-subtitle">
          Envie o TXT do banco e o arquivo da prefeitura. Baixe um Excel com o
          resultado.
        </p>
      </header>

      {/* Grid principal */}
      <div className="upload-grid">
        {/* Coluna esquerda - Cards de upload */}
        <div className="upload-left">
          {/* Card 1: TXT do banco */}
          <FileUploadCard
            title="TXT do banco (obrigatório)"
            stepNumber={1}
            accept=".txt"
            hint="Arquivo de débito do banco"
            file={bankFile}
            onFile={setBankFile}
            loading={bankLoading}
            badge={
              bankStats
                ? bankStats.ok
                  ? { text: 'Lido com sucesso', variant: 'success' }
                  : { text: 'Erro na leitura', variant: 'error' }
                : undefined
            }
            metrics={bankMetrics}
            formatInfo={bankStats ? 'Formato: TXT fixo' : undefined}
          />

          {/* Card 2: Arquivo da prefeitura */}
          <FileUploadCard
            title="Arquivo da prefeitura (obrigatório)"
            stepNumber={2}
            accept=".csv,.xls,.xlsx,.pdf,.docx"
            hint="CSV, XLS, XLSX, PDF ou DOCX"
            file={prefFile}
            onFile={setPrefFile}
            loading={prefLoading}
            badge={
              prefStats
                ? prefStats.isUnknownFormat
                  ? { text: 'Formato não suportado', variant: 'error' }
                  : prefStats.extracao === 'falhou'
                  ? { text: 'Extração falhou', variant: 'error' }
                  : prefStats.extracao === 'parcial'
                  ? { text: `Formato: ${prefStats.formato}`, variant: 'warning' }
                  : { text: `Formato: ${prefStats.formato}`, variant: 'info' }
                : undefined
            }
            metrics={prefMetrics}
            formatInfo={
              prefStats?.competencia
                ? `Competência: ${prefStats.competencia}`
                : undefined
            }
            showPreviewLink={!!prefStats && !prefStats.isUnknownFormat}
          />

          {/* Banner de formato não suportado */}
          {prefStats?.isUnknownFormat && (
            <InlineBanner variant="warning" title="Formato não suportado">
              Por enquanto aceitamos apenas CSV. Converta o arquivo para CSV e
              tente novamente.
            </InlineBanner>
          )}
        </div>

        {/* Coluna direita - Informações */}
        <aside className="upload-right">
          {/* Como funciona */}
          <Card padding="md">
            <h3 className="upload-info-title">Como funciona</h3>
            <ul className="upload-bullet-list">
              <li>O TXT do banco é a referência.</li>
              <li>O arquivo da prefeitura pode variar.</li>
              <li>O sistema compara e gera um Excel para conferência.</li>
            </ul>
          </Card>

          {/* Você vai baixar */}
          <Card padding="md">
            <h3 className="upload-info-title">Você vai baixar</h3>
            <ul className="upload-download-list">
              <li>
                <CheckIcon /> Resumo
              </li>
              <li>
                <CheckIcon /> Bateu
              </li>
              <li>
                <CheckIcon /> Só no banco
              </li>
              <li>
                <CheckIcon /> Só na prefeitura
              </li>
              <li>
                <CheckIcon /> Divergências
              </li>
              <li>
                <CheckIcon /> Diagnósticos
              </li>
            </ul>
          </Card>

          {/* Ilustração */}
          <div className="upload-illustration">
            <Illustration name="upload" size="md" />
          </div>
        </aside>
      </div>

      {/* Action Bar sticky com CTA */}
      <ActionBar
        primaryLabel="Gerar relatório"
        onPrimary={handleGenerate}
        primaryDisabled={!canGenerate}
        helperText="Processamento local. Nada é enviado para servidor."
      />

      <style>{uploadScreenCSS}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cc-success)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: '8px', flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const uploadScreenCSS = `
  .upload-screen {
    width: 100%;
  }

  .upload-header {
    margin-bottom: 32px;
  }

  .upload-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--cc-text);
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .upload-subtitle {
    font-size: 16px;
    color: var(--cc-text-secondary);
    line-height: 1.6;
    max-width: 480px;
  }

  .upload-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 32px;
    align-items: start;
  }

  .upload-left {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .upload-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .upload-info-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--cc-text);
    margin-bottom: 12px;
  }

  .upload-bullet-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: var(--cc-text-secondary);
    line-height: 1.6;
  }

  .upload-bullet-list li::before {
    content: '→';
    margin-right: 8px;
    color: var(--cc-primary);
  }

  .upload-download-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: var(--cc-text-secondary);
  }

  .upload-download-list li {
    display: flex;
    align-items: center;
  }

  .upload-illustration {
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  /* Tablet */
  @media (max-width: 900px) {
    .upload-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .upload-right {
      order: 2;
    }
  }

  /* Mobile */
  @media (max-width: 640px) {
    .upload-header {
      margin-bottom: 24px;
    }

    .upload-title {
      font-size: 1.5rem;
    }

    .upload-subtitle {
      font-size: 14px;
    }

    .upload-grid {
      gap: 16px;
    }

    .upload-left {
      gap: 16px;
    }

    .upload-right {
      gap: 12px;
    }

    .upload-illustration {
      padding: 16px;
    }
  }
`
