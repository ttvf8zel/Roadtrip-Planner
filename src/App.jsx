import { useState, useCallback } from 'react'
import { useTrip } from './useTrip'
import MapView from './components/MapView'
import StopsPanel from './components/StopsPanel'
import StopModal from './components/StopModal'
import BudgetTab from './components/BudgetTab'
import BookingsTab from './components/BookingsTab'

const TABS = [
  { id:'map',      label:'🗺  Map' },
  { id:'stops',    label:'📋 Stops' },
  { id:'budget',   label:'💰 Budget' },
  { id:'bookings', label:'🎟️  Bookings' },
]

export default function App() {
  const { stops, routeCache, cacheRoute, budgetFixed, updateBudgetFixed, bookings, updateBookings, updateStops, resetToDefault, syncing, hasSupabase } = useTrip()
  const [tab, setTab] = useState('map')
  const [modal, setModal] = useState(null)
  const [mobileTab, setMobileTab] = useState('map')
  const [panelOpen, setPanelOpen] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [mapRef, setMapRef] = useState(null)

  const saveStop = useCallback((stop) => {
    updateStops(prev => prev.some(s=>s.id===stop.id) ? prev.map(s=>s.id===stop.id?stop:s) : [...prev,stop])
    setModal(null)
  }, [updateStops])

  const deleteStop = useCallback((id) => {
    if (!confirm('Remove this stop from the route?')) return
    updateStops(prev => prev.filter(s=>s.id!==id))
  }, [updateStops])

  const moveStop = useCallback((id, dir) => {
    updateStops(prev => {
      const arr=[...prev], i=arr.findIndex(s=>s.id===id)
      if(i+dir<0||i+dir>=arr.length) return prev
      ;[arr[i],arr[i+dir]]=[arr[i+dir],arr[i]]
      return arr
    })
  }, [updateStops])

  const focusStop = useCallback((stop) => {
    if (stop?.lat && window.__leafletMap) {
      window.__leafletMap.flyTo([stop.lat, stop.lng], 10, { duration: 1 })
    }
    if (window.innerWidth < 768) setMobileTab('map')
  }, [])

  const c = { // common styles
    topbar: { flexShrink:0,display:'flex',alignItems:'center',gap:10,padding:'0 14px',height:52,background:'#07111a',borderBottom:'1px solid #1e3a4a',zIndex:100 },
    tabBtn: (active) => ({ padding:'7px 13px',borderRadius:7,border:`1px solid ${active?'#ff6b35':'#1e3a4a'}`,background:active?'#1a2e3a':'transparent',color:active?'#ff6b35':'#4a6a7a',cursor:'pointer',fontFamily:'monospace',fontSize:9,letterSpacing:1,textTransform:'uppercase',whiteSpace:'nowrap',transition:'all .15s' }),
    panel: { width:320,flexShrink:0,background:'#0d1f2d',borderLeft:'1px solid #1e3a4a',display:'flex',flexDirection:'column',overflow:'hidden',transition:'width .25s' },
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>

      {/* TOPBAR */}
      <div style={c.topbar}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontFamily:'monospace',fontSize:9,letterSpacing:3,color:'#ff6b35',textTransform:'uppercase' }}>Sep 14 – Dec 14 2026 · 3 Travelers · 90 Days</div>
          <div style={{ fontSize:15,fontWeight:400,color:'#e8dcc8',lineHeight:1.1 }}>🇺🇸 Great American Road Trip</div>
        </div>

        {/* Desktop tabs */}
        <div style={{ display:'flex',gap:5,marginLeft:12 }}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={c.tabBtn(tab===t.id)}>{t.label}</button>)}
        </div>

        <div style={{ marginLeft:'auto',display:'flex',gap:6,alignItems:'center' }}>
          {syncing && <span style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a' }}>⟳ syncing</span>}
          {hasSupabase && <span style={{ fontFamily:'monospace',fontSize:9,color:'#4ade80' }}>● live</span>}
          <button onClick={()=>setModal({id:'__new__',name:'',lat:null,lng:null,days:1,hours:0,accommodation:'',accommodationNotes:'',budget_per_day:0,activities:[],notes:'',mustSee:[]})}
            style={{ padding:'7px 13px',background:'#ff6b35',color:'#07111a',border:'none',borderRadius:7,fontFamily:'monospace',fontSize:9,fontWeight:700,cursor:'pointer',letterSpacing:1,textTransform:'uppercase' }}>
            + Add Stop
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1,display:'flex',overflow:'hidden',position:'relative' }}>

        {/* MAP always rendered (hidden when not active on desktop) */}
        {(tab==='map' || tab==='stops') && (
          <div style={{ flex:1,display:'flex',overflow:'hidden' }}>
            <MapView
              stops={stops}
              routeCache={routeCache}
              cacheRoute={cacheRoute}
              onEdit={stop=>setModal(stop)}
              onDelete={deleteStop}
            />
            {tab==='stops' && (
              <div style={{ ...c.panel, width: panelOpen?320:0 }}>
                <div style={{ display:'flex',alignItems:'center',padding:'8px 12px',borderBottom:'1px solid #1e3a4a',flexShrink:0 }}>
                  <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:1,flex:1 }}>Stops</span>
                  <button onClick={()=>setPanelOpen(p=>!p)} style={{ background:'none',border:'none',color:'#4a6a7a',cursor:'pointer',fontSize:16,padding:'2px 4px',lineHeight:1 }}>{panelOpen?'›':'‹'}</button>
                </div>
                {panelOpen && (
                  <StopsPanel
                    stops={stops}
                    routeCache={routeCache}
                    onEdit={stop=>setModal(stop)}
                    onDelete={deleteStop}
                    onMove={moveStop}
                    onAdd={()=>setModal({id:'__new__'+Date.now(),name:'',lat:null,lng:null,days:1,hours:0,accommodation:'',accommodationNotes:'',budget_per_day:0,activities:[],notes:'',mustSee:[]})}
                    onReset={()=>confirm('Reset to the suggested route? Your changes will be lost.')&&resetToDefault()}
                    onFocus={focusStop}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {tab==='budget' && (
          <div style={{ flex:1,overflowY:'auto' }}>
            <BudgetTab stops={stops} budgetFixed={budgetFixed} updateBudgetFixed={updateBudgetFixed}/>
          </div>
        )}

        {tab==='bookings' && (
          <div style={{ flex:1,overflowY:'auto' }}>
            <BookingsTab stops={stops} bookings={bookings} updateBookings={updateBookings}/>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div style={{ display:'none' }}>
        {/* handled via CSS media query — kept simple for now */}
      </div>

      {/* STOP MODAL */}
      {modal && (
        <StopModal
          stop={modal}
          stops={stops}
          onSave={saveStop}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  )
}
