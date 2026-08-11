import { useEffect, useRef } from 'react'
import L from 'leaflet'

type Region = {
  name: string
  center: L.LatLngExpression
  zoom: number
}

const regions: Region[] = [
  { name: 'Abruzzo', center: [42.3, 13.9], zoom: 8 },
  { name: 'Basilicata', center: [40.5, 16.2], zoom: 8 },
  { name: 'Calabria', center: [39.1, 16.4], zoom: 8 },
  { name: 'Campania', center: [40.9, 14.8], zoom: 8 },
  { name: 'Emilia-Romagna', center: [44.5, 11.1], zoom: 8 },
  { name: 'Friuli-Venezia Giulia', center: [46.1, 13.1], zoom: 8 },
  { name: 'Lazio', center: [41.8, 12.8], zoom: 8 },
  { name: 'Liguria', center: [44.3, 8.8], zoom: 8 },
  { name: 'Lombardia', center: [45.6, 9.9], zoom: 8 },
  { name: 'Marche', center: [43.3, 13.2], zoom: 8 },
  { name: 'Molise', center: [41.7, 14.6], zoom: 8 },
  { name: 'Piemonte', center: [45.0, 7.9], zoom: 8 },
  { name: 'Puglia', center: [41.0, 16.8], zoom: 8 },
  { name: 'Sardegna', center: [40.1, 9.0], zoom: 8 },
  { name: 'Sicilia', center: [37.6, 14.1], zoom: 8 },
  { name: 'Toscana', center: [43.5, 11.0], zoom: 8 },
  { name: 'Trentino-Alto Adige', center: [46.4, 11.4], zoom: 8 },
  { name: 'Umbria', center: [42.9, 12.5], zoom: 8 },
  { name: "Valle d'Aosta", center: [45.7, 7.3], zoom: 9 },
  { name: 'Veneto', center: [45.5, 11.9], zoom: 8 },
]

const italyCenter: L.LatLngExpression = [41.9, 12.6]

function App() {
  const mapElement = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return

    const map = L.map(mapElement.current, {
      center: italyCenter,
      zoom: 5.5,
      minZoom: 5,
      maxZoom: 12,
      maxBounds: [
        [35.2, 5.5],
        [47.8, 19.5],
      ],
      maxBoundsViscosity: 1,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const goHome = () => {
    mapRef.current?.setView(italyCenter, 5.5, { animate: true })
  }

  const focusRegion = (region: Region) => {
    mapRef.current?.setView(region.center, region.zoom, { animate: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={goHome}>
          sona+
        </button>

        <button className="find-me" type="button">
          Fatti trovare
        </button>
      </header>

      <main className="main-content">
        <section className="map-panel" aria-label="Mappa della scena musicale italiana">
          <div ref={mapElement} className="map" />
        </section>

        <aside className="regions-panel" aria-label="Regioni italiane">
          <p className="panel-label">Regioni</p>
          <nav>
            {regions.map((region) => (
              <button key={region.name} type="button" onClick={() => focusRegion(region)}>
                {region.name}
              </button>
            ))}
          </nav>
        </aside>
      </main>

      <footer className="ad-space">
        <p>Vuoi far conoscere il tuo progetto alla scena musicale italiana?</p>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
          Contattaci su Instagram per uno spazio pubblicitario su SONA+.
        </a>
      </footer>
    </div>
  )
}

export default App
