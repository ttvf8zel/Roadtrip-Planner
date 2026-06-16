import { useEffect, useState } from 'react'
import { ACTIVITIES, ACCOMM, LANDMARKS } from '../data'
import { BookingCard, EmptyBookingForm } from './BookingsTab'

const DKK = n => (n || 0).toLocaleString('da-DK') + ' kr'

export default function StopDetail({ stop, bookings, imageCache, cacheImage, onBack, onEdit, addBooking, deleteBooking }) {
  const [img, setImg] = useState(imageCache[stop.id])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (imageCache[stop.id] !== undefined) { setImg(imageCache[stop.id]); return }
    const landmark = LANDMARKS[stop.id] || stop.name.split(',')[0]
    let cancelled = false
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmark)}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (cancelled) return
        const url = j?.originalimage?.source || j?.thumbnail?.source || null
        setImg(url)
        cacheImage(stop.id, url)
      })
      .catch(() => { if (!cancelled) { setImg(null); cacheImage(stop.id, null) } })
    return () => { cancelled = true }
  }, [stop.id])

  const acts = ACTIVITIES.filter(a => (stop.activities || []).includes(a.id))
  const stopBookings = bookings || []
  const totalBooked = stopBookings.filter(b => b.status === 'booked' || b.status === 'paid').reduce((s, b) => s + (+b.price || 0), 0)

  return (
    <div style={{ position: 'relative', flex: 1, overflowY: 'auto', background: '#07111a' }}>
      {/* Background image */}
      {img && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.3, pointerEvents: 'none',
        }} />
      )}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(7,17,26,.55) 0%, rgba(7,17,26,.85) 45%, rgba(7,17,26,.97) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={onBack} style={{ padding: '8px 14px', background: 'rgba(13,31,45,.85)', border: '1px solid #1e3a4a', borderRadius: 8, color: '#e8dcc8', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }}>← Back</button>
          <button onClick={() => onEdit(stop)} style={{ padding: '8px 14px', background: '#ff6b35', border: 'none', borderRadius: 8, color: '#07111a', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit Stop</button>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#ff6b35', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            {LANDMARKS[stop.id] || ''}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, color: '#e8dcc8', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>{stop.name}</h1>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '16px 0' }}>
          <div style={statBox}>
            <div style={statVal}>📅 {stop.days}d{stop.hours > 0 ? ` +${stop.hours}h` : ''}</div>
            <div style={statLbl}>Time at stop</div>
          </div>
          {stop.budget_per_day > 0 && (
            <div style={statBox}>
              <div style={statVal}>💰 {DKK(stop.budget_per_day)}/day</div>
              <div style={statLbl}>Budget per person</div>
            </div>
          )}
          {stop.accommodation && (
            <div style={statBox}>
              <div style={statVal}>{ACCOMM.find(a => a.id === stop.accommodation)?.label || ''}</div>
              <div style={statLbl}>Accommodation</div>
            </div>
          )}
        </div>

        {stop.accommodationNotes && (
          <div style={{ ...card, marginBottom: 14, borderColor: '#2a4a5a' }}>
            <div style={lblStyle}>Accommodation Notes</div>
            <div style={{ fontSize: 13, color: '#e8dcc8', lineHeight: 1.6 }}>{stop.accommodationNotes}</div>
          </div>
        )}

        {acts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {acts.map(a => (
              <span key={a.id} style={{ padding: '5px 12px', borderRadius: 14, fontSize: 11, background: a.color + '22', color: a.color, border: `1px solid ${a.color}55`, fontFamily: 'monospace' }}>{a.label}</span>
            ))}
          </div>
        )}

        {stop.notes && (
          <div style={{ ...card, marginBottom: 14 }}>
            <div style={lblStyle}>Notes & Vibes</div>
            <div style={{ fontSize: 14, color: '#e8dcc8', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>{stop.notes}</div>
          </div>
        )}

        {(stop.mustSee || []).length > 0 && (
          <div style={{ ...card, marginBottom: 14 }}>
            <div style={lblStyle}>Must-Do's & Specific Spots</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {stop.mustSee.map((m, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 12, fontSize: 11, background: '#122012', color: '#4ade80', border: '1px solid #2a4a2a', fontFamily: 'monospace' }}>📍 {m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bookings */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a6a7a', textTransform: 'uppercase', letterSpacing: 2 }}>Bookings</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {totalBooked > 0 && <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#4ade80' }}>✅ {DKK(totalBooked)}</span>}
              <button onClick={() => setAdding(true)} style={{ padding: '5px 12px', background: '#ff6b35', color: '#07111a', border: 'none', borderRadius: 6, fontFamily: 'monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
            </div>
          </div>

          {adding && <EmptyBookingForm stopId={stop.id} onSave={b => { addBooking(b); setAdding(false) }} onCancel={() => setAdding(false)} />}

          {stopBookings.length === 0 && !adding && (
            <div style={{ ...card, textAlign: 'center', color: '#4a6a7a', fontFamily: 'monospace', fontSize: 11, padding: '20px 0' }}>No bookings yet — tap + Add</div>
          )}
          {stopBookings.map(b => <BookingCard key={b.id} booking={b} onDelete={id => deleteBooking(stop.id, id)} />)}
        </div>
      </div>
    </div>
  )
}

const card = { background: 'rgba(7,17,26,.8)', border: '1px solid #1e3a4a', borderRadius: 10, padding: '12px 14px' }
const lblStyle = { fontFamily: 'monospace', fontSize: 9, color: '#4a6a7a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }
const statBox = { ...card, padding: '10px 16px', textAlign: 'center', flex: '1 1 140px' }
const statVal = { fontSize: 14, color: '#e8dcc8', marginBottom: 3, whiteSpace: 'nowrap' }
const statLbl = { fontFamily: 'monospace', fontSize: 9, color: '#4a6a7a', textTransform: 'uppercase', letterSpacing: 1 }
