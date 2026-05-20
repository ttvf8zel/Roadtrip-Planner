import { useState } from 'react'
import { ACTIVITIES, ACCOMM, CITIES } from '../data'

const s = {
  overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:2000 },
  modal: { background:'#0d1f2d',borderRadius:'18px 18px 0 0',border:'1px solid #1e3a4a',borderBottom:'none',width:'100%',maxWidth:580,maxHeight:'92vh',overflowY:'auto',padding:'8px 20px 44px' },
  handle: { width:36,height:4,background:'#1e3a4a',borderRadius:2,margin:'8px auto 14px' },
  lbl: { fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:2,marginBottom:5,display:'block' },
  inp: { width:'100%',padding:'10px 12px',background:'#08131c',border:'1px solid #1e3a4a',borderRadius:8,color:'#e8dcc8',fontSize:13,fontFamily:'Georgia,serif',outline:'none',WebkitAppearance:'none' },
  chip: (on, color) => ({ padding:'7px 11px',borderRadius:18,cursor:'pointer',fontFamily:'monospace',fontSize:10,border:`1px solid ${on ? color : '#1e3a4a'}`,background: on ? color+'33' : 'transparent',color: on ? color : '#4a6a7a',minHeight:32 }),
  row2: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 },
  fg: { marginBottom:14 },
  btnP: { flex:1,padding:13,background:'#ff6b35',color:'#07111a',border:'none',borderRadius:10,fontFamily:'monospace',fontSize:13,fontWeight:700,cursor:'pointer',minHeight:48 },
  btnS: { padding:'13px 16px',background:'transparent',color:'#4a6a7a',border:'1px solid #1e3a4a',borderRadius:10,fontFamily:'monospace',fontSize:12,cursor:'pointer' },
}

export default function StopModal({ stop, stops, onSave, onClose }) {
  const [d, setD] = useState({ mustSee: [], activities: [], ...stop })
  const [q, setQ] = useState('')
  const [mustInput, setMustInput] = useState('')
  const isEdit = stops.some(x => x.id === stop.id)
  const sugg = CITIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)

  const set = patch => setD(prev => ({ ...prev, ...patch }))
  const toggle = (field, val) => setD(prev => ({ ...prev, [field]: prev[field]?.includes(val) ? prev[field].filter(x => x !== val) : [...(prev[field] || []), val] }))

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.handle} />
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <h2 style={{ fontSize:16,fontWeight:400,color:'#e8dcc8' }}>{isEdit ? '✏️ Edit Stop' : '📍 Add Stop'}</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'#4a6a7a',fontSize:22,cursor:'pointer',padding:4 }}>✕</button>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>City / Location</label>
          <input style={s.inp} placeholder="Search cities or type a name…" value={q || d.name}
            onChange={e => { setQ(e.target.value); set({ name: e.target.value, lat: null, lng: null }) }} autoComplete="off" />
          {q && sugg.length > 0 && (
            <div style={{ background:'#07121c',border:'1px solid #1e3a4a',borderRadius:8,marginTop:4,maxHeight:190,overflowY:'auto' }}>
              {sugg.map(c => (
                <div key={c.name} onClick={() => { set({ name: c.name, lat: c.lat, lng: c.lng }); setQ('') }}
                  style={{ padding:'11px 14px',cursor:'pointer',fontSize:12,borderBottom:'1px solid #1a2e3a',color:'#e8dcc8' }}
                  onMouseEnter={e => e.currentTarget.style.background='#1e3a4a'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  {c.name}
                </div>
              ))}
            </div>
          )}
          {d.lat && !q && <div style={{ fontFamily:'monospace',fontSize:10,color:'#4ade80',marginTop:4 }}>✓ {d.name}</div>}
        </div>

        <div style={{ ...s.row2, ...s.fg }}>
          <div><label style={s.lbl}>Days at stop</label><input type="number" style={s.inp} min={0} max={90} value={d.days} onChange={e => set({ days: +e.target.value })} /></div>
          <div><label style={s.lbl}>Extra hours</label><input type="number" style={s.inp} min={0} max={23} value={d.hours} onChange={e => set({ hours: +e.target.value })} /></div>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Accommodation</label>
          <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:8 }}>
            {ACCOMM.map(a => (
              <button key={a.id} onClick={() => set({ accommodation: d.accommodation === a.id ? '' : a.id })}
                style={{ ...s.chip(d.accommodation === a.id, '#60a5fa'), borderColor: d.accommodation === a.id ? '#60a5fa' : '#1e3a4a', background: d.accommodation === a.id ? '#1e3a4a' : 'transparent', color: d.accommodation === a.id ? '#e8dcc8' : '#4a6a7a' }}>
                {a.label}
              </button>
            ))}
          </div>
          <input style={s.inp} placeholder="Hotel name, booking notes, confirmation…" value={d.accommodationNotes || ''} onChange={e => set({ accommodationNotes: e.target.value })} />
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Activity Types</label>
          <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
            {ACTIVITIES.map(a => <button key={a.id} onClick={() => toggle('activities', a.id)} style={s.chip((d.activities||[]).includes(a.id), a.color)}>{a.label}</button>)}
          </div>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Must-Do's & Specific Spots</label>
          <div style={{ display:'flex',gap:7,marginBottom:7 }}>
            <input style={{ ...s.inp, flex:1 }} placeholder="e.g. South Rim hike, Café Du Monde…" value={mustInput}
              onChange={e => setMustInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && mustInput.trim()) { set({ mustSee: [...(d.mustSee||[]), mustInput.trim()] }); setMustInput('') }}} />
            <button onClick={() => { if (mustInput.trim()) { set({ mustSee: [...(d.mustSee||[]), mustInput.trim()] }); setMustInput('') }}}
              style={{ padding:'0 14px',background:'#1e3a4a',color:'#e8dcc8',border:'1px solid #2e5a6a',borderRadius:8,fontFamily:'monospace',fontSize:12,minHeight:42 }}>Add</button>
          </div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
            {(d.mustSee||[]).map((m, i) => (
              <span key={i} onClick={() => set({ mustSee: d.mustSee.filter((_,j) => j !== i) })}
                style={{ padding:'4px 10px',borderRadius:10,fontSize:10,background:'#122012',color:'#4ade80',border:'1px solid #2a4a2a',fontFamily:'monospace',cursor:'pointer' }}>
                📍 {m} ✕
              </span>
            ))}
          </div>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Daily Budget / Person (DKK)</label>
          <input type="number" style={s.inp} placeholder="e.g. 800" value={d.budget_per_day || ''} onChange={e => set({ budget_per_day: +e.target.value })} />
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Notes & Vibes</label>
          <textarea style={{ ...s.inp, resize:'vertical', fontFamily:'Georgia,serif', marginBottom:0 }} rows={3} value={d.notes || ''} onChange={e => set({ notes: e.target.value })} placeholder="Tips, who's driving, things to avoid…" />
        </div>

        <div style={{ display:'flex',gap:9,marginTop:20 }}>
          <button style={s.btnP} onClick={() => { if (!d.name?.trim()) { alert('Please enter a city name'); return }; onSave(d) }}>{isEdit ? 'Save Changes' : 'Add to Route'}</button>
          <button style={s.btnS} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
