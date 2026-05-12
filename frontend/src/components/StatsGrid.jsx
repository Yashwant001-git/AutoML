const cardStyle = {
  background: '#0e1422',
  border: '1px solid #1f2b42',
  borderRadius: '10px',
  padding: '16px 18px',
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: '#7a8ba8',
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: '6px',
}

const valueStyle = {
  fontSize: '26px',
  fontWeight: '500',
  fontFamily: "'IBM Plex Mono', monospace",
  lineHeight: 1,
  marginBottom: '4px',
}

const subStyle = {
  fontSize: '12px',
  color: '#3d4f6b',
  fontFamily: "'DM Sans', sans-serif",
}

function StatCard({ label, value, sub, color = '#e8edf5' }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color }}>{value}</div>
      <div style={subStyle}>{sub}</div>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  const nullColor = stats.total_null_count > 0 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '10px',
    }}>
      <StatCard
        label="Rows"
        value={stats.row_count.toLocaleString()}
        sub="observations"
      />
      <StatCard
        label="Columns"
        value={stats.col_count}
        sub="features"
      />
      <StatCard
        label="Numeric"
        value={stats.numeric_col_count}
        sub="columns"
        color="#60a5fa"
      />
      <StatCard
        label="Categorical"
        value={stats.categorical_col_count}
        sub="columns"
        color="#a78bfa"
      />
      <StatCard
        label="Missing"
        value={stats.total_null_count.toLocaleString()}
        sub={`${stats.total_null_pct}% of cells`}
        color={nullColor}
      />
      <StatCard
        label="Duplicates"
        value={stats.duplicate_row_count}
        sub="rows"
        color={stats.duplicate_row_count > 0 ? '#f59e0b' : '#22c55e'}
      />
      <StatCard
        label="Memory"
        value={stats.memory_kb < 1024
          ? `${stats.memory_kb} KB`
          : `${(stats.memory_kb / 1024).toFixed(1)} MB`}
        sub="in memory"
      />
    </div>
  )
}
