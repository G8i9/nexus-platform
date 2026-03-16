import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'

const RIVERS = [
  { name: 'Colorado River', status: 'critical', population: '40M', use: 'Agriculture · Municipal · Hydro' },
  { name: 'Mississippi River', status: 'normal', population: '18M', use: 'Agriculture · Industrial · Municipal' },
  { name: 'Missouri River', status: 'stressed', population: '10M', use: 'Agriculture · Municipal' },
  { name: 'Columbia River', status: 'normal', population: '8M', use: 'Hydroelectric · Agriculture' },
  { name: 'Rio Grande', status: 'critical', population: '6M', use: 'Agriculture · Municipal' },
]

const STATUS = {
  normal:   { color: '#22c55e', label: 'Normal Flow' },
  stressed: { color: '#f59e0b', label: 'Below Average' },
  critical: { color: '#ef4444', label: 'Critically Low' },
}

const LAYERS = [
  { label: 'Rivers',     on: true  },
  { label: 'Reservoirs', on: true  },
  { label: 'Power Grid', on: false },
]

export default function Home() {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const [sheet, setSheet]     = useState(null)   // selected river object
  const [sheetFull, setSheetFull] = useState(false)
  const [layers, setLayers]   = useState(LAYERS)

  useEffect(() => {
    if (mapRef.current) return

    // Dynamic import avoids SSR crash
    import('maplibre-gl').then((mod) => {
      const maplibregl = mod.default ?? mod

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        // OpenFreeMap — no API key, no account
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-98.5795, 39.8283],
        zoom: 3.8,
        attributionControl: false,
      })

      mapRef.current.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-left'
      )
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const toggleLayer = (i) => {
    setLayers(prev => prev.map((l, idx) =>
      idx === i ? { ...l, on: !l.on } : l
    ))
  }

  const openSheet = (river) => {
    setSheet(river)
    setSheetFull(false)
  }

  const closeSheet = () => {
    setSheet(null)
    setSheetFull(false)
  }

  return (
    <>
      <Head>
        <title>NEXUS — Infrastructure Terminal</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
        />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0a0f; overflow: hidden; }

          /* Dark navy filter over the liberty basemap */
          .maplibregl-canvas {
            filter: brightness(0.45) saturate(0.6) hue-rotate(195deg);
          }

          .sheet-enter {
            animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1);
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
          }
        `}</style>
      </Head>

      <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'monospace', color: 'white' }}>

        {/* ── MAP ── */}
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

        {/* ── NAVBAR ── */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px',
          background: 'rgba(8,10,18,0.82)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(96,165,250,0.15)',
        }}>
          <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '5px', color: '#e2e8f0' }}>
            NEXUS
          </span>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', letterSpacing: '1px' }}>
            <span style={{ color: '#60a5fa' }}>MAP</span>
            <span style={{ color: '#475569' }}>DATA</span>
          </div>
        </nav>

        {/* ── LAYER TOGGLES ── */}
        <div style={{
          position: 'absolute', top: '62px', right: '12px', zIndex: 100,
          background: 'rgba(10,14,26,0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(96,165,250,0.12)',
          borderRadius: '10px',
          padding: '12px 14px',
          minWidth: '160px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '2.5px', color: '#334155', marginBottom: '10px' }}>
            LAYERS
          </div>
          {layers.map((layer, i) => (
            <div
              key={layer.label}
              onClick={() => toggleLayer(i)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: i < layers.length - 1 ? '8px' : 0,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '12px', color: layer.on ? '#cbd5e1' : '#475569' }}>
                {layer.label}
              </span>
              <div style={{
                width: '34px', height: '18px', borderRadius: '9px',
                background: layer.on ? '#3b82f6' : '#1e293b',
                border: `1px solid ${layer.on ? '#60a5fa' : '#334155'}`,
                transition: 'all 0.2s',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: layer.on ? '16px' : '2px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: layer.on ? '#fff' : '#475569',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── DEMO RIVER BUTTONS (will be replaced by map taps in Phase 1) ── */}
        <div style={{
          position: 'absolute', top: '62px', left: '12px', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {RIVERS.map((r) => (
            <button
              key={r.name}
              onClick={() => openSheet(r)}
              style={{
                background: 'rgba(10,14,26,0.88)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${STATUS[r.status].color}44`,
                borderLeft: `3px solid ${STATUS[r.status].color}`,
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#cbd5e1',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '0.5px',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* ── BOTTOM SHEET ── */}
        {sheet && (
          <div
            className="sheet-enter"
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 200,
              height: sheetFull ? '88vh' : '44vh',
              background: 'rgba(8,12,22,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(96,165,250,0.15)',
              borderRadius: '16px 16px 0 0',
              transition: 'height 0.3s cubic-bezier(0.32,0.72,0,1)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Handle bar */}
            <div
              onClick={() => setSheetFull(f => !f)}
              style={{ padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#334155' }} />
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px 20px', overflowY: 'auto', flex: 1 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px', color: '#f1f5f9' }}>
                    {sheet.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '2px', marginTop: '2px' }}>
                    MAJOR RIVER · US WATER MODULE
                  </div>
                </div>
                <button
                  onClick={closeSheet}
                  style={{ background: 'none', border: 'none', color: '#475569', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Status Gauge */}
              <div style={{
                background: `${STATUS[sheet.status].color}11`,
                border: `1px solid ${STATUS[sheet.status].color}44`,
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: STATUS[sheet.status].color,
                  boxShadow: `0 0 8px ${STATUS[sheet.status].color}`,
                }} />
                <span style={{ fontSize: '12px', color: STATUS[sheet.status].color, letterSpacing: '1px' }}>
                  {STATUS[sheet.status].label.toUpperCase()}
                </span>
              </div>

              {/* Context Metric */}
              <div style={{
                fontSize: '13px', color: '#94a3b8', lineHeight: '1.6',
                marginBottom: '14px',
                padding: '10px 14px',
                background: 'rgba(96,165,250,0.05)',
                borderRadius: '8px',
                borderLeft: '2px solid #3b82f6',
              }}>
                Supplies water to <span style={{ color: '#60a5fa', fontWeight: 700 }}>{sheet.population} people</span> across multiple states
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                {['Primary Use', 'Module'].map((label, i) => (
                  <div key={label} style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}>
                    <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {i === 0 ? sheet.use.split(' · ')[0] : 'Water'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Uses */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', marginBottom: '8px' }}>PRIMARY USES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {sheet.use.split(' · ').map(u => (
                    <span key={u} style={{
                      fontSize: '11px', color: '#60a5fa',
                      background: 'rgba(96,165,250,0.08)',
                      border: '1px solid rgba(96,165,250,0.2)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                    }}>
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              {/* Advanced Tier Lock */}
              <div style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#ef4444', letterSpacing: '1px' }}>🔴 ADVANCED DATA</div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                    Water rights · Regulatory friction · 50yr trends
                  </div>
                </div>
                <span style={{ fontSize: '16px' }}>🔒</span>
              </div>

            </div>
          </div>
        )}

        {/* ── STATUS BAR ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: sheet ? 0 : 100,
          padding: '8px 20px',
          background: 'rgba(8,10,18,0.82)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(96,165,250,0.1)',
          fontSize: '9px', color: '#334155', letterSpacing: '1.5px',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>NEXUS v0.1 · PHASE 1</span>
          <span>US WATER MODULE</span>
        </div>

      </div>
    </div>
  )
}
