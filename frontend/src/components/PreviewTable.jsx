const TYPE_COLORS = {
  numeric:  '#60a5fa',
  string:   '#a78bfa',
  boolean:  '#fbbf24',
  datetime: '#4ade80',
  unknown:  '#6b7280',
}

function NullCell() {
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: "'IBM Plex Mono', monospace",
      color: '#3d4f6b',
      fontStyle: 'italic',
    }}>
      null
    </span>
  )
}

export default function PreviewTable({ preview, columns }) {
  if (!preview?.length) return null

  const colNames = Object.keys(preview[0])

  // Build a map of col name → dtype from column info
  const typeMap = {}
  columns.forEach(c => { typeMap[c.name] = c.dtype })

  return (
    <div style={{
      overflowX: 'auto',
      border: '1px solid #1f2b42',
      borderRadius: '12px',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <thead>
          <tr style={{ background: '#0e1422' }}>
            {/* Row index header */}
            <th style={{
              padding: '10px 14px',
              textAlign: 'right',
              fontSize: '11px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: '500',
              color: '#3d4f6b',
              borderBottom: '1px solid #1f2b42',
              width: '48px',
              whiteSpace: 'nowrap',
            }}>
              #
            </th>

            {colNames.map(col => (
              <th key={col} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontWeight: '500',
                color: '#7a8ba8',
                borderBottom: '1px solid #1f2b42',
                whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
              }}>
                <span>{col}</span>
                {typeMap[col] && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '10px',
                    color: TYPE_COLORS[typeMap[col]] || '#6b7280',
                    fontFamily: "'IBM Plex Mono', monospace",
                    opacity: 0.8,
                  }}>
                    {typeMap[col].slice(0, 3).toUpperCase()}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {preview.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: i < preview.length - 1 ? '1px solid #1a2338' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0e1422'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Row index */}
              <td style={{
                padding: '8px 14px',
                textAlign: 'right',
                color: '#3d4f6b',
                fontSize: '11px',
                userSelect: 'none',
              }}>
                {i + 1}
              </td>

              {colNames.map(col => (
                <td key={col} style={{
                  padding: '8px 14px',
                  color: row[col] === null || row[col] === undefined || row[col] === ''
                    ? '#3d4f6b'
                    : '#c8d5e8',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row[col] === null || row[col] === undefined || row[col] === ''
                    ? <NullCell />
                    : String(row[col])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
