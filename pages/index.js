import dynamic from 'next/dynamic'
import Head from 'next/head'

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
  return (
    <>
      <Head>
        <title>NEXUS — Infrastructure Terminal</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
        />
      </Head>
      <MapView />
    </>
  )
}
