const TYPE_CONFIG = {
  numeric:  { label: 'NUM',      bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.25)'  },
  string:   { label: 'STR',      bg: 'rgba(167,139,250,0.12)', color: '#a78bfa',  border: 'rgba(167,139,250,0.25)' },
  boolean:  { label: 'BOOL',     bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24',  border: 'rgba(245,158,11,0.25)'  },
  datetime: { label: 'DATE',     bg: 'rgba(34,197,94,0.12)',   color: '#4ade80',  border: 'rgba(34,197,94,0.25)'   },
  unknown:  { label: '???',      bg: 'rgba(100,100,100,0.12)', color: '#6b7280',  border: 'rgba(100,100,100,0.25)' },
}

function TypeBadge({ dtype }) {
  const cfg = TYPE_CONFIG[dtype] || TYPE_CONFIG.unknown
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: '500',
      padding: '2px 7px',
      borderRadius: '4px',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      letterSpacing: '0.4px',
    }}>
      {cfg.label}
    </span>
  )
}

function NullBar({ pct }) {
  return (
    <div style={{
      width: '100%',
      height: '3px',
      background: '#1f2b42',
      borderRadius: '99px',
      marginTop: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${Math.min(pct, 100)}%`,
        height: '100%',
        background: pct > 20 ? '#ef4444' : pct > 5 ? '#f59e0b' : '#22c55e',
        borderRadius: '99px',
        transition: 'width 0.5s ease',
      }} />
    </div>
  )
}

export default function ColumnOverview({ columns }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '8px',
    }}>
      {columns.map(col => (
        <div key={col.name} style={{
          background: '#0e1422',
          border: '1px solid #1f2b42',
          borderRadius: '10px',
          padding: '12px 14px',
          transition: 'border-color 0.18s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2b42'}
        >
          {/* Column name */}
          <p style={{
            fontSize: '13px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: '500',
            color: '#e8edf5',
            marginBottom: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }} title={col.name}>
            {col.name}
          </p>

          {/* Type badge */}
          <TypeBadge dtype={col.dtype} />

          {/* Null & Unique counts */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif",
            color: '#7a8ba8',
          }}>
            <span>{col.null_count} null ({col.null_pct}%)</span>
            <span>{col.unique_count} uniq</span>
          </div>

          {/* Null fill bar */}
          <NullBar pct={col.null_pct} />
        </div>
      ))}
    </div>
  )
}
