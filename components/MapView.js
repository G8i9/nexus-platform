import { useEffect, useRef, useState } from 'react'

export default function MapView() {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (mapRef.current) return

    import('maplibre-gl').then((mod) => {
      const maplibregl = mod.default ?? mod

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-96.0, 38.5],
        zoom: 3.4,
        attributionControl: false,
      })

      mapRef.current.on('load', () => setLoaded(true))
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060810; overflow: hidden; }
        .maplibregl-canvas {
          filter: brightness(0.38) saturate(0.5) hue-rotate(200deg);
        }
      `}</style>

      <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

        {loaded && (
          <div style={{
            position: 'absolute', top: '20px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(6,8,16,0.9)',
            border: '1px solid rgba(96,165,250,0.3)',
            borderRadius: '8px', padding: '8px 16px',
            fontFamily: 'monospace', fontSize: '11px',
            color: '#60a5fa', letterSpacing: '3px',
            zIndex: 100,
          }}>
            MAP LOADED ✓
          </div>
        )}
      </div>
    </>
  )
}
