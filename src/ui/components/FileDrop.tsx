import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Button } from './Button'

interface FileDropProps {
  label: string
  hint?: string
  accept: string
  file: File | null
  onFile: (file: File | null) => void
}

/**
 * Dropzone para seleção de arquivo
 * Suporta light/dark mode via CSS classes
 */
export function FileDrop({ label, hint, accept, file, onFile }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptedExtensions = accept
    .split(',')
    .map((ext) => ext.trim().toLowerCase().replace('*', ''))

  const validateFile = (f: File): boolean => {
    const fileName = f.name.toLowerCase()
    const isValid = acceptedExtensions.some((ext) => fileName.endsWith(ext))
    if (!isValid) {
      setError(`Formato não aceito. Use: ${acceptedExtensions.join(', ')}`)
      return false
    }
    setError(null)
    return true
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      onFile(droppedFile)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile && validateFile(selectedFile)) {
      onFile(selectedFile)
    }
    e.target.value = ''
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleClear = () => {
    onFile(null)
    setError(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const dropzoneClass = `filedrop-zone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''} ${file ? 'has-file' : ''}`

  return (
    <div className="filedrop">
      <div className="filedrop-label">{label}</div>

      <div
        className={dropzoneClass}
        onClick={file ? undefined : handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {file ? (
          <div className="filedrop-file">
            <div className="filedrop-file-info">
              <FileIcon />
              <div className="filedrop-file-details">
                <span className="filedrop-file-name">{file.name}</span>
                <span className="filedrop-file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <Button variant="ghost" onClick={handleClear}>
              Trocar
            </Button>
          </div>
        ) : (
          <>
            <UploadIcon />
            <div className="filedrop-text">
              <strong>Clique para selecionar</strong> ou arraste o arquivo
            </div>
            {hint && <div className="filedrop-hint">{hint}</div>}
          </>
        )}
      </div>

      {error && <div className="filedrop-error">{error}</div>}

      <style>{fileDropCSS}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ÍCONES SVG
// ─────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cc-text-muted)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ margin: '0 auto' }}
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cc-primary)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

const fileDropCSS = `
  .filedrop {
    width: 100%;
  }

  .filedrop-label {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--cc-text);
  }

  .filedrop-zone {
    position: relative;
    padding: 32px;
    border-radius: var(--cc-radius-md);
    border: 2px dashed var(--cc-border-strong);
    background: var(--cc-surface-2);
    cursor: pointer;
    transition: all 200ms ease;
    text-align: center;
  }

  .filedrop-zone:hover {
    border-color: var(--cc-primary);
    background: var(--cc-primary-light);
  }

  .filedrop-zone.dragging {
    border-color: var(--cc-primary);
    background: var(--cc-primary-light);
  }

  .filedrop-zone.error {
    border-color: var(--cc-danger);
    background: var(--cc-danger-light);
  }

  .filedrop-zone.has-file {
    padding: 14px;
    cursor: default;
  }

  .filedrop-text {
    margin-top: 12px;
    font-size: 14px;
    color: var(--cc-text-secondary);
  }

  .filedrop-text strong {
    font-weight: 500;
    color: var(--cc-primary);
  }

  .filedrop-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--cc-text-muted);
  }

  .filedrop-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .filedrop-file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .filedrop-file-details {
    text-align: left;
    min-width: 0;
  }

  .filedrop-file-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--cc-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .filedrop-file-size {
    font-size: 12px;
    color: var(--cc-text-muted);
  }

  .filedrop-error {
    margin-top: 8px;
    font-size: 12px;
    color: var(--cc-danger);
  }
`
