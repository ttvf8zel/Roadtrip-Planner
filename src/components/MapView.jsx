import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ACTIVITIES, ACCOMM } from '../data'

const OSRM = 'https://router.project-osrm.org/route/v1/driving/'

function routeKey(a, b) { return `${a.id}→${b.id}` }

function fmt(secs) {
  const h = Math.floor(secs / 3600), m = Math.round((secs % 3600) / 60)
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`
}
function fmtMi(m) { return Math.round(m * 0.000621371).toLocaleString() }

export default function MapView({ stops, routeCache, cacheRoute, onEdit, onDelete, onView, onAddStop }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef(L.layerGroup())
  const routesRef = useRef(L.layerGroup())
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (mapInstance.current) return
    const m = L.map(mapRef.current, { center: [39.5, -98.35], zoom: 5 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Routes by OSRM',
      maxZoom: 19,
    }).addTo(m)
    markersRef.current.addTo(m)
    routesRef.current.addTo(m)
    mapInstance.current = m
  }, [])

  const fetchRoute = useCallback(async (a, b) => {
    const key = routeKey(a, b)
    if (routeCache[key]) return routeCache[key]
    try {
      const r = await fetch(`${OSRM}${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`)
      const j = await r.json()
      if (j.code !== 'Ok') return null
      const leg = j.routes[0]
      const data = {
        miles: leg.distance * 0.000621371,
        duration: leg.duration,
        coords: leg.geometry.coordinates.map(c => [c[1], c[0]])
      }
      cacheRoute(key, data)
      return data
    } catch { return null }
  }, [routeCache, cacheRoute])

  useEffect(() => {
    if (!mapInstance.current) return
    markersRef.current.clearLayers()
    routesRef.current.clearLayers()

    const pts = stops.filter(s => s.lat && s.lng)
    if (!pts.length) return

    async function draw() {
      if (pts.length > 1) {
        setStatus('🛣️ Calculating road routes…')
        await Promise.all(pts.map((s, i) => i > 0 ? fetchRoute(pts[i - 1], pts[i]) : null).filter(Boolean))
        setStatus(null)
        for (let i = 1; i < pts.length; i++) {
          const rd = routeCache[routeKey(pts[i - 1], pts[i])] || await fetchRoute(pts[i - 1], pts[i])
          if (rd?.coords) {
            L.polyline(rd.coords, { color: '#ff6b35', weight: 7, opacity: 0.12 }).addTo(routesRef.current)
            L.polyline(rd.coords, { color: '#ff6b35', weight: 2.5, opacity: 0.9, dashArray: '9,5' }).addTo(routesRef.current)
            const mid = rd.coords[Math.floor(rd.coords.length / 2)]
            L.marker(mid, {
              icon: L.divIcon({
                className: '',
                html: `<div style="background:rgba(7,17,26,.88);border:1px solid #1e3a4a;border-radius:8px;padding:2px 8px;font-family:monospace;font-size:10px;color:#ff6b35;white-space:nowrap;pointer-events:none">${fmtMi(rd.miles)}mi · ${fmt(rd.duration)}</div>`,
                iconAnchor: [0, 0]
              }), interactive: false, zIndexOffset: -100
            }).addTo(routesRef.current)
          }
        }
      }

      pts.forEach((s, i) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none"><div style="width:28px;height:28px;border-radius:50%;background:#ff6b35;color:#07111a;font-family:monospace;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #ffaa80;box-shadow:0 0 14px rgba(255,107,53,.55)">${i + 1}</div><div style="width:2px;height:8px;background:#ff6b35;opacity:.7"></div></div>`,
          iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38]
        })
        const prev = i > 0 ? routeCache[routeKey(pts[i - 1], pts[i])] : null
        const acts = (ACTIVITIES.filter(a => (s.activities || []).includes(a.id)).map(a => `<span style="display:inline-block;padding:2px 6px;border-radius:6px;font-family:monospace;font-size:9px;background:${a.color}22;color:${a.color};border:1px solid ${a.color}44;margin:1px">${a.label}</span>`)).join('')
        const popup = `<div style="font-family:Georgia,serif;min-width:200px">
          <div style="font-size:14px;font-weight:600;color:#e8dcc8;margin-bottom:4px">${s.name.split(',')[0]}</div>
          <div style="font-family:monospace;font-size:10px;color:#4a6a7a">📅 ${s.days} day${s.days != 1 ? 's' : ''}${s.hours > 0 ? ` + ${s.hours}h` : ''}</div>
          ${s.accommodation ? `<div style="font-family:monospace;font-size:10px;color:#60a5fa">${ACCOMM.find(a => a.id === s.accommodation)?.label || ''}</div>` : ''}
          ${prev ? `<div style="font-family:monospace;font-size:11px;color:#ff6b35;margin-top:5px;padding-top:5px;border-top:1px solid #1e3a4a">🚗 ${fmtMi(prev.miles)} mi · ${fmt(prev.duration)}</div>` : ''}
          ${acts ? `<div style="margin-top:5px">${acts}</div>` : ''}
          ${(s.mustSee || []).length ? `<div style="font-family:monospace;font-size:9px;color:#4ade80;margin-top:4px">${s.mustSee.slice(0, 3).map(m => '📍' + m).join(' · ')}</div>` : ''}
          <div style="display:flex;gap:5px;margin-top:9px">
            <button onclick="window.__viewStop('${s.id}')" style="padding:4px 10px;background:#ff6b35;border:none;border-radius:6px;color:#07111a;cursor:pointer;font-size:10px;font-family:monospace;font-weight:700">👁 View</button>
            <button onclick="window.__editStop('${s.id}')" style="padding:4px 10px;background:#1e3a4a;border:none;border-radius:6px;color:#e8dcc8;cursor:pointer;font-size:10px;font-family:monospace">✏️ Edit</button>
            <button onclick="window.__deleteStop('${s.id}')" style="padding:4px 10px;background:#2a0e0e;border:none;border-radius:6px;color:#f87171;cursor:pointer;font-size:10px;font-family:monospace">🗑 Delete</button>
          </div>
        </div>`

        const marker = L.marker([s.lat, s.lng], { icon, draggable: true, riseOnHover: true })
          .bindPopup(popup, { maxWidth: 260 })
          .addTo(markersRef.current)

        marker.on('dragend', e => {
          const { lat, lng } = e.target.getLatLng()
          onEdit({ ...s, lat, lng, name: s.name.startsWith('Custom') ? `Custom (${lat.toFixed(3)},${lng.toFixed(3)})` : s.name })
        })
      })
    }
    draw()
  }, [stops, routeCache])

  useEffect(() => {
    window.__editStop = id => onEdit(stops.find(s => s.id === id))
    window.__deleteStop = id => onDelete(id)
    window.__viewStop = id => onView(stops.find(s => s.id === id))
  }, [stops, onEdit, onDelete, onView])

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {status && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(7,17,26,.9)', border: '1px solid #1e3a4a', borderRadius: 20, padding: '6px 16px', fontFamily: 'monospace', fontSize: 11, color: '#ff6b35', zIndex: 1000, pointerEvents: 'none' }}>
          {status}
        </div>
      )}
    </div>
  )
}
