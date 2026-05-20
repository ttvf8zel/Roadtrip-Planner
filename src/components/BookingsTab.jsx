import { useState } from 'react'

const uid = () => Date.now() + '' + Math.random()

const BOOKING_TYPES = [
  { id:'hotel',    label:'🏨 Hotel/Motel',    color:'#60a5fa' },
  { id:'airbnb',   label:'🏠 Airbnb',         color:'#f97316' },
  { id:'hostel',   label:'🛏️ Hostel',         color:'#c084fc' },
  { id:'camping',  label:'⛺ Camping',        color:'#4ade80' },
  { id:'activity', label:'🎟️ Activity/Tour',  color:'#facc15' },
  { id:'transport',label:'🚌 Transport',       color:'#22d3ee' },
  { id:'restaurant',label:'🍽️ Restaurant',    color:'#f472b6' },
  { id:'other',    label:'📌 Other',           color:'#fb923c' },
]

const STATUS = [
  { id:'planned',  label:'📋 Planned',    color:'#4a6a7a' },
  { id:'booked',   label:'✅ Booked',     color:'#4ade80' },
  { id:'paid',     label:'💰 Paid',       color:'#60a5fa' },
  { id:'cancelled',label:'❌ Cancelled',  color:'#f87171' },
]

function EmptyBookingForm({ stopId, onSave, onCancel }) {
  const [d, setD] = useState({ id: uid(), stopId, type:'activity', status:'planned', name:'', date:'', time:'', confirmRef:'', price:'', notes:'', paidBy:'' })
  const set = p => setD(prev=>({...prev,...p}))
  const inp = { width:'100%',padding:'9px 11px',background:'#08131c',border:'1px solid #1e3a4a',borderRadius:7,color:'#e8dcc8',fontSize:12,fontFamily:'Georgia,serif',outline:'none' }
  const lbl = { fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:1.5,marginBottom:4,display:'block' }

  return (
    <div style={{ background:'#07111a',border:'1px solid #ff6b35',borderRadius:10,padding:14,marginBottom:10 }}>
      <div style={{ fontFamily:'monospace',fontSize:10,color:'#ff6b35',marginBottom:12 }}>+ NEW BOOKING</div>
      <div style={{ marginBottom:10 }}>
        <label style={lbl}>Type</label>
        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
          {BOOKING_TYPES.map(t=>(
            <button key={t.id} onClick={()=>set({type:t.id})} style={{ padding:'5px 10px',borderRadius:14,fontFamily:'monospace',fontSize:10,cursor:'pointer',border:`1px solid ${d.type===t.id?t.color:'#1e3a4a'}`,background:d.type===t.id?t.color+'33':'transparent',color:d.type===t.id?t.color:'#4a6a7a' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <label style={lbl}>Status</label>
        <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
          {STATUS.map(s=>(
            <button key={s.id} onClick={()=>set({status:s.id})} style={{ padding:'5px 10px',borderRadius:14,fontFamily:'monospace',fontSize:10,cursor:'pointer',border:`1px solid ${d.status===s.id?s.color:'#1e3a4a'}`,background:d.status===s.id?s.color+'22':'transparent',color:d.status===s.id?s.color:'#4a6a7a' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:8 }}>
        <label style={lbl}>Name / Title</label>
        <input style={inp} placeholder="e.g. Hotel Zaza, Antelope Canyon Upper Tour…" value={d.name} onChange={e=>set({name:e.target.value})}/>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
        <div><label style={lbl}>Date</label><input type="date" style={inp} value={d.date} onChange={e=>set({date:e.target.value})}/></div>
        <div><label style={lbl}>Time</label><input type="time" style={inp} value={d.time} onChange={e=>set({time:e.target.value})}/></div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
        <div><label style={lbl}>Confirmation / Booking Ref</label><input style={inp} placeholder="e.g. ABC123456" value={d.confirmRef} onChange={e=>set({confirmRef:e.target.value})}/></div>
        <div><label style={lbl}>Price (DKK total)</label><input type="number" style={inp} placeholder="e.g. 2400" value={d.price} onChange={e=>set({price:e.target.value})}/></div>
      </div>
      <div style={{ marginBottom:8 }}>
        <label style={lbl}>Paid by</label>
        <input style={inp} placeholder="e.g. Rasmus — to split later" value={d.paidBy} onChange={e=>set({paidBy:e.target.value})}/>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={lbl}>Notes</label>
        <textarea style={{ ...inp,resize:'vertical',fontFamily:'Georgia,serif' }} rows={2} placeholder="Check-in time, address, what to bring…" value={d.notes} onChange={e=>set({notes:e.target.value})}/>
      </div>
      <div style={{ display:'flex',gap:8 }}>
        <button onClick={()=>{if(!d.name.trim()){alert('Please enter a name');return};onSave(d)}} style={{ flex:1,padding:'10px',background:'#ff6b35',color:'#07111a',border:'none',borderRadius:8,fontFamily:'monospace',fontSize:12,fontWeight:700,cursor:'pointer' }}>Save Booking</button>
        <button onClick={onCancel} style={{ padding:'10px 14px',background:'transparent',color:'#4a6a7a',border:'1px solid #1e3a4a',borderRadius:8,fontFamily:'monospace',fontSize:11,cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

function BookingCard({ booking, onDelete, onEdit }) {
  const type = BOOKING_TYPES.find(t=>t.id===booking.type) || BOOKING_TYPES[7]
  const status = STATUS.find(s=>s.id===booking.status) || STATUS[0]
  return (
    <div style={{ background:'#07111a',border:`1px solid ${type.color}44`,borderRadius:9,padding:'10px 12px',marginBottom:7 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:3 }}>
            <span style={{ fontSize:11,background:type.color+'22',color:type.color,border:`1px solid ${type.color}44`,padding:'1px 7px',borderRadius:8,fontFamily:'monospace' }}>{type.label}</span>
            <span style={{ fontSize:11,background:status.color+'22',color:status.color,border:`1px solid ${status.color}44`,padding:'1px 7px',borderRadius:8,fontFamily:'monospace' }}>{status.label}</span>
          </div>
          <div style={{ fontSize:13,color:'#e8dcc8',fontWeight:600,marginBottom:3 }}>{booking.name}</div>
          <div style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a',display:'flex',gap:12,flexWrap:'wrap' }}>
            {booking.date&&<span>📅 {booking.date}{booking.time?` · ${booking.time}`:''}</span>}
            {booking.confirmRef&&<span>🔖 {booking.confirmRef}</span>}
            {booking.price&&<span>💰 {Number(booking.price).toLocaleString('da-DK')} kr</span>}
            {booking.paidBy&&<span>👤 {booking.paidBy}</span>}
          </div>
          {booking.notes&&<div style={{ fontSize:11,color:'#4a6a7a',fontStyle:'italic',marginTop:4 }}>{booking.notes}</div>}
        </div>
        <div style={{ display:'flex',gap:4,flexShrink:0 }}>
          <button onClick={()=>onDelete(booking.id)} style={{ padding:'3px 7px',background:'#2a0e0e',border:'none',borderRadius:5,color:'#f87171',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>🗑</button>
        </div>
      </div>
    </div>
  )
}

export default function BookingsTab({ stops, bookings, updateBookings }) {
  const [addingTo, setAddingTo] = useState(null)
  const [collapsed, setCollapsed] = useState({})

  const addBooking = (booking) => {
    updateBookings(prev => ({ ...prev, [booking.stopId]: [...(prev[booking.stopId]||[]), booking] }))
    setAddingTo(null)
  }
  const deleteBooking = (stopId, bookingId) => {
    updateBookings(prev => ({ ...prev, [stopId]: (prev[stopId]||[]).filter(b=>b.id!==bookingId) }))
  }
  const toggle = id => setCollapsed(prev=>({...prev,[id]:!prev[id]}))

  const totalBooked = stops.reduce((sum,s) => {
    return sum + (bookings[s.id]||[]).filter(b=>b.status==='booked'||b.status==='paid').reduce((s,b)=>s+(+b.price||0),0)
  }, 0)

  return (
    <div style={{ padding:14,overflowY:'auto',height:'100%' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
        <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:2 }}>All Bookings</div>
        <div style={{ fontFamily:'monospace',fontSize:10,color:'#4ade80' }}>✅ Total booked: {totalBooked.toLocaleString('da-DK')} kr</div>
      </div>

      {stops.map((s, i) => {
        const stopBookings = bookings[s.id] || []
        const isCollapsed = collapsed[s.id]
        return (
          <div key={s.id} style={{ marginBottom:12 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',padding:'8px 12px',background:'#0d1f2d',border:'1px solid #1e3a4a',borderRadius:isCollapsed?9:'9px 9px 0 0' }} onClick={()=>toggle(s.id)}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:20,height:20,borderRadius:'50%',background:'#ff6b35',color:'#07111a',fontFamily:'monospace',fontSize:9,fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center' }}>{i+1}</span>
                <span style={{ fontSize:13,color:'#e8dcc8',fontWeight:600 }}>{s.name.split(',')[0]}</span>
                {stopBookings.length>0&&<span style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a' }}>{stopBookings.length} booking{stopBookings.length!==1?'s':''}</span>}
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <button onClick={e=>{e.stopPropagation();setAddingTo(s.id);setCollapsed(p=>({...p,[s.id]:false}))}} style={{ padding:'3px 10px',background:'#ff6b35',color:'#07111a',border:'none',borderRadius:6,fontFamily:'monospace',fontSize:9,fontWeight:700,cursor:'pointer' }}>+ Add</button>
                <span style={{ color:'#4a6a7a',fontSize:12 }}>{isCollapsed?'▶':'▼'}</span>
              </div>
            </div>
            {!isCollapsed && (
              <div style={{ border:'1px solid #1e3a4a',borderTop:'none',borderRadius:'0 0 9px 9px',padding:'10px 12px',background:'#07111a' }}>
                {addingTo===s.id && <EmptyBookingForm stopId={s.id} onSave={addBooking} onCancel={()=>setAddingTo(null)}/>}
                {stopBookings.length===0 && addingTo!==s.id && (
                  <div style={{ textAlign:'center',padding:'16px 0',color:'#4a6a7a',fontFamily:'monospace',fontSize:11 }}>No bookings yet — tap + Add</div>
                )}
                {stopBookings.map(b => <BookingCard key={b.id} booking={b} onDelete={id=>deleteBooking(s.id,id)}/>)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
