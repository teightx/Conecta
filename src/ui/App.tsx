import { useState, useEffect, useCallback } from 'react'
import { AppShell } from './layout/AppShell'
import { UploadScreen } from './screens/UploadScreen'
import {
  ProcessingScreen,
  type ProcessingProgress,
  type ProcessingDetails,
} from './screens/ProcessingScreen'
import { ResultScreen } from './screens/ResultScreen'
import type { StepItem } from './components/StepList'
import type { ReconciliationResult } from '../core/domain/types'

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type Screen = 'upload' | 'processing' | 'result'

interface UploadData {
  bankLines: number
  prefFormat: string
  prefExtracted: number
  showPartialWarning: boolean
}

// ─────────────────────────────────────────────────────────────
// MOCK RESULT
// ─────────────────────────────────────────────────────────────

function createMockResult(data: UploadData): ReconciliationResult {
  // Gerar itens mockados baseados nos dados reais
  const mockItems = [
    { matricula: '85-1', valorBanco: 450.00, valorPrefeitura: 450.00, status: 'bateu' as const },
    { matricula: '99-1', valorBanco: 320.50, valorPrefeitura: 320.50, status: 'bateu' as const },
    { matricula: '102-1', valorBanco: 580.00, valorPrefeitura: 580.00, status: 'bateu' as const },
    { matricula: '156-1', valorBanco: 275.25, valorPrefeitura: 275.25, status: 'bateu' as const },
    { matricula: '201-1', valorBanco: 890.00, valorPrefeitura: 890.00, status: 'bateu' as const },
    { matricula: '45-1', valorBanco: 400.49, status: 'so_no_banco' as const, obs: 'Não encontrado na prefeitura' },
    { matricula: '78-1', valorBanco: 250.00, status: 'so_no_banco' as const, obs: 'Não encontrado na prefeitura' },
    { matricula: '312-1', valorPrefeitura: 180.00, status: 'so_na_prefeitura' as const, obs: 'Não encontrado no banco' },
    { matricula: '145-1', valorBanco: 500.00, valorPrefeitura: 495.00, status: 'divergente' as const, obs: 'Diferença: R$ 5,00' },
    { matricula: '189-1', valorBanco: 720.00, valorPrefeitura: 720.50, status: 'divergente' as const, obs: 'Diferença: R$ -0,50' },
  ]

  const counts = {
    bateu: mockItems.filter(i => i.status === 'bateu').length,
    so_no_banco: mockItems.filter(i => i.status === 'so_no_banco').length,
    so_na_prefeitura: mockItems.filter(i => i.status === 'so_na_prefeitura').length,
    divergente: mockItems.filter(i => i.status === 'divergente').length,
    diagnostico: 0,
  }

  const total = counts.bateu + counts.so_no_banco + counts.so_na_prefeitura + counts.divergente

  return {
    summary: {
      competencia: '01/2026',
      extracao: data.showPartialWarning ? 'parcial' : 'completa',
      counts,
      taxaMatch: total > 0 ? (counts.bateu / total) * 100 : 0,
    },
    items: mockItems,
    diagnostics: [
      {
        severity: 'info',
        code: 'BANK_PARSE_SUMMARY',
        message: `Processadas ${data.bankLines} linhas do banco`,
        details: { totalLines: data.bankLines },
      },
      {
        severity: 'info',
        code: 'PREFEITURA_SUMMARY',
        message: `Extraídos ${data.prefExtracted} registros da prefeitura (${data.prefFormat})`,
        details: { extracted: data.prefExtracted, format: data.prefFormat },
      },
      {
        severity: 'info',
        code: 'RECONCILE_SUMMARY',
        message: `Reconciliação concluída: ${counts.bateu} bateram, ${counts.divergente} divergentes`,
        details: counts,
      },
    ],
  }
}

// ─────────────────────────────────────────────────────────────
// STEPS DO PROCESSAMENTO
// ─────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Lendo TXT do banco',
  'Extraindo dados da prefeitura',
  'Normalizando matrículas e valores',
  'Comparando resultados',
  'Gerando Excel para download',
]

function getSteps(currentStep: number): StepItem[] {
  return STEP_LABELS.map((label, index) => ({
    label,
    state:
      index < currentStep
        ? 'done'
        : index === currentStep
        ? 'active'
        : 'pending',
  }))
}

function getStepMessage(currentStep: number): string {
  if (currentStep < 2) return 'Lendo arquivos...'
  if (currentStep < 3) return 'Normalizando dados...'
  if (currentStep < 4) return 'Comparação em andamento…'
  return 'Gerando Excel...'
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────

function App() {
  const [screen, setScreen] = useState<Screen>('upload')
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [mockResult, setMockResult] = useState<ReconciliationResult | null>(null)

  // Progresso simulado
  const [percent, setPercent] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  // Handler do botão "Gerar relatório"
  const handleGenerate = useCallback(
    (data: {
      bankLines: number
      prefFormat: string
      prefExtracted: number
      showPartialWarning: boolean
    }) => {
      setUploadData(data)
      setPercent(0)
      setCurrentStep(0)
      setScreen('processing')
    },
    []
  )

  // Voltar para upload
  const handleBack = useCallback(() => {
    setScreen('upload')
    setPercent(0)
    setCurrentStep(0)
    setMockResult(null)
  }, [])

  // Download (mock por enquanto)
  const handleDownload = useCallback(() => {
    alert('Download do Excel será implementado quando o pipeline real estiver conectado.')
  }, [])

  // Simular progresso
  useEffect(() => {
    if (screen !== 'processing') return

    const interval = setInterval(() => {
      setPercent((prev) => {
        const newPercent = prev + Math.random() * 8 + 2

        if (newPercent >= 100) {
          clearInterval(interval)
          // Transição para tela de resultado
          if (uploadData) {
            setMockResult(createMockResult(uploadData))
            setScreen('result')
          }
          return 100
        }

        return newPercent
      })

      setCurrentStep(() => {
        if (percent < 20) return 0
        if (percent < 40) return 1
        if (percent < 60) return 2
        if (percent < 80) return 3
        return 4
      })
    }, 600)

    return () => clearInterval(interval)
  }, [screen, percent, uploadData])

  // Dados do progresso
  const progress: ProcessingProgress = {
    percent: Math.min(percent, 100),
    currentStep,
    steps: getSteps(currentStep),
  }

  const details: ProcessingDetails = uploadData
    ? {
        bankLines: uploadData.bankLines,
        prefFormat: uploadData.prefFormat,
        prefExtracted: uploadData.prefExtracted,
        message: getStepMessage(currentStep),
      }
    : {}

  return (
    <AppShell>
      {screen === 'upload' && <UploadScreen onGenerate={handleGenerate} />}
      {screen === 'processing' && (
        <ProcessingScreen
          progress={progress}
          details={details}
          showPartialWarning={uploadData?.showPartialWarning}
          onCancel={handleBack}
          onBack={handleBack}
        />
      )}
      {screen === 'result' && mockResult && (
        <ResultScreen
          result={mockResult}
          onNewUpload={handleBack}
          onDownload={handleDownload}
          canDownload={true}
        />
      )}
    </AppShell>
  )
}

export default App
