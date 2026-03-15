export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #1a1a2e',
        background: '#0d0d1a'
      }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px' }}>
          NEXUS
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: '#60a5fa' }}>Map</span>
          <span style={{ color: '#6b7280' }}>Data</span>
        </div>
      </nav>

      <div style={{
        position: 'relative',
        height: 'calc(100vh - 57px)',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#374151' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺</div>
          <div style={{ fontSize: '14px', letterSpacing: '2px' }}>
            MAP CANVAS — PHASE 1
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '180px'
        }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#6b7280',
            marginBottom: '12px'
          }}>
            LAYERS
          </div>
          {['Rivers', 'Reservoirs', 'Power Grid'].map((layer, i) => (
            <div key={layer} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '14px' }}>{layer}</span>
              <div style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                background: i < 2 ? '#3b82f6' : '#374151',
                cursor: 'pointer'
              }} />
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '12px 24px',
          background: '#0d1117',
          borderTop: '1px solid #1a1a2e',
          fontSize: '11px',
          color: '#6b7280',
          letterSpacing: '1px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>NEXUS v0.1 — PHASE 0 COMPLETE ✓</span>
          <span>US WATER MODULE</span>
        </div>
      </div>
    </div>
  )
}
