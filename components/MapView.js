import { useEffect, useRef, useState } from 'react'

// ── River metadata (keyed by Natural Earth name_en) ─────────
const RIVER_META = {
  'Colorado': {
    status: 'critical', population: '40M',
    length: '1,450 mi', states: '7 states + Mexico',
    use: 'Agriculture · Municipal · Hydro',
    context: 'The only water source for 1 in 8 Americans — and it no longer reaches the sea.',
  },
  'Mississippi': {
    status: 'normal', population: '18M',
    length: '2,340 mi', states: '10 states',
    use: 'Agriculture · Industrial · Municipal',
    context: 'Drains 41% of the continental US and carries 92M tons of cargo annually.',
  },
  'Missouri': {
    status: 'stressed', population: '10M',
    length: '2,341 mi', states: '7 states',
    use: 'Agriculture · Municipal',
    context: 'The longest US river — its upper basin snowpack is declining 2% per decade.',
  },
  'Columbia': {
    status: 'normal', population: '8M',
    length: '1,243 mi', states: 'WA · OR · ID',
    use: 'Hydroelectric · Agriculture · Municipal',
    context: 'Generates more hydroelectric power than any other North American river.',
  },
  'Rio Grande': {
    status: 'critical', population: '6M',
    length: '1,896 mi', states: 'CO · NM · TX · Mexico',
    use: 'Agriculture · Municipal',
    context: 'Declared legally dead at its mouth in 2001. Reaches the Gulf only in wet years.',
  },
  'Arkansas': {
    status: 'stressed', population: '4M',
    length: '1,469 mi', states: 'CO · KS · OK · AR',
    use: 'Agriculture · Municipal · Industrial',
    context: 'A critical irrigation source for the southern plains under increasing drought pressure.',
  },
  'Snake': {
    status: 'normal', population: '3M',
    length: '1,078 mi', states: 'WY · ID · WA',
    use: 'Agriculture · Hydroelectric',
    context: "Columbia's largest tributary — its dams generate 40% of Pacific Northwest hydro power.",
  },
  'Ohio': {
    status: 'normal', population: '25M',
    length: '981 mi', states: 'PA · OH · WV · IN · KY',
    use: 'Municipal · Industrial · Agriculture',
    context: "Primary drinking water source for 5M people — Mississippi's largest tributary by volume.",
  },
  'Red': {
    status: 'stressed', population: '2M',
    length: '1,360 mi', states: 'TX · OK · AR · LA',
    use: 'Agriculture · Municipal',
    context: 'Forms the Texas-Oklahoma border; increasingly stressed by agricultural withdrawals.',
  },
  'Platte': {
    status: 'critical', population: '2M',
    length: '990 mi', states: 'WY · CO · NE',
    use: 'Agriculture · Wildlife',
    context: 'The "mile wide and inch deep" river now runs dry most summers due to irrigation.',
  },
  'Tennessee': {
    status: 'normal', population: '6M',
    length: '652 mi', states: 'TN · AL · MS · KY',
    use: 'Hydroelectric · Municipal · Industrial',
    context: 'TVA operates 49 dams on this river — the most intensively managed basin in the US.',
  },
  'Yukon': {
    status: 'normal', population: '0.1M',
    length: '1,979 mi', states: 'Alaska · Canada',
    use: 'Fisheries · Transportation',
    context: "One of North America's last wild salmon rivers — Chinook runs have collapsed 90% since 1980.",
  },
  'Sacramento': {
    status: 'critical', population: '3M',
    length: '447 mi', states: 'California',
    use: 'Agriculture · Municipal · Hydroelectric',
    context: "California's largest river — supplies 35% of state water but faces severe drought curtailments.",
  },
  'Yellowstone': {
    status: 'stressed', population: '0.5M',
    length: '692 mi', states: 'WY · MT · ND',
    use: 'Agriculture · Fisheries',
    context: 'The longest free-flowing river in the contiguous US — irrigation claims exceed flow in dry years.',
  },
  'Brazos': {
    status: 'stressed', population: '4M',
    length: '1,280 mi', states: 'Texas',
    use: 'Agriculture · Municipal',
    context: 'The longest river entirely within Texas — heavily allocated with frequent emergency orders.',
  },
}

// ── Lake metadata ────────────────────────────────────────────
const LAKE_META = {
  'Lake Superior': {
    status: 'normal', area: '31,700 sq mi', states: 'MN · WI · MI · Ontario',
    use: 'Municipal · Shipping · Industrial',
    context: "World's largest freshwater lake by area — holds 10% of Earth's surface fresh water.",
  },
  'Lake Michigan': {
    status: 'normal', area: '22,394 sq mi', states: 'MI · WI · IL · IN',
    use: 'Municipal · Industrial · Recreation',
    context: 'Only Great Lake entirely within the US — primary water source for Chicago metro (8M people).',
  },
  'Lake Huron': {
    status: 'normal', area: '23,007 sq mi', states: 'MI · Ontario',
    use: 'Municipal · Shipping · Fisheries',
    context: 'Together with Lake Michigan forms the largest freshwater body by area on Earth.',
  },
  'Lake Erie': {
    status: 'stressed', area: '9,910 sq mi', states: 'OH · PA · NY · Ontario',
    use: 'Municipal · Industrial · Agriculture',
    context: 'Shallowest Great Lake — most vulnerable to algal blooms. Disrupted Toledo water supply in 2014.',
  },
  'Lake Ontario': {
    status: 'normal', area: '7,340 sq mi', states: 'NY · Ontario',
    use: 'Municipal · Industrial · Shipping',
    context: 'Smallest Great Lake by area — receives all Great Lakes drainage before the St. Lawrence.',
  },
  'Great Salt Lake': {
    status: 'critical', area: '950 sq mi', states: 'Utah',
    use: 'Mineral extraction · Wildlife habitat',
    context: 'Has lost 73% of its water volume since 1850. Could fully disappear by 2030 at current trajectory.',
  },
  'Lake Okeechobee': {
    status: 'stressed', area: '730 sq mi', states: 'Florida',
    use: 'Agriculture · Flood control · Municipal',
    context: "Florida's largest lake — chronically polluted by agricultural runoff, threatening the Everglades.",
  },
  'Lake Tahoe': {
    status: 'normal', area: '191 sq mi', states: 'CA · NV',
    use: 'Recreation · Municipal · Tourism',
    context: "One of the world's clearest lakes — clarity has declined 30% since the 1960s due to development.",
  },
}

const STATUS = {
  normal:   { color: '#22c55e', label: 'Normal' },
  stressed: { color: '#f59e0b', label: 'Below Average' },
  critical: { color: '#ef4444', label: 'Critically Low' },
}

const NONE_FILTER = ['==',
  ['coalesce', ['get', 'name_en'], ['get', 'name']], '__none__'
]

const LAYERS_DEFAULT = [
  { label: 'Rivers', on: true  },
  { label: 'Lakes',  on: true  },
  { label: 'Power Grid', on: false },
]

// ── Component ────────────────────────────────────────────────
export default function MapView() {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const [sheet, setSheet]         = useState(null)
  const [sheetType, setSheetType] = useState('river')
  const [sheetFull, setSheetFull] = useState(false)
  const [layers, setLayers]       = useState(LAYERS_DEFAULT)
  const [mapReady, setMapReady]   = useState(false)

  useEffect(() => {
    if (mapRef.current) return
    let mounted = true

    import('maplibre-gl').then((mod) => {
      if (!mounted) return
      const maplibregl = mod.default ?? mod

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-96.0, 38.5],
        zoom: 3.4,
        maxBounds: [[-180, 15], [-60, 72]],
        attributionControl: false,
      })
      mapRef.current = map

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-left'
      )

      map.on('load', async () => {
        if (!mounted) return

        // Filter GeoJSON to US bounding box
        const toUS = (geo, minArea) => ({
          ...geo,
          features: geo.features.filter(f => {
            if (!f.geometry) return false
            let c = f.geometry.coordinates
            // drill to first [lng, lat] pair
            while (Array.isArray(c[0])) c = c[0]
            const [lng, lat] = c
            const inUS = lng >= -178 && lng <= -60 && lat >= 15 && lat <= 72
            if (!inUS) return false
            if (minArea) {
              return (f.properties.area_sqkm || 0) >= minArea
            }
            return (f.properties.scalerank || 10) <= 7
          }),
        })

        try {
          const [rRes, lRes] = await Promise.all([
            fetch('/data/rivers.geojson'),
            fetch('/data/lakes.geojson'),
          ])
          if (!mounted) return
          const rivers = toUS(await rRes.json(), null)
          const lakes  = toUS(await lRes.json(), 50)

          // ── LAKES ─────────────────────────────────────────
          map.addSource('lakes', { type: 'geojson', data: lakes })

          map.addLayer({
            id: 'lakes-fill',
            type: 'fill',
            source: 'lakes',
            paint: {
              'fill-color': '#1e40af',
              'fill-opacity': [
                'interpolate', ['linear'],
                ['coalesce', ['get', 'area_sqkm'], 100],
                50,    0.18,
                1000,  0.28,
                10000, 0.42,
                50000, 0.58,
              ],
            },
          })

          map.addLayer({
            id: 'lakes-border',
            type: 'line',
            source: 'lakes',
            paint: {
              'line-color': '#60a5fa',
              'line-width': 0.8,
              'line-opacity': 0.6,
            },
          })

          map.addLayer({
            id: 'lakes-selected',
            type: 'fill',
            source: 'lakes',
            filter: NONE_FILTER,
            paint: {
              'fill-color': '#60a5fa',
              'fill-opacity': 0.32,
            },
          })

          // ── RIVERS ────────────────────────────────────────
          map.addSource('rivers', { type: 'geojson', data: rivers })

          map.addLayer({
            id: 'rivers-glow',
            type: 'line',
            source: 'rivers',
            paint: {
              'line-color': '#3b82f6',
              'line-width': [
                'interpolate', ['linear'],
                ['coalesce', ['get', 'strokeweig'], 1],
                0.1, 6, 5, 18, 10, 32,
              ],
              'line-opacity': 0.07,
              'line-blur': 5,
            },
          })

          map.addLayer({
            id: 'rivers-core',
            type: 'line',
            source: 'rivers',
            paint: {
              'line-color': [
                'interpolate', ['linear'],
                ['coalesce', ['get', 'strokeweig'], 1],
                0.1, '#bfdbfe',
                2,   '#93c5fd',
                4,   '#60a5fa',
                7,   '#3b82f6',
                10,  '#1d4ed8',
              ],
              'line-width': [
                'interpolate', ['linear'],
                ['coalesce', ['get', 'strokeweig'], 1],
                0.1, 0.5,
                2,   1.2,
                5,   2.2,
                10,  3.5,
              ],
              'line-opacity': 0.9,
            },
          })

          // Wide invisible hit area (easier to tap on mobile)
          map.addLayer({
            id: 'rivers-hit',
            type: 'line',
            source: 'rivers',
            paint: {
              'line-color': '#ffffff',
              'line-width': 22,
              'line-opacity': 0,
            },
          })

          // Supply area glow (activates on tap)
          map.addLayer({
            id: 'rivers-selected',
            type: 'line',
            source: 'rivers',
            filter: NONE_FILTER,
            paint: {
              'line-color': '#60a5fa',
              'line-width': 45,
              'line-opacity': 0.10,
              'line-blur': 22,
            },
          })

          // ── CLICK HANDLERS ────────────────────────────────
          const nameOf = p =>
            p.name_en || p.name || p.namealt || null

          const selectRiver = (e) => {
            const name = nameOf(e.features[0].properties)
            if (!name) return
            const nameFilter = ['==',
              ['coalesce', ['get', 'name_en'], ['get', 'name']], name
            ]
            map.setFilter('rivers-selected', nameFilter)
            map.setFilter('lakes-selected', NONE_FILTER)
            const meta = RIVER_META[name]
            setSheetType('river')
            setSheet(meta
              ? { ...meta, name }
              : { name, status: 'normal', population: '—', length: '—',
                  states: '—', use: '—',
                  context: `${name} — data being integrated into NEXUS.` }
            )
            setSheetFull(false)
          }

          const selectLake = (e) => {
            const name = nameOf(e.features[0].properties)
            if (!name) return
            const nameFilter = ['==',
              ['coalesce', ['get', 'name_en'], ['get', 'name']], name
            ]
            map.setFilter('lakes-selected', nameFilter)
            map.setFilter('rivers-selected', NONE_FILTER)
            const meta = LAKE_META[name]
            setSheetType('lake')
            setSheet(meta
              ? { ...meta, name }
              : { name, status: 'normal', area: '—', states: '—', use: '—',
                  context: `${name} — data being integrated into NEXUS.` }
            )
            setSheetFull(false)
          }

          map.on('click', 'rivers-hit',  selectRiver)
          map.on('click', 'rivers-core', selectRiver)
          map.on('click', 'lakes-fill',  selectLake)

          map.on('mouseenter', 'rivers-hit',  () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', 'rivers-hit',  () => { map.getCanvas().style.cursor = '' })
          map.on('mouseenter', 'lakes-fill',  () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', 'lakes-fill',  () => { map.getCanvas().style.cursor = '' })

          // Tap blank map = close sheet
          map.on('click', (e) => {
            const hit = map.queryRenderedFeatures(e.point, {
              layers: ['rivers-hit', 'rivers-core', 'lakes-fill'],
            })
            if (!hit.length) {
              setSheet(null)
              map.setFilter('rivers-selected', NONE_FILTER)
              map.setFilter('lakes-selected',  NONE_FILTER)
            }
          })

          if (mounted) setMapReady(true)

        } catch (err) {
          console.error('NEXUS: GeoJSON load failed', err)
        }
      })
    })

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const toggleLayer = (i) => {
    const next = layers.map((l, idx) => idx === i ? { ...l, on: !l.on } : l)
    setLayers(next)
    const map = mapRef.current
    if (!map) return
    const vis = next[i].on ? 'visible' : 'none'
    const groups = [
      ['rivers-glow', 'rivers-core', 'rivers-hit', 'rivers-selected'],
      ['lakes-fill', 'lakes-border', 'lakes-selected'],
    ]
    ;(groups[i] || []).forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis)
    })
  }

  const closeSheet = () => {
    setSheet(null)
    const map = mapRef.current
    if (!map) return
    if (map.getLayer('rivers-selected')) map.setFilter('rivers-selected', NONE_FILTER)
    if (map.getLayer('lakes-selected'))  map.setFilter('lakes-selected',  NONE_FILTER)
  }

  const s = sheet
  const statusColor = s ? (STATUS[s.status]?.color || '#3b82f6') : '#3b82f6'
  const statusLabel = s ? (STATUS[s.status]?.label || 'Unknown') : ''

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020508; overflow: hidden; }
        .maplibregl-canvas {
          filter: brightness(0.26) saturate(0.35) hue-rotate(200deg);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .sheet-enter { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1); }
        @keyframes pulse {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }
        .pulse { animation: pulse 2.2s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{
        height:'100vh', width:'100vw', position:'relative',
        fontFamily:'monospace', color:'white',
      }}>

        {/* MAP */}
        <div ref={mapContainer} style={{ position:'absolute', inset:0 }} />

        {/* NAVBAR */}
        <nav style={{
          position:'absolute', top:0, left:0, right:0, zIndex:100,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'13px 18px',
          background:'rgba(2,5,8,0.90)',
          backdropFilter:'blur(14px)',
          borderBottom:'1px solid rgba(59,130,246,0.1)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{
              fontSize:'16px', fontWeight:700,
              letterSpacing:'6px', color:'#e2e8f0',
            }}>NEXUS</span>
            <span style={{
              fontSize:'8px', letterSpacing:'2px', color:'#3b82f6',
              background:'rgba(59,130,246,0.08)',
              border:'1px solid rgba(59,130,246,0.22)',
              borderRadius:'4px', padding:'2px 6px',
            }}>WATER MODULE</span>
          </div>
          <div style={{
            display:'flex', gap:'18px',
            fontSize:'11px', letterSpacing:'1.5px',
          }}>
            <span style={{ color:'#60a5fa' }}>MAP</span>
            <span style={{ color:'#1e3a5f' }}>DATA</span>
          </div>
        </nav>

        {/* LAYER TOGGLES */}
        <div style={{
          position:'absolute', top:'58px', right:'12px', zIndex:100,
          background:'rgba(2,5,12,0.93)',
          backdropFilter:'blur(14px)',
          border:'1px solid rgba(59,130,246,0.1)',
          borderRadius:'10px', padding:'11px 13px', minWidth:'150px',
        }}>
          <div style={{
            fontSize:'8px', letterSpacing:'3px',
            color:'#1e3a5f', marginBottom:'10px',
          }}>LAYERS</div>
          {layers.map((layer, i) => (
            <div
              key={layer.label}
              onClick={() => toggleLayer(i)}
              style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                marginBottom: i < layers.length - 1 ? '8px' : 0,
                cursor:'pointer',
              }}
            >
              <span style={{
                fontSize:'11px',
                color: layer.on ? '#94a3b8' : '#334155',
              }}>{layer.label}</span>
              <div style={{
                width:'32px', height:'17px', borderRadius:'9px',
                background: layer.on ? '#1d4ed8' : '#0f172a',
                border:`1px solid ${layer.on ? '#3b82f6' : '#1e293b'}`,
                position:'relative', transition:'all 0.2s',
              }}>
                <div style={{
                  position:'absolute', top:'2px',
                  left: layer.on ? '14px' : '2px',
                  width:'11px', height:'11px', borderRadius:'50%',
                  background: layer.on ? '#60a5fa' : '#334155',
                  transition:'left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* HINT */}
        {mapReady && !sheet && (
          <div style={{
            position:'absolute', bottom:'36px', left:'50%',
            transform:'translateX(-50%)',
            zIndex:90, fontSize:'9px', letterSpacing:'2px',
            color:'#1e3a5f', pointerEvents:'none',
          }}>
            TAP ANY RIVER OR LAKE TO EXPLORE
          </div>
        )}

        {/* BOTTOM SHEET */}
        {sheet && (
          <div className="sheet-enter" style={{
            position:'absolute', left:0, right:0, bottom:0, zIndex:200,
            height: sheetFull ? '90vh' : '56vh',
            background:'rgba(1,4,10,0.97)',
            backdropFilter:'blur(22px)',
            border:'1px solid rgba(59,130,246,0.11)',
            borderRadius:'14px 14px 0 0',
            transition:'height 0.3s cubic-bezier(0.32,0.72,0,1)',
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            {/* Handle */}
            <div
              onClick={() => setSheetFull(f => !f)}
              style={{
                padding:'10px 0 6px', display:'flex',
                justifyContent:'center', cursor:'pointer', flexShrink:0,
              }}
            >
              <div style={{
                width:'32px', height:'3px',
                borderRadius:'2px', background:'#1e293b',
              }} />
            </div>

            <div style={{ padding:'0 18px 24px', overflowY:'auto', flex:1 }}>

              {/* Header */}
              <div style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', marginBottom:'14px',
              }}>
                <div>
                  <div style={{
                    fontSize:'20px', fontWeight:700, color:'#f1f5f9',
                  }}>{sheet.name}</div>
                  <div style={{
                    fontSize:'9px', color:'#1e3a5f',
                    letterSpacing:'2.5px', marginTop:'3px',
                  }}>
                    {sheetType === 'river' ? 'RIVER' : 'LAKE'}{sheet.states ? ` · ${sheet.states.toUpperCase()}` : ''}
                  </div>
                </div>
                <button onClick={closeSheet} style={{
                  background:'rgba(255,255,255,0.03)',
                  border:'1px solid #1e293b', color:'#475569',
                  fontSize:'14px', cursor:'pointer',
                  padding:'4px 8px', borderRadius:'6px',
                }}>✕</button>
              </div>

              {/* Status Gauge */}
              <div style={{
                background:`${statusColor}0d`,
                border:`1px solid ${statusColor}33`,
                borderRadius:'8px', padding:'10px 13px',
                marginBottom:'12px',
                display:'flex', alignItems:'center', gap:'9px',
              }}>
                <div className="pulse" style={{
                  width:'9px', height:'9px', borderRadius:'50%',
                  background: statusColor,
                  boxShadow:`0 0 10px ${statusColor}`,
                }} />
                <span style={{
                  fontSize:'11px', color: statusColor,
                  letterSpacing:'2px', fontWeight:600,
                }}>
                  {statusLabel.toUpperCase()}
                </span>
              </div>

              {/* Context */}
              <div style={{
                fontSize:'12px', color:'#64748b', lineHeight:'1.7',
                marginBottom:'13px', padding:'10px 13px',
                background:'rgba(59,130,246,0.04)',
                borderRadius:'8px', borderLeft:'2px solid #1d4ed8',
              }}>
                {sheet.context}
              </div>

              {/* Stats Grid */}
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
                gap:'7px', marginBottom:'13px',
              }}>
                {(sheetType === 'river' ? [
                  { label:'POPULATION', value: sheet.population || '—' },
                  { label:'LENGTH',     value: sheet.length     || '—' },
                  { label:'STATUS',     value: (sheet.status || 'normal').toUpperCase() },
                ] : [
                  { label:'AREA',   value: sheet.area || '—' },
                  { label:'TYPE',   value: 'LAKE' },
                  { label:'STATUS', value: (sheet.status || 'normal').toUpperCase() },
                ]).map(stat => (
                  <div key={stat.label} style={{
                    background:'rgba(255,255,255,0.02)',
                    border:'1px solid rgba(255,255,255,0.05)',
                    borderRadius:'7px', padding:'9px 8px', textAlign:'center',
                  }}>
                    <div style={{
                      fontSize:'7px', color:'#1e3a5f',
                      letterSpacing:'1.5px', marginBottom:'4px',
                    }}>{stat.label}</div>
                    <div style={{
                      fontSize:'11px',
                      color: stat.label === 'STATUS' ? statusColor : '#94a3b8',
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Primary Uses */}
              {sheet.use && sheet.use !== '—' && (
                <div style={{ marginBottom:'13px' }}>
                  <div style={{
                    fontSize:'8px', color:'#1e3a5f',
                    letterSpacing:'2.5px', marginBottom:'8px',
                  }}>PRIMARY USES</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                    {sheet.use.split(' · ').map(u => (
                      <span key={u} style={{
                        fontSize:'10px', color:'#3b82f6',
                        background:'rgba(59,130,246,0.07)',
                        border:'1px solid rgba(59,130,246,0.18)',
                        borderRadius:'20px', padding:'4px 10px',
                      }}>{u}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Supply Area button */}
              <div style={{
                background:'rgba(59,130,246,0.05)',
                border:'1px solid rgba(59,130,246,0.18)',
                borderRadius:'8px', padding:'11px 13px',
                marginBottom:'10px',
                display:'flex', justifyContent:'space-between',
                alignItems:'center', cursor:'pointer',
              }}>
                <div>
                  <div style={{
                    fontSize:'10px', color:'#60a5fa',
                    letterSpacing:'1.5px', marginBottom:'2px',
                  }}>💧 SHOW SUPPLY AREA</div>
                  <div style={{ fontSize:'9px', color:'#334155' }}>
                    Highlight watershed served by this source
                  </div>
                </div>
                <span style={{ fontSize:'13px', color:'#1e3a5f' }}>→</span>
              </div>

              {/* Advanced Lock */}
              <div style={{
                background:'rgba(239,68,68,0.04)',
                border:'1px solid rgba(239,68,68,0.16)',
                borderRadius:'8px', padding:'12px 13px',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <div>
                  <div style={{
                    fontSize:'10px', color:'#ef4444',
                    letterSpacing:'1.5px', marginBottom:'3px',
                  }}>🔴 ADVANCED DATA</div>
                  <div style={{ fontSize:'9px', color:'#334155', lineHeight:'1.5' }}>
                    Water rights · Senior/Junior allocation<br/>
                    Regulatory friction · 50-year trend charts
                  </div>
                </div>
                <div style={{ fontSize:'20px', marginLeft:'12px' }}>🔒</div>
              </div>

            </div>
          </div>
        )}

        {/* STATUS BAR */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          zIndex: sheet ? 0 : 90,
          padding:'7px 18px',
          background:'rgba(1,3,8,0.92)',
          backdropFilter:'blur(10px)',
          borderTop:'1px solid rgba(59,130,246,0.07)',
          fontSize:'8px', color:'#1e3a5f', letterSpacing:'2px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span>NEXUS v0.2 · PHASE 1</span>
          <span style={{ color:'#22c55e' }}>● LIVE</span>
          <span>RIVERS · LAKES · US</span>
        </div>

      </div>
    </>
  )
}
