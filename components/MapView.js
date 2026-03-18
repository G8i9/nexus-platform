import { useEffect, useRef, useState } from 'react'

const RIVERS = [
  {
    id: 'colorado',
    name: 'Colorado River',
    status: 'critical',
    population: '40M',
    use: 'Agriculture · Municipal · Hydro',
    length: '1,450 mi',
    states: '7 states + Mexico',
    context: 'The only water source for 1 in 8 Americans — and it no longer reaches the sea.',
  },
  {
    id: 'mississippi',
    name: 'Mississippi River',
    status: 'normal',
    population: '18M',
    use: 'Agriculture · Industrial · Municipal',
    length: '2,340 mi',
    states: '10 states',
    context: 'Drains 41% of the continental US and carries 92M tons of cargo annually.',
  },
  {
    id: 'missouri',
    name: 'Missouri River',
    status: 'stressed',
    population: '10M',
    use: 'Agriculture · Municipal',
    length: '2,341 mi',
    states: '7 states',
    context: 'The longest US river — its upper basin snowpack is declining 2% per decade.',
  },
  {
    id: 'columbia',
    name: 'Columbia River',
    status: 'normal',
    population: '8M',
    use: 'Hydroelectric · Agriculture · Municipal',
    length: '1,243 mi',
    states: 'WA · OR · ID',
    context: 'Generates more hydroelectric power than any other North American river.',
  },
  {
    id: 'riogrand',
    name: 'Rio Grande',
    status: 'critical',
    population: '6M',
    use: 'Agriculture · Municipal',
    length: '1,896 mi',
    states: 'CO · NM · TX · Mexico',
    context: 'Declared legally dead at its mouth in 2001. Flow reaches the Gulf only in wet years.',
  },
]

const STATUS = {
  normal:   { color: '#22c55e', label: 'Normal Flow' },
  stressed: { color: '#f59e0b', label: 'Below Average' },
  critical: { color: '#ef4444', label: 'Critically Low' },
}

const RIVER_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'colorado', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-105.8, 40.4], [-107.2, 39.6], [-108.9, 38.8],
          [-110.2, 38.3], [-111.3, 37.2], [-112.3, 36.6],
          [-113.6, 36.2], [-114.4, 35.3], [-114.7, 34.5],
          [-114.5, 33.6], [-113.6, 32.7], [-112.2, 32.0],
          [-110.8, 31.5],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'mississippi', color: '#22c55e' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-95.2, 47.2], [-94.6, 46.1], [-92.6, 44.9],
          [-91.5, 43.6], [-91.2, 42.5], [-90.5, 41.4],
          [-90.2, 40.3], [-89.8, 38.7], [-89.5, 37.1],
          [-89.3, 35.6], [-90.1, 34.1], [-90.5, 32.5],
          [-91.0, 31.1], [-89.9, 29.2],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'missouri', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-111.5, 45.9], [-110.9, 46.5], [-109.6, 47.1],
          [-107.2, 47.9], [-104.6, 47.6], [-102.1, 47.1],
          [-99.6, 46.5], [-97.6, 46.1], [-96.1, 45.9],
          [-96.6, 44.6], [-96.1, 43.6], [-95.6, 42.6],
          [-95.6, 41.5], [-95.8, 40.5], [-95.5, 39.1],
          [-94.9, 38.6], [-93.6, 38.7], [-92.5, 38.6],
          [-91.9, 38.8], [-90.4, 38.6],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'columbia', color: '#22c55e' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-115.8, 49.0], [-117.1, 48.5], [-118.1, 48.5],
          [-118.6, 47.9], [-119.1, 47.3], [-119.6, 46.6],
          [-120.1, 46.1], [-120.6, 45.9], [-121.1, 45.7],
          [-122.1, 45.6], [-123.1, 46.2], [-123.9, 46.2],
          [-124.1, 46.2],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'riogrand', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-107.0, 37.6], [-106.6, 36.6], [-106.6, 35.6],
          [-106.7, 34.6], [-106.5, 33.6], [-106.4, 32.6],
          [-106.4, 31.9], [-106.5, 31.7], [-106.4, 31.5],
          [-106.1, 30.6], [-104.6, 29.6], [-103.1, 29.1],
          [-101.6, 29.8], [-99.5, 27.6], [-97.6, 26.1],
        ],
      },
    },
  ],
}

const LAYERS_DEFAULT = [
  { label: 'Rivers',     on: true  },
  { label: 'Reservoirs', on: true  },
  { label: 'Power Grid', on: false },
]

export default function MapView() {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const [sheet, setSheet]         = useState(null)
  const [sheetFull, setSheetFull] = useState(false)
  const [layers, setLayers]       = useState(LAYERS_DEFAULT)
  const [mapReady, setMapReady]   = useState(false)

  useEffect(() => {
    if (mapRef.current) return

    import('maplibre-gl').then((mod) => {
      const maplibregl = mod.default ?? mod

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-96.0, 38.5],
        zoom: 3.4,
        attributionControl: false,
      })

      mapRef.current = map

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-left'
      )

      map.on('load', () => {
        map.addSource('rivers', {
          type: 'geojson',
          data: RIVER_GEOJSON,
        })

        map.addLayer({
          id: 'rivers-glow',
          type: 'line',
          source: 'rivers',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 12,
            'line-opacity': 0.15,
            'line-blur': 6,
          },
        })

        map.addLayer({
          id: 'rivers-core',
          type: 'line',
          source: 'rivers',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2.5,
            'line-opacity': 1.0,
          },
        })

        map.addLayer({
          id: 'rivers-hit',
          type: 'line',
          source: 'rivers',
          paint: {
            'line-color': '#ffffff',
            'line-width': 20,
            'line-opacity': 0,
          },
        })

        map.on('click', 'rivers-hit', (e) => {
          const props = e.features[0].properties
          const river = RIVERS.find(r => r.id === props.id)
          if (river) { setSheet(river); setSheetFull(false) }
        })

        map.on('mouseenter', 'rivers-hit', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'rivers-hit', () => {
          map.getCanvas().style.cursor = ''
        })

        setMapReady(true)
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const toggleLayer = (i) =>
    setLayers(prev => prev.map((l, idx) => idx === i ? { ...l, on: !l.on } : l))

  const closeSheet = () => { setSheet(null); setSheetFull(false) }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; overflow: hidden; }
        .maplibregl-canvas {
          filter: brightness(0.38) saturate(0.5) hue-rotate(200deg);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .sheet-enter { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{
        height: '100vh', width: '100vw',
        position: 'relative', fontFamily: 'monospace', color: 'white',
      }}>

        <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

        {/* NAVBAR */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 18px',
          background: 'rgba(6,8,16,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(96,165,250,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '6px', color: '#e2e8f0' }}>
              NEXUS
            </span>
            <span style={{
              fontSize: '8px', letterSpacing: '2px', color: '#3b82f6',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '4px', padding: '2px 6px',
            }}>WATER MODULE</span>
          </div>
          <div style={{ display: 'flex', gap: '18px', fontSize: '11px', letterSpacing: '1.5px' }}>
            <span style={{ color: '#60a5fa' }}>MAP</span>
            <span style={{ color: '#334155' }}>DATA</span>
          </div>
        </nav>

        {/* LAYER TOGGLES */}
        <div style={{
          position: 'absolute', top: '58px', right: '12px', zIndex: 100,
          background: 'rgba(6,10,20,0.90)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(96,165,250,0.1)',
          borderRadius: '10px', padding: '11px 13px', minWidth: '155px',
        }}>
          <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#1e3a5f', marginBottom: '10px' }}>
            LAYERS
          </div>
          {layers.map((layer, i) => (
            <div key={layer.label} onClick={() => toggleLayer(i)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: i < layers.length - 1 ? '8px' : 0, cursor: 'pointer',
            }}>
              <span style={{ fontSize: '11px', color: layer.on ? '#94a3b8' : '#334155' }}>
                {layer.label}
              </span>
              <div style={{
                width: '32px', height: '17px', borderRadius: '9px',
                background: layer.on ? '#1d4ed8' : '#0f172a',
                border: `1px solid ${layer.on ? '#3b82f6' : '#1e293b'}`,
                position: 'relative', transition: 'all 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: layer.on ? '14px' : '2px',
                  width: '11px', height: '11px', borderRadius: '50%',
                  background: layer.on ? '#60a5fa' : '#334155',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* RIVER LEGEND */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '12px', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '5px',
        }}>
          {RIVERS.map((r) => (
            <button key={r.id} onClick={() => { setSheet(r); setSheetFull(false) }} style={{
              background: 'rgba(6,10,20,0.82)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${STATUS[r.status].color}33`,
              borderLeft: `2px solid ${STATUS[r.status].color}`,
              borderRadius: '5px', padding: '5px 10px',
              color: '#64748b', fontSize: '10px',
              cursor: 'pointer', textAlign: 'left', letterSpacing: '0.5px',
            }}>
              <span style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', background: STATUS[r.status].color,
                marginRight: '7px', verticalAlign: 'middle',
                boxShadow: `0 0 4px ${STATUS[r.status].color}`,
              }} />
              {r.name}
            </button>
          ))}
        </div>

        {/* HINT */}
        {mapReady && !sheet && (
          <div style={{
            position: 'absolute', top: '62px', left: '12px', zIndex: 100,
            fontSize: '9px', letterSpacing: '1.5px', color: '#1e3a5f',
          }}>
            TAP A RIVER TO EXPLORE
          </div>
        )}

        {/* BOTTOM SHEET */}
        {sheet && (
          <div className="sheet-enter" style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 200,
            height: sheetFull ? '90vh' : '52vh',
            background: 'rgba(4,8,18,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(96,165,250,0.12)',
            borderRadius: '14px 14px 0 0',
            transition: 'height 0.3s cubic-bezier(0.32,0.72,0,1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div onClick={() => setSheetFull(f => !f)} style={{
              padding: '10px 0 6px', display: 'flex',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: '#1e293b' }} />
            </div>

            <div style={{ padding: '0 18px 24px', overflowY: 'auto', flex: 1 }}>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '14px',
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
                    {sheet.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#1e3a5f', letterSpacing: '2.5px', marginTop: '3px' }}>
                    MAJOR RIVER · {sheet.states.toUpperCase()}
                  </div>
                </div>
                <button onClick={closeSheet} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1e293b', color: '#475569',
                  fontSize: '14px', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: '6px',
                }}>✕</button>
              </div>

              <div style={{
                background: `${STATUS[sheet.status].color}0d`,
                border: `1px solid ${STATUS[sheet.status].color}33`,
                borderRadius: '8px', padding: '10px 13px',
                marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '9px',
              }}>
                <div className="pulse" style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: STATUS[sheet.status].color,
                  boxShadow: `0 0 10px ${STATUS[sheet.status].color}`,
                }} />
                <span style={{
                  fontSize: '11px', color: STATUS[sheet.status].color,
                  letterSpacing: '2px', fontWeight: 600,
                }}>
                  {STATUS[sheet.status].label.toUpperCase()}
                </span>
                <span style={{ fontSize: '10px', color: '#334155', marginLeft: 'auto' }}>
                  {sheet.length}
                </span>
              </div>

              <div style={{
                fontSize: '12px', color: '#64748b', lineHeight: '1.7',
                marginBottom: '13px', padding: '10px 13px',
                background: 'rgba(96,165,250,0.04)',
                borderRadius: '8px', borderLeft: '2px solid #1d4ed8',
              }}>
                {sheet.context}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px', marginBottom: '13px' }}>
                {[
                  { label: 'POPULATION', value: sheet.population },
                  { label: 'LENGTH', value: sheet.length },
                  { label: 'STATUS', value: sheet.status.toUpperCase() },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '7px', padding: '9px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '7px', color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: '4px' }}>
                      {stat.label}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: stat.label === 'STATUS' ? STATUS[sheet.status].color : '#94a3b8',
                    }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '8px', color: '#1e3a5f', letterSpacing: '2.5px', marginBottom: '8px' }}>
                  PRIMARY USES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {sheet.use.split(' · ').map(u => (
                    <span key={u} style={{
                      fontSize: '10px', color: '#3b82f6',
                      background: 'rgba(59,130,246,0.07)',
                      border: '1px solid rgba(59,130,246,0.18)',
                      borderRadius: '20px', padding: '4px 10px',
                    }}>{u}</span>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: '8px', padding: '12px 13px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '1.5px', marginBottom: '3px' }}>
                    🔴 ADVANCED DATA
                  </div>
                  <div style={{ fontSize: '9px', color: '#334155', lineHeight: '1.5' }}>
                    Water rights · Senior/Junior allocation<br />
                    Regulatory friction · 50-year trend charts
                  </div>
                </div>
                <div style={{ fontSize: '20px', marginLeft: '12px' }}>🔒</div>
              </div>

            </div>
          </div>
        )}

        {/* STATUS BAR */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: sheet ? 0 : 90,
          padding: '7px 18px',
          background: 'rgba(4,6,14,0.88)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(96,165,250,0.07)',
          fontSize: '8px', color: '#1e3a5f', letterSpacing: '2px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>NEXUS v0.1 · PHASE 1</span>
          <span style={{ color: '#22c55e' }}>● LIVE</span>
          <span>5 RIVERS INDEXED</span>
        </div>

      </div>
    </>
  )
}
