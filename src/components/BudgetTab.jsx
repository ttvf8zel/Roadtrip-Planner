import { useState } from 'react'

const DKK = n => n?.toLocaleString('da-DK') + ' kr'

export default function BudgetTab({ stops, budgetFixed, updateBudgetFixed }) {
  const [editingFixed, setEditingFixed] = useState(null)
  const [editingStop, setEditingStop] = useState(null)

  const totalFixedEst = budgetFixed.reduce((s,x) => s+(x.estimated||0), 0)
  const totalFixedAct = budgetFixed.reduce((s,x) => s+(x.actual!=null?x.actual:x.estimated||0), 0)
  const totalDailyEst = stops.reduce((s,x) => s+(x.budget_per_day||0)*(x.days||1), 0)
  const budget = 80000

  const spent = totalFixedAct + totalDailyEst
  const remaining = budget - spent
  const pct = Math.min(100, Math.round((spent/budget)*100))

  return (
    <div style={{ padding:14,overflowY:'auto',height:'100%' }}>

      {/* Budget bar */}
      <div style={{ background:'#07111a',border:'1px solid #1e3a4a',borderRadius:10,padding:'14px 16px',marginBottom:14 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
          <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:1 }}>Budget per person</span>
          <span style={{ fontFamily:'monospace',fontSize:11,color:'#ff6b35' }}>{DKK(spent)} / {DKK(budget)}</span>
        </div>
        <div style={{ height:8,background:'#1e3a4a',borderRadius:4,overflow:'hidden' }}>
          <div style={{ height:'100%',width:pct+'%',background:pct>90?'#f87171':pct>75?'#facc15':'#4ade80',borderRadius:4,transition:'width .3s' }}/>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
          <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a' }}>{pct}% used</span>
          <span style={{ fontFamily:'monospace',fontSize:10,color:remaining<0?'#f87171':'#4ade80' }}>{remaining>=0?'Remaining: ':'Over budget: '}{DKK(Math.abs(remaining))}</span>
        </div>
      </div>

      {/* Fixed costs */}
      <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:2,marginBottom:8 }}>Fixed Costs (per person)</div>
      {budgetFixed.map(item => (
        <div key={item.id} style={{ background:'#07111a',border:'1px solid #1e3a4a',borderRadius:8,padding:'10px 12px',marginBottom:6 }}>
          {editingFixed === item.id ? (
            <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
              <div style={{ fontSize:12,color:'#e8dcc8' }}>{item.label}</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                <div>
                  <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',marginBottom:3 }}>ESTIMATED (DKK)</div>
                  <input type="number" defaultValue={item.estimated} id={`est-${item.id}`}
                    style={{ width:'100%',padding:'7px 9px',background:'#08131c',border:'1px solid #1e3a4a',borderRadius:6,color:'#e8dcc8',fontSize:12,fontFamily:'Georgia,serif',outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',marginBottom:3 }}>ACTUAL (DKK)</div>
                  <input type="number" defaultValue={item.actual??''} placeholder="Not paid yet" id={`act-${item.id}`}
                    style={{ width:'100%',padding:'7px 9px',background:'#08131c',border:'1px solid #1e3a4a',borderRadius:6,color:'#e8dcc8',fontSize:12,fontFamily:'Georgia,serif',outline:'none' }}/>
                </div>
              </div>
              <input defaultValue={item.notes} id={`notes-${item.id}`} placeholder="Notes…"
                style={{ width:'100%',padding:'7px 9px',background:'#08131c',border:'1px solid #1e3a4a',borderRadius:6,color:'#e8dcc8',fontSize:11,fontFamily:'Georgia,serif',outline:'none' }}/>
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={() => {
                  const est = +document.getElementById(`est-${item.id}`).value
                  const actVal = document.getElementById(`act-${item.id}`).value
                  const notes = document.getElementById(`notes-${item.id}`).value
                  updateBudgetFixed(prev => prev.map(x => x.id===item.id ? {...x, estimated:est, actual:actVal?+actVal:null, notes} : x))
                  setEditingFixed(null)
                }} style={{ padding:'6px 14px',background:'#ff6b35',color:'#07111a',border:'none',borderRadius:6,fontFamily:'monospace',fontSize:10,fontWeight:700,cursor:'pointer' }}>Save</button>
                <button onClick={()=>setEditingFixed(null)} style={{ padding:'6px 12px',background:'transparent',color:'#4a6a7a',border:'1px solid #1e3a4a',borderRadius:6,fontFamily:'monospace',fontSize:10,cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer' }} onClick={()=>setEditingFixed(item.id)}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12,color:'#e8dcc8',marginBottom:2 }}>{item.label}</div>
                {item.notes && <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a' }}>{item.notes}</div>}
              </div>
              <div style={{ textAlign:'right',flexShrink:0,marginLeft:12 }}>
                {item.actual != null ? (
                  <div style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80' }}>{DKK(item.actual)} <span style={{ color:'#4a6a7a',textDecoration:'line-through',fontSize:9 }}>{DKK(item.estimated)}</span></div>
                ) : (
                  <div style={{ fontFamily:'monospace',fontSize:11,color:'#ff6b35' }}>{DKK(item.estimated)}</div>
                )}
                <div style={{ fontFamily:'monospace',fontSize:8,color:'#2a4a5a' }}>tap to edit</div>
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ display:'flex',justifyContent:'space-between',background:'#122012',border:'1px solid #2a4a2a',borderRadius:8,padding:'9px 12px',marginBottom:16 }}>
        <span style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80' }}>Fixed costs total</span>
        <span style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80' }}>{DKK(totalFixedAct)}</span>
      </div>

      {/* Per-city daily budgets */}
      <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:2,marginBottom:8 }}>Daily Budget per Stop</div>
      {stops.filter(s=>s.name).map((s,i) => (
        <div key={s.id} style={{ background:'#07111a',border:'1px solid #1e3a4a',borderRadius:8,padding:'10px 12px',marginBottom:5 }}>
          {editingStop === s.id ? (
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ flex:1,fontSize:12,color:'#e8dcc8' }}>{s.name.split(',')[0]}</div>
              <input type="number" id={`stop-bdg-${s.id}`} defaultValue={s.budget_per_day||0}
                style={{ width:100,padding:'6px 8px',background:'#08131c',border:'1px solid #ff6b35',borderRadius:6,color:'#e8dcc8',fontSize:12,fontFamily:'Georgia,serif',outline:'none' }}/>
              <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a' }}>kr/dag</span>
              <button onClick={() => { /* handled by parent */ setEditingStop(null) }}
                style={{ padding:'5px 10px',background:'transparent',border:'1px solid #1e3a4a',borderRadius:5,color:'#4a6a7a',fontFamily:'monospace',fontSize:9,cursor:'pointer' }}>✕</button>
            </div>
          ) : (
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }} onClick={()=>setEditingStop(s.id)}>
              <div>
                <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                  <span style={{ width:18,height:18,borderRadius:'50%',background:'#ff6b35',color:'#07111a',fontFamily:'monospace',fontSize:9,fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center' }}>{i+1}</span>
                  <span style={{ fontSize:12,color:'#e8dcc8' }}>{s.name.split(',')[0]}</span>
                </div>
                <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',marginTop:2,paddingLeft:25 }}>{s.days}d × {DKK(s.budget_per_day||0)} = {DKK((s.budget_per_day||0)*s.days)}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'monospace',fontSize:11,color:'#ff6b35' }}>{DKK((s.budget_per_day||0)*s.days)}</div>
                <div style={{ fontFamily:'monospace',fontSize:8,color:'#2a4a5a' }}>tap to edit</div>
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ display:'flex',justifyContent:'space-between',background:'#122012',border:'1px solid #2a4a2a',borderRadius:8,padding:'9px 12px',marginBottom:8 }}>
        <span style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80' }}>Daily spending total</span>
        <span style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80' }}>{DKK(totalDailyEst)}</span>
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',background:'#1a2e1a',border:'1px solid #2a5a2a',borderRadius:8,padding:'11px 12px' }}>
        <span style={{ fontFamily:'monospace',fontSize:12,color:'#4ade80',fontWeight:700 }}>GRAND TOTAL</span>
        <span style={{ fontFamily:'monospace',fontSize:12,color:'#4ade80',fontWeight:700 }}>{DKK(spent)}</span>
      </div>
    </div>
  )
}
