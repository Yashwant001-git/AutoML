import { useState } from 'react'
import './styles/global.css'
import { uploadDataset, deleteDataset } from './api/uploadApi'
import UploadZone    from './components/UploadZone'
import StatsGrid     from './components/StatsGrid'
import ColumnOverview from './components/ColumnOverview'
import PreviewTable  from './components/PreviewTable'

/* ── Shared layout helpers ────────────────────────────────── */
const sectionLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  color: '#3d4f6b',
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: '12px',
}

const divider = {
  flex: 1,
  height: '1px',
  background: '#1f2b42',
}

function SectionLabel({ icon, children }) {
  return (
    <div style={sectionLabel}>
      <span style={{ color: '#7a8ba8', fontSize: '14px' }}>{icon}</span>
      <span>{children}</span>
      <div style={divider} />
    </div>
  )
}

/* ── Loading spinner ──────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{
      width: '20px', height: '20px',
      border: '2px solid #1f2b42',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

/* ── Top navbar ───────────────────────────────────────────── */
function Navbar({ datasetName, onReset }) {
  return (
    <nav style={{
      height: '52px',
      borderBottom: '1px solid #1f2b42',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: '#080b14',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#e8edf5', fontFamily: "'DM Sans', sans-serif" }}>
          DataSci Platform
        </span>
        <span style={{
          fontSize: '10px',
          fontFamily: "'IBM Plex Mono', monospace",
          color: '#3b82f6',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          padding: '2px 7px',
          borderRadius: '4px',
        }}>
          PHASE 1
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {datasetName && (
          <span style={{
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#7a8ba8',
          }}>
            {datasetName}
          </span>
        )}
        {onReset && (
          <button
            onClick={onReset}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontFamily: "'DM Sans', sans-serif",
              border: '1px solid #1f2b42',
              borderRadius: '6px',
              background: 'transparent',
              color: '#7a8ba8',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.color = '#fca5a5'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#7a8ba8'
              e.currentTarget.style.borderColor = '#1f2b42'
            }}
          >
            ✕ Reset
          </button>
        )}
      </div>
    </nav>
  )
}

/* ── File info bar ────────────────────────────────────────── */
function FileInfoBar({ fileName, fileSizeKb, datasetId }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '10px 14px',
      background: '#0e1422',
      border: '1px solid #1f2b42',
      borderRadius: '10px',
      marginBottom: '20px',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#e8edf5' }}>
        {fileName}
      </span>
      <span style={{ fontSize: '12px', color: '#7a8ba8', fontFamily: "'DM Sans', sans-serif" }}>
        {fileSizeKb < 1024
          ? `${fileSizeKb} KB`
          : `${(fileSizeKb / 1024).toFixed(1)} MB`}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{
        fontSize: '11px',
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#3d4f6b',
      }}>
        ID: {datasetId.slice(0, 8)}…
      </span>
      <div style={{
        width: '8px', height: '8px',
        borderRadius: '50%',
        background: '#22c55e',
        boxShadow: '0 0 6px rgba(34,197,94,0.6)',
        animation: 'pulse 2s ease-in-out infinite',
      }} />
    </div>
  )
}

/* ── Main App ─────────────────────────────────────────────── */
export default function App() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleUpload = async (file) => {
    setLoading(true)
    setError('')
    try {
      const data = await uploadDataset(file)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Upload failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (result?.dataset_id) {
      try { await deleteDataset(result.dataset_id) } catch (_) {}
    }
    setResult(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080b14' }}>
      <Navbar
        datasetName={result?.file_name}
        onReset={result ? handleReset : undefined}
      />

      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 28px 60px',
        opacity: 1,
      }}>

        {/* ── Page title ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '500',
            fontFamily: "'DM Sans', sans-serif",
            color: '#e8edf5',
            marginBottom: '6px',
          }}>
            Dataset Upload &amp; Preview
          </h1>
          <p style={{ fontSize: '14px', color: '#7a8ba8', fontFamily: "'DM Sans', sans-serif" }}>
            Upload a CSV file to inspect its structure, column types, and summary statistics.
          </p>
        </div>

        {/* ── Upload zone or results ── */}
        {!result ? (
          <>
            {loading ? (
              <div style={{
                border: '1px solid #1f2b42',
                borderRadius: '14px',
                padding: '3rem',
                textAlign: 'center',
                background: '#0e1422',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <Spinner />
                  <span style={{ fontSize: '14px', color: '#7a8ba8', fontFamily: "'DM Sans', sans-serif" }}>
                    Parsing your dataset…
                  </span>
                </div>
              </div>
            ) : (
              <UploadZone onUpload={handleUpload} loading={loading} />
            )}

            {error && (
              <div style={{
                marginTop: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
                fontSize: '13px',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ⚠ {error}
              </div>
            )}
          </>
        ) : (
          <div style={{ opacity: 1 }}>

            {/* File info */}
            <FileInfoBar
              fileName={result.file_name}
              fileSizeKb={result.file_size_kb}
              datasetId={result.dataset_id}
            />

            {/* Stats */}
            <SectionLabel icon="▦">Dataset statistics</SectionLabel>
            <div style={{ marginBottom: '28px' }}>
              <StatsGrid stats={result.stats} />
            </div>

            {/* Columns */}
            <SectionLabel icon="⊞">Column overview — {result.columns.length} columns</SectionLabel>
            <div style={{ marginBottom: '28px' }}>
              <ColumnOverview columns={result.columns} />
            </div>

            {/* Preview */}
            <SectionLabel icon="▤">Data preview — first {result.preview.length} rows</SectionLabel>
            <PreviewTable
              preview={result.preview}
              columns={result.columns}
            />

          </div>
        )}
      </main>
    </div>
  )
}