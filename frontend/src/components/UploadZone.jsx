import { useState, useRef } from 'react'

const styles = {
  zone: {
    border: '1.5px dashed #1f2b42',
    borderRadius: '14px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    background: '#0e1422',
    position: 'relative',
    overflow: 'hidden',
  },
  zoneActive: {
    borderColor: '#3b82f6',
    background: 'rgba(59,130,246,0.06)',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  heading: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#e8edf5',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '13px',
    color: '#7a8ba8',
    marginBottom: '1.5rem',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: '500',
    border: '1px solid #1f2b42',
    borderRadius: '8px',
    background: '#151c2e',
    color: '#e8edf5',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  note: {
    fontSize: '12px',
    color: '#3d4f6b',
    marginTop: '1rem',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  error: {
    marginTop: '1rem',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontSize: '13px',
  },
}

export default function UploadZone({ onUpload, loading }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState('')
  const inputRef                = useRef()

  const handleFile = (file) => {
    setError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported. Please choose a .csv file.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds the 50 MB limit.')
      return
    }
    onUpload(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const zoneStyle = {
    ...styles.zone,
    ...(dragging ? styles.zoneActive : {}),
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
  }

  return (
    <div
      style={zoneStyle}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !loading && inputRef.current.click()}
    >
      {/* Grid decoration */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div style={styles.iconWrap}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <p style={styles.heading}>Drop your CSV file here</p>
      <p style={styles.sub}>or click to browse from your computer</p>

      <button
        style={styles.btn}
        onMouseEnter={e => e.currentTarget.style.background = '#1a2338'}
        onMouseLeave={e => e.currentTarget.style.background = '#151c2e'}
        onClick={e => { e.stopPropagation(); !loading && inputRef.current.click() }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        Choose file
      </button>

      <p style={styles.note}>CSV · max 50 MB</p>

      {error && <div style={styles.error}>{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
