import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

type City = {
  name: string
  center: [number, number]
  zoom: number
}

type Region = {
  name: string
  center: [number, number]
  zoom: number
  cities: City[]
}

type RegionFeature = {
  type: 'Feature'
  properties?: Record<string, unknown>
  geometry: unknown
}

type RegionCollection = {
  type: 'FeatureCollection'
  features: RegionFeature[]
}

const regions: Region[] = [
  { name: 'Abruzzo', center: [42.3, 13.9], zoom: 8, cities: [{ name: "L'Aquila", center: [42.35, 13.4], zoom: 11 }, { name: 'Pescara', center: [42.46, 14.21], zoom: 11 }, { name: 'Chieti', center: [42.35, 14.17], zoom: 11 }, { name: 'Teramo', center: [42.66, 13.7], zoom: 11 } ] },
  { name: 'Basilicata', center: [40.5, 16.2], zoom: 8, cities: [{ name: 'Potenza', center: [40.64, 15.81], zoom: 11 }, { name: 'Matera', center: [40.67, 16.6], zoom: 11 } ] },
  { name: 'Calabria', center: [39.1, 16.4], zoom: 8, cities: [{ name: 'Catanzaro', center: [38.91, 16.59], zoom: 11 }, { name: 'Cosenza', center: [39.3, 16.25], zoom: 11 }, { name: 'Crotone', center: [39.08, 17.12], zoom: 11 }, { name: 'Reggio Calabria', center: [38.11, 15.65], zoom: 11 } ] },
  { name: 'Campania', center: [40.9, 14.8], zoom: 8, cities: [{ name: 'Napoli', center: [40.85, 14.27], zoom: 11 }, { name: 'Salerno', center: [40.68, 14.77], zoom: 11 }, { name: 'Caserta', center: [41.07, 14.33], zoom: 11 }, { name: 'Avellino', center: [40.91, 14.79], zoom: 11 }, { name: 'Benevento', center: [41.13, 14.78], zoom: 11 } ] },
  { name: 'Emilia-Romagna', center: [44.5, 11.1], zoom: 8, cities: [{ name: 'Bologna', center: [44.49, 11.34], zoom: 11 }, { name: 'Modena', center: [44.65, 10.92], zoom: 11 }, { name: 'Parma', center: [44.8, 10.33], zoom: 11 }, { name: 'Reggio Emilia', center: [44.7, 10.63], zoom: 11 }, { name: 'Ravenna', center: [44.42, 12.2], zoom: 11 }, { name: 'Rimini', center: [44.06, 12.57], zoom: 11 } ] },
  { name: 'Friuli-Venezia Giulia', center: [46.1, 13.1], zoom: 8, cities: [{ name: 'Trieste', center: [45.65, 13.77], zoom: 11 }, { name: 'Udine', center: [46.07, 13.24], zoom: 11 }, { name: 'Pordenone', center: [45.96, 12.66], zoom: 11 }, { name: 'Gorizia', center: [45.94, 13.62], zoom: 11 } ] },
  { name: 'Lazio', center: [41.8, 12.8], zoom: 8, cities: [{ name: 'Roma', center: [41.9, 12.5], zoom: 10 }, { name: 'Latina', center: [41.47, 12.9], zoom: 11 }, { name: 'Frosinone', center: [41.64, 13.35], zoom: 11 }, { name: 'Viterbo', center: [42.42, 12.11], zoom: 11 } ] },
  { name: 'Liguria', center: [44.3, 8.8], zoom: 8, cities: [{ name: 'Genova', center: [44.41, 8.93], zoom: 11 }, { name: 'La Spezia', center: [44.1, 9.82], zoom: 11 }, { name: 'Savona', center: [44.31, 8.48], zoom: 11 }, { name: 'Imperia', center: [43.89, 8.03], zoom: 11 } ] },
  { name: 'Lombardia', center: [45.6, 9.9], zoom: 8, cities: [{ name: 'Milano', center: [45.46, 9.19], zoom: 10 }, { name: 'Bergamo', center: [45.7, 9.67], zoom: 11 }, { name: 'Brescia', center: [45.54, 10.22], zoom: 11 }, { name: 'Monza', center: [45.58, 9.27], zoom: 11 }, { name: 'Como', center: [45.81, 9.09], zoom: 11 }, { name: 'Varese', center: [45.82, 8.83], zoom: 11 } ] },
  { name: 'Marche', center: [43.3, 13.2], zoom: 8, cities: [{ name: 'Ancona', center: [43.62, 13.52], zoom: 11 }, { name: 'Pesaro', center: [43.91, 12.91], zoom: 11 }, { name: 'Macerata', center: [43.3, 13.45], zoom: 11 }, { name: 'Ascoli Piceno', center: [42.85, 13.58], zoom: 11 } ] },
  { name: 'Molise', center: [41.7, 14.6], zoom: 8, cities: [{ name: 'Campobasso', center: [41.56, 14.66], zoom: 11 }, { name: 'Termoli', center: [41.99, 14.99], zoom: 11 } ] },
  { name: 'Piemonte', center: [45.0, 7.9], zoom: 8, cities: [{ name: 'Torino', center: [45.07, 7.69], zoom: 10 }, { name: 'Novara', center: [45.45, 8.62], zoom: 11 }, { name: 'Alessandria', center: [44.91, 8.62], zoom: 11 }, { name: 'Asti', center: [44.9, 8.21], zoom: 11 }, { name: 'Cuneo', center: [44.38, 7.54], zoom: 11 } ] },
  { name: 'Puglia', center: [41.0, 16.8], zoom: 8, cities: [{ name: 'Bari', center: [41.12, 16.87], zoom: 10 }, { name: 'Lecce', center: [40.35, 18.17], zoom: 11 }, { name: 'Taranto', center: [40.47, 17.24], zoom: 11 }, { name: 'Foggia', center: [41.46, 15.55], zoom: 11 }, { name: 'Brindisi', center: [40.64, 17.95], zoom: 11 } ] },
  { name: 'Sardegna', center: [40.1, 9.0], zoom: 8, cities: [{ name: 'Cagliari', center: [39.22, 9.12], zoom: 10 }, { name: 'Sassari', center: [40.73, 8.56], zoom: 11 }, { name: 'Olbia', center: [40.92, 9.5], zoom: 11 }, { name: 'Nuoro', center: [40.32, 9.33], zoom: 11 } ] },
  { name: 'Sicilia', center: [37.6, 14.1], zoom: 8, cities: [{ name: 'Palermo', center: [38.12, 13.36], zoom: 10 }, { name: 'Catania', center: [37.51, 15.08], zoom: 10 }, { name: 'Messina', center: [38.19, 15.55], zoom: 11 }, { name: 'Siracusa', center: [37.08, 15.29], zoom: 11 }, { name: 'Trapani', center: [38.02, 12.54], zoom: 11 }, { name: 'Ragusa', center: [36.93, 14.72], zoom: 11 } ] },
  { name: 'Toscana', center: [43.5, 11.0], zoom: 8, cities: [{ name: 'Firenze', center: [43.77, 11.25], zoom: 11 }, { name: 'Prato', center: [43.88, 11.1], zoom: 11 }, { name: 'Pisa', center: [43.72, 10.4], zoom: 11 }, { name: 'Livorno', center: [43.55, 10.31], zoom: 11 }, { name: 'Lucca', center: [43.84, 10.5], zoom: 11 }, { name: 'Siena', center: [43.32, 11.33], zoom: 11 }, { name: 'Arezzo', center: [43.46, 11.88], zoom: 11 } ] },
  { name: 'Trentino-Alto Adige', center: [46.4, 11.4], zoom: 8, cities: [{ name: 'Trento', center: [46.07, 11.12], zoom: 11 }, { name: 'Bolzano', center: [46.5, 11.35], zoom: 11 }, { name: 'Rovereto', center: [45.89, 11.04], zoom: 11 } ] },
  { name: 'Umbria', center: [42.9, 12.5], zoom: 8, cities: [{ name: 'Perugia', center: [43.11, 12.39], zoom: 11 }, { name: 'Terni', center: [42.56, 12.65], zoom: 11 }, { name: 'Foligno', center: [42.95, 12.7], zoom: 11 } ] },
  { name: "Valle d'Aosta", center: [45.7, 7.3], zoom: 9, cities: [{ name: 'Aosta', center: [45.74, 7.32], zoom: 11 } ] },
  { name: 'Veneto', center: [45.5, 11.9], zoom: 8, cities: [{ name: 'Venezia', center: [45.44, 12.33], zoom: 11 }, { name: 'Verona', center: [45.44, 10.99], zoom: 11 }, { name: 'Padova', center: [45.41, 11.88], zoom: 11 }, { name: 'Vicenza', center: [45.55, 11.54], zoom: 11 }, { name: 'Treviso', center: [45.67, 12.24], zoom: 11 }, { name: 'Rovigo', center: [45.07, 11.79], zoom: 11 } ] },
]

const italyBounds: L.LatLngBoundsExpression = [[35.2, 6.3], [47.3, 18.7]]
const geoJsonUrl = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson'

function regionName(feature: RegionFeature) {
  const properties = feature.properties ?? {}
  return String(properties.reg_name ?? properties.name ?? properties.NOME_REG ?? '')
}

function App() {
  const mapElement = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const regionsLayerRef = useRef<L.GeoJSON | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return

    const map = L.map(mapElement.current, {
      center: [41.9, 12.6],
      zoom: 5.5,
      minZoom: 5,
      maxZoom: 12,
      maxBounds: italyBounds,
      maxBoundsViscosity: 1,
      zoomControl: false,
      attributionControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map

    const loadRegions = async () => {
      try {
        const response = await fetch(geoJsonUrl)
        if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`)
        const data = (await response.json()) as RegionCollection

        const layer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
          style: {
            color: '#ff2bd6',
            weight: 1.5,
            opacity: 0.95,
            fillColor: '#050505',
            fillOpacity: 0.96,
          },
          onEachFeature: (feature, featureLayer) => {
            const name = regionName(feature as RegionFeature)
            const region = regions.find((item) => item.name.toLowerCase() === name.toLowerCase())
            if (!region) return

            featureLayer.on({
              mouseover: () => {
                featureLayer.setStyle({ color: '#36f7ff', weight: 2.5, fillColor: '#0b1012', fillOpacity: 0.98 })
              },
              mouseout: () => {
                featureLayer.setStyle({ color: '#ff2bd6', weight: 1.5, fillColor: '#050505', fillOpacity: 0.96 })
              },
              click: () => {
                setSelectedRegion(region)
                map.fitBounds(featureLayer.getBounds(), { padding: [35, 35], maxZoom: region.zoom })
              },
            })
          },
        }).addTo(map)

        regionsLayerRef.current = layer
        map.fitBounds(layer.getBounds(), { padding: [25, 25] })
      } catch {
        setMapError(true)
      }
    }

    void loadRegions()

    return () => {
      map.remove()
      mapRef.current = null
      regionsLayerRef.current = null
    }
  }, [])

  const goHome = () => {
    setSelectedRegion(null)
    mapRef.current?.fitBounds(italyBounds, { padding: [25, 25] })
  }

  const focusRegion = (region: Region) => {
    setSelectedRegion(region)
    mapRef.current?.setView(region.center, region.zoom, { animate: true })
  }

  const focusCity = (city: City) => {
    mapRef.current?.setView(city.center, city.zoom, { animate: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={goHome}>sona+</button>
        <button className="find-me" type="button">Fatti trovare</button>
      </header>

      <main className="main-content">
        <section className="map-panel" aria-label="Mappa della scena musicale italiana">
          <div ref={mapElement} className="map" />
          {mapError && <div className="map-error">Impossibile caricare i confini della mappa.</div>}
        </section>

        <aside className="regions-panel" aria-label="Regioni e città italiane">
          {selectedRegion ? (
            <>
              <button className="back-button" type="button" onClick={goHome}>← Italia</button>
              <p className="panel-label">{selectedRegion.name}</p>
              <nav className="cities-list" aria-label={`Città di ${selectedRegion.name}`}>
                {selectedRegion.cities.map((city) => (
                  <button key={city.name} type="button" onClick={() => focusCity(city)}>{city.name}</button>
                ))}
              </nav>
            </>
          ) : (
            <>
              <p className="panel-label">Regioni</p>
              <nav>
                {regions.map((region) => (
                  <button key={region.name} type="button" onClick={() => focusRegion(region)}>{region.name}</button>
                ))}
              </nav>
            </>
          )}
        </aside>
      </main>

      <footer className="ad-space">
        <p>Vuoi far conoscere il tuo progetto alla scena musicale italiana?</p>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Contattaci su Instagram per uno spazio pubblicitario su SONA+.</a>
      </footer>
    </div>
  )
}

export default App
