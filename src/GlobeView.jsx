import { useEffect, useRef, useState, useMemo } from 'react'
import Globe from 'react-globe.gl'

const COUNTRY_COORDS = {
  "Mediterranean Climate":        { lat: 37.0,  lng: 15.0  },
  "Tropical / Rainforest Climate":{ lat: 0.0,   lng: 20.0  },
  "Arid / Desert Climate":        { lat: 23.0,  lng: 15.0  },
  "Semi-arid / Steppe Climate":   { lat: 40.0,  lng: 60.0  },
  "Temperate Oceanic Climate":    { lat: 52.0,  lng: 5.0   },
  "Humid Subtropical Climate":    { lat: 28.0,  lng: 105.0 },
  "Continental Climate":          { lat: 55.0,  lng: 40.0  },
  "Egypt":                        { lat: 26.8,  lng: 30.8  },
  "Saudi Arabia":                 { lat: 23.9,  lng: 45.1  },
  "UAE":                          { lat: 23.4,  lng: 53.8  },
  "Qatar":                        { lat: 25.3,  lng: 51.2  },
  "Kuwait":                       { lat: 29.4,  lng: 47.7  },
  "Bahrain":                      { lat: 26.0,  lng: 50.5  },
  "Oman":                         { lat: 21.5,  lng: 55.9  },
  "Jordan":                       { lat: 30.6,  lng: 36.5  },
  "Lebanon":                      { lat: 33.9,  lng: 35.5  },
  "Iraq":                         { lat: 33.2,  lng: 43.7  },
  "Syria":                        { lat: 34.8,  lng: 38.9  },
  "Yemen":                        { lat: 15.6,  lng: 48.5  },
  "Palestine / West Bank & Gaza": { lat: 31.9,  lng: 35.3  },
  "Libya":                        { lat: 26.3,  lng: 17.2  },
  "Morocco":                      { lat: 31.8,  lng: -7.1  },
  "Tunisia":                      { lat: 33.9,  lng: 9.5   },
  "Algeria":                      { lat: 28.0,  lng: 2.6   },
  "Sudan":                        { lat: 12.9,  lng: 30.2  },
  "Ethiopia (Horn)":              { lat: 9.1,   lng: 40.5  },
  "South Africa":                 { lat: -28.5, lng: 24.7  },
  "Kenya":                        { lat: 0.0,   lng: 37.9  },
  "Tanzania":                     { lat: -6.4,  lng: 34.9  },
  "Uganda":                       { lat: 1.4,   lng: 32.3  },
  "Rwanda":                       { lat: -1.9,  lng: 29.9  },
  "Nigeria":                      { lat: 9.1,   lng: 8.7   },
  "Ghana":                        { lat: 7.9,   lng: -1.0  },
  "Senegal":                      { lat: 14.5,  lng: -14.5 },
  "Côte d'Ivoire":                { lat: 7.5,   lng: -5.6  },
  "Cameroon":                     { lat: 3.8,   lng: 11.5  },
  "Zimbabwe":                     { lat: -19.0, lng: 29.2  },
  "Namibia":                      { lat: -22.0, lng: 17.1  },
  "Botswana":                     { lat: -22.3, lng: 24.7  },
  "Mozambique":                   { lat: -18.7, lng: 35.5  },
  "Zambia":                       { lat: -13.1, lng: 27.8  },
  "Malawi":                       { lat: -13.2, lng: 34.3  },
  "Spain":                        { lat: 40.5,  lng: -3.7  },
  "Portugal":                     { lat: 39.4,  lng: -8.2  },
  "France":                       { lat: 46.2,  lng: 2.2   },
  "Italy":                        { lat: 41.9,  lng: 12.6  },
  "Greece":                       { lat: 39.1,  lng: 21.8  },
  "Turkey":                       { lat: 38.9,  lng: 35.2  },
  "Cyprus":                       { lat: 35.1,  lng: 33.4  },
  "Malta":                        { lat: 35.9,  lng: 14.5  },
  "Croatia":                      { lat: 45.1,  lng: 15.2  },
  "Albania":                      { lat: 41.2,  lng: 20.2  },
  "UK":                           { lat: 54.4,  lng: -3.4  },
  "Germany":                      { lat: 51.2,  lng: 10.5  },
  "Netherlands":                  { lat: 52.3,  lng: 5.3   },
  "Belgium":                      { lat: 50.5,  lng: 4.5   },
  "Austria":                      { lat: 47.5,  lng: 14.6  },
  "Switzerland":                  { lat: 46.8,  lng: 8.2   },
  "Sweden":                       { lat: 60.1,  lng: 18.6  },
  "Norway":                       { lat: 60.5,  lng: 8.5   },
  "Denmark":                      { lat: 56.3,  lng: 9.5   },
  "Finland":                      { lat: 61.9,  lng: 25.7  },
  "Ireland":                      { lat: 53.4,  lng: -8.2  },
  "Poland":                       { lat: 51.9,  lng: 19.1  },
  "Romania":                      { lat: 45.9,  lng: 24.9  },
  "Bulgaria":                     { lat: 42.7,  lng: 25.5  },
  "Czech Republic":               { lat: 49.8,  lng: 15.5  },
  "Hungary":                      { lat: 47.2,  lng: 19.5  },
  "Ukraine":                      { lat: 48.4,  lng: 31.2  },
  "Serbia":                       { lat: 44.0,  lng: 21.0  },
  "India":                        { lat: 20.6,  lng: 78.9  },
  "Pakistan":                     { lat: 30.4,  lng: 69.3  },
  "Bangladesh":                   { lat: 23.7,  lng: 90.4  },
  "Sri Lanka":                    { lat: 7.9,   lng: 80.8  },
  "Nepal":                        { lat: 28.4,  lng: 84.1  },
  "Thailand":                     { lat: 15.9,  lng: 100.9 },
  "Malaysia":                     { lat: 4.2,   lng: 108.0 },
  "Indonesia":                    { lat: -0.8,  lng: 113.9 },
  "Philippines":                  { lat: 12.9,  lng: 121.8 },
  "Vietnam":                      { lat: 14.1,  lng: 108.3 },
  "Singapore":                    { lat: 1.3,   lng: 103.8 },
  "Cambodia":                     { lat: 12.6,  lng: 104.9 },
  "Myanmar":                      { lat: 17.1,  lng: 96.0  },
  "Laos":                         { lat: 17.8,  lng: 102.5 },
  "China":                        { lat: 35.9,  lng: 104.2 },
  "Japan":                        { lat: 36.2,  lng: 138.3 },
  "South Korea":                  { lat: 35.9,  lng: 127.8 },
  "Taiwan":                       { lat: 23.7,  lng: 120.9 },
  "Kazakhstan":                   { lat: 48.0,  lng: 66.9  },
  "Uzbekistan":                   { lat: 41.4,  lng: 64.6  },
  "Iran":                         { lat: 32.4,  lng: 53.7  },
  "Afghanistan":                  { lat: 33.9,  lng: 67.7  },
  "Australia":                    { lat: -25.3, lng: 133.8 },
  "New Zealand":                  { lat: -40.9, lng: 172.7 },
  "Papua New Guinea":             { lat: -6.3,  lng: 143.9 },
  "Brazil":                       { lat: -14.2, lng: -51.9 },
  "Colombia":                     { lat: 4.6,   lng: -74.3 },
  "Venezuela":                    { lat: 6.4,   lng: -66.6 },
  "Ecuador":                      { lat: -1.8,  lng: -78.2 },
  "Peru":                         { lat: -9.2,  lng: -75.0 },
  "Bolivia":                      { lat: -16.3, lng: -63.6 },
  "Mexico":                       { lat: 23.6,  lng: -102.6},
  "Guatemala":                    { lat: 15.8,  lng: -90.2 },
  "Costa Rica":                   { lat: 9.7,   lng: -83.8 },
  "Panama":                       { lat: 8.5,   lng: -80.8 },
  "Cuba":                         { lat: 21.5,  lng: -80.0 },
  "Dominican Republic":           { lat: 18.7,  lng: -70.2 },
  "Jamaica":                      { lat: 18.1,  lng: -77.3 },
  "USA — Southwest (California, Arizona)": { lat: 34.5, lng: -116.0 },
  "USA — Southeast (Florida, Texas)":      { lat: 28.5, lng: -83.0  },
  "USA — Mid-Atlantic & Northeast":        { lat: 40.5, lng: -74.5  },
  "USA — Pacific Northwest":              { lat: 47.5, lng: -121.5 },
  "USA — Midwest / Great Plains":         { lat: 41.5, lng: -96.0  },
  "Canada":                       { lat: 56.1,  lng: -106.3},
  "Argentina":                    { lat: -38.4, lng: -63.6 },
  "Chile":                        { lat: -35.7, lng: -71.5 },
  "Uruguay":                      { lat: -32.5, lng: -55.8 },
}

export default function GlobeView({ country }) {
  const globeRef = useRef()
  const wrapRef = useRef()
  const [size, setSize] = useState({ w: 420, h: 600 })

  const coords = country ? COUNTRY_COORDS[country] : null

  // Measure container
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Auto-rotate + initial POV
  useEffect(() => {
    if (!globeRef.current) return
    const ctrl = globeRef.current.controls()
    ctrl.enableZoom = false
    ctrl.autoRotate = !coords
    ctrl.autoRotateSpeed = 0.5
  }, [coords])

  // Fly to country when selected — zoom out then in for cinematic feel
  useEffect(() => {
    if (!globeRef.current) return
    if (coords) {
      // First zoom out slightly, then fly in
      globeRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 2.5 }, 800)
      setTimeout(() => {
        globeRef.current?.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.8 }, 1000)
      }, 800)
    } else {
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1200)
    }
  }, [coords])

  const markers = useMemo(() =>
    coords ? [{ lat: coords.lat, lng: coords.lng }] : []
  , [coords])

  const makeEl = useMemo(() => () => {
    const wrap = document.createElement('div')
    wrap.style.cssText = `
      position:relative;width:36px;height:36px;
      display:flex;align-items:center;justify-content:center;
    `
    wrap.innerHTML = `
      <style>
        @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
        @keyframes pinIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
      </style>
      <div style="
        position:absolute;width:36px;height:36px;border-radius:50%;
        border:2px solid rgba(156,200,130,0.55);
        animation:ping 1.6s ease-out infinite;
      "></div>
      <div style="
        position:absolute;width:20px;height:20px;border-radius:50%;
        border:2px solid rgba(156,200,130,0.85);
        background:rgba(42,74,30,0.5);
        backdrop-filter:blur(2px);
        animation:pinIn .5s cubic-bezier(.34,1.56,.64,1) forwards;
      "></div>
      <div style="
        width:7px;height:7px;border-radius:50%;
        background:#9cc882;
        box-shadow:0 0 8px 3px rgba(156,200,130,0.7);
        position:relative;z-index:1;
      "></div>
    `
    return wrap
  }, [])

  return (
    <div ref={wrapRef} style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 70% 50%, #0d1f0d 0%, #060e06 100%)',
      overflow: 'hidden', position: 'relative'
    }}>
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#9cc882"
        atmosphereAltitude={0.18}
        htmlElementsData={markers}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={makeEl}
      />
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        textAlign: 'center', pointerEvents: 'none',
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
        color: coords ? 'rgba(200,235,208,0.6)' : 'rgba(200,235,208,0.3)'
      }}>
        {coords ? country : 'Select a country to locate'}
      </div>
    </div>
  )
}
