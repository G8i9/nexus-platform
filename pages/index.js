import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100vh',
      background: '#060810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#1e3a5f',
      letterSpacing: '3px',
      fontSize: '11px',
    }}>
      NEXUS LOADING...
    </div>
  ),
})

export default function Home() {
  return <MapView />
}
