import { useState } from 'react'

const DKK = n => Math.round(n).toLocaleString('da-DK') + ' kr'

function matchTraveler(paidBy, travelers) {
  if (!paidBy) return null
  const lower = paidBy.toLowerCase()
  return travelers.find(t => lower.includes(t.toLowerCase())) ?? null
}

function settleDebts(balances) {
  const entries = Object.entries(balances).map(([name, bal]) => ({ name, bal }))
  const creditors = entries.filter(e => e.bal > 0.5).sort((a, b) => b.bal - a.bal)
  const debtors   = entries.filter(e => e.bal < -0.5).sort((a, b) => a.bal - b.bal)
  const txns = []
  let ci = 0, di = 0
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci], d = debtors[di]
    const amount = Math.min(c.bal, -d.bal)
    txns.push({ from: d.name, to: c.name, amount })
    c.bal -= amount
    d.bal += amount
    if (c.bal < 0.5) ci++
    if (d.bal > -0.5) di++
  }
  return txns
}

const COLORS = ['#60a5fa', '#4ade80', '#f97316']

export default function SplitterTab({ stops, bookings, travelers, updateTravelers }) {
  const [editingIdx, setEditingIdx] = useState(null)
  const [editVal, setEditVal] = useState('')

  // Gather all bookings with a price
  const allBookings = stops.flatMap(s =>
    (bookings[s.id] || [])
      .filter(b => +b.price > 0)
      .map(b => ({ ...b, stopName: s.name.split(',')[0] }))
  )

  const paid = Object.fromEntries(travelers.map(t => [t, 0]))
  const unmatched = []

  for (const b of allBookings) {
    const t = matchTraveler(b.paidBy, travelers)
    if (t) paid[t] += +b.price
    else unmatched.push(b)
  }

  const total = Object.values(paid).reduce((s, v) => s + v, 0)
  const fairShare = total / travelers.length
  const balances = Object.fromEntries(travelers.map(t => [t, paid[t] - fairShare]))
  const settlements = settleDebts({ ...balances })

  const inp = {
    background: '#08131c', border: '1px solid #ff6b35', borderRadius: 6,
    color: '#e8dcc8', fontFamily: 'monospace', fontSize: 13, padding: '5px 9px',
    outline: 'none', width: 130,
  }

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%', maxWidth: 700, margin: '0 auto' }}>

      {/* Traveler names */}
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a6a7a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
        Travelers — tap a name to edit
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {travelers.map((t, i) => (
          editingIdx === i ? (
            <form key={i} onSubmit={e => { e.preventDefault(); updateTravelers(prev => prev.map((x, j) => j === i ? editVal.trim() || x : x)); setEditingIdx(null) }} style={{ display: 'flex', gap: 5 }}>
              <input autoFocus style={inp} value={editVal} onChange={e => setEditVal(e.target.value)} />
              <button type="submit" style={{ padding: '5px 10px', background: '#ff6b35', border: 'none', borderRadius: 6, color: '#07111a', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓</button>
            </form>
          ) : (
            <button key={i} onClick={() => { setEditingIdx(i); setEditVal(t) }}
              style={{ padding: '6px 16px', borderRadius: 20, border: `2px solid ${COLORS[i]}`, background: COLORS[i] + '22', color: COLORS[i], fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✏️ {t}
            </button>
          )
        ))}
      </div>

      {/* Per-person totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {travelers.map((t, i) => {
          const bal = balances[t]
          const isCreditor = bal > 0.5
          const isDebtor = bal < -0.5
          return (
            <div key={t} style={{ background: '#07111a', border: `1px solid ${COLORS[i]}44`, borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[i], marginBottom: 6 }}>{t}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e8dcc8', marginBottom: 3 }}>Paid: {DKK(paid[t])}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a6a7a', marginBottom: 8 }}>Share: {DKK(fairShare)}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                color: isCreditor ? '#4ade80' : isDebtor ? '#f87171' : '#4a6a7a',
                padding: '4px 0', borderTop: '1px solid #1e3a4a',
              }}>
                {isCreditor ? `+${DKK(bal)} owed` : isDebtor ? `${DKK(bal)} owes` : '✓ Even'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Settlements */}
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a6a7a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
        How to settle up
      </div>
      <div style={{ background: '#07111a', border: '1px solid #1e3a4a', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
        {settlements.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#4ade80', fontFamily: 'monospace', fontSize: 12, padding: '8px 0' }}>✅ Everyone's square!</div>
        ) : settlements.map((tx, i) => {
          const fromIdx = travelers.indexOf(tx.from)
          const toIdx = travelers.indexOf(tx.to)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < settlements.length - 1 ? '1px solid #1e3a4a' : 'none' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: fromIdx >= 0 ? COLORS[fromIdx] : '#e8dcc8' }}>{tx.from}</span>
              <span style={{ color: '#4a6a7a', fontFamily: 'monospace', fontSize: 11 }}>pays</span>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: toIdx >= 0 ? COLORS[toIdx] : '#e8dcc8' }}>{tx.to}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#ff6b35' }}>{DKK(tx.amount)}</span>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#122012', border: '1px solid #2a4a2a', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4ade80' }}>Total tracked spend</span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4ade80', fontWeight: 700 }}>{DKK(total)}</span>
      </div>

      {/* Unmatched bookings */}
      {unmatched.length > 0 && (
        <>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#f87171', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            ⚠️ Unmatched — payer name didn't match any traveler ({unmatched.length})
          </div>
          {unmatched.map(b => (
            <div key={b.id} style={{ background: '#07111a', border: '1px solid #2a1a1a', borderRadius: 8, padding: '8px 12px', marginBottom: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#e8dcc8' }}>{b.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a6a7a' }}>{b.stopName} · paidBy: "{b.paidBy || 'not set'}"</div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#f87171' }}>{DKK(+b.price)}</div>
            </div>
          ))}
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a6a7a', marginTop: 6, marginBottom: 16 }}>
            Tip: set the "Paid by" field on bookings to a traveler name (e.g. "Rasmus") so they're included in the split.
          </div>
        </>
      )}
    </div>
  )
}
