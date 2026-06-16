import { useState } from 'react'
import { ACTIVITIES, ACCOMM } from '../data'

function routeKey(a, b) { return `${a.id}→${b.id}` }
function fmt(secs) { const h=Math.floor(secs/3600),m=Math.round((secs%3600)/60); return h>0?(m>0?`${h}h ${m}m`:`${h}h`):`${m}m` }
function fmtMi(m) { return Math.round(m*0.000621371).toLocaleString() }

export default function StopsPanel({ stops, routeCache, onEdit, onDelete, onMove, onAdd, onReset, onFocus, onView }) {
  const totalDays = stops.reduce((s,x) => s+Number(x.days||0), 0)
  const pts = stops.filter(s=>s.lat&&s.lng)
  const totalMiles = pts.reduce((sum,s,i) => { if(i===0)return sum; const rd=routeCache[routeKey(pts[i-1],s)]; return sum+(rd?rd.miles:0) },0)
  const totalDrive = pts.reduce((sum,s,i) => { if(i===0)return sum; const rd=routeCache[routeKey(pts[i-1],s)]; return sum+(rd?rd.duration:0) },0)

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
      {/* Summary strip */}
      <div style={{ padding:'10px 14px',borderBottom:'1px solid #1e3a4a',display:'flex',gap:16,flexShrink:0,flexWrap:'wrap' }}>
        {[['📍',stops.length,'Stops'],['📅',totalDays+'d','Planned'],['🛣️',totalMiles>0?fmtMi(totalMiles)+'mi':'—','Road dist'],['⏱️',totalDrive>0?fmt(totalDrive):'—','Drive time']].map(([icon,val,lbl]) => (
          <div key={lbl} style={{ textAlign:'center' }}>
            <div style={{ fontSize:16 }}>{icon}</div>
            <div style={{ fontSize:14,color:'#ff6b35',fontWeight:400,lineHeight:1 }}>{val}</div>
            <div style={{ fontFamily:'monospace',fontSize:9,color:'#4a6a7a',textTransform:'uppercase',letterSpacing:1 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Stop list */}
      <div style={{ flex:1,overflowY:'auto',padding:10 }}>
        {stops.length === 0 && <div style={{ textAlign:'center',padding:40,color:'#4a6a7a',fontFamily:'monospace',fontSize:12 }}>No stops yet — add your first city!</div>}
        {stops.map((s, i) => {
          const prev = i > 0 && s.lat && stops[i-1].lat ? routeCache[routeKey(stops[i-1],s)] : null
          const acts = ACTIVITIES.filter(a=>(s.activities||[]).includes(a.id))
          return (
            <div key={s.id}>
              {prev && (
                <div style={{ display:'flex',alignItems:'center',gap:6,margin:'3px 0',fontFamily:'monospace',fontSize:10,color:'#ff6b35' }}>
                  <div style={{ flex:1,height:1,background:'#1e3a4a' }}/>
                  🚗 {fmtMi(prev.miles)}mi · {fmt(prev.duration)}
                  <div style={{ flex:1,height:1,background:'#1e3a4a' }}/>
                </div>
              )}
              <div style={{ background:'#07111a',border:'1px solid #1e3a4a',borderRadius:9,padding:'10px 12px',marginBottom:5,transition:'border-color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#2a4a5a'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e3a4a'}>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:4 }}>
                  <div style={{ width:22,height:22,borderRadius:'50%',background:'#ff6b35',color:'#07111a',fontFamily:'monospace',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{i+1}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:'#e8dcc8',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer' }} onClick={()=>onView(s)}>{s.name.split(',')[0]}</div>
                </div>
                <div style={{ fontFamily:'monospace',fontSize:10,color:'#4a6a7a',paddingLeft:29,marginBottom:3 }}>
                  📅 {s.days}d{s.hours>0?` +${s.hours}h`:''}
                  {s.budget_per_day>0?` · 💰 ${s.budget_per_day.toLocaleString('da-DK')} kr/dag`:''}
                </div>
                {s.accommodation && <div style={{ fontFamily:'monospace',fontSize:10,color:'#60a5fa',paddingLeft:29 }}>{ACCOMM.find(a=>a.id===s.accommodation)?.label||''}{s.accommodationNotes?` — ${s.accommodationNotes}`:''}</div>}
                {acts.length>0 && <div style={{ display:'flex',flexWrap:'wrap',gap:3,paddingLeft:29,marginTop:4 }}>{acts.map(a=><span key={a.id} style={{ padding:'2px 7px',borderRadius:8,fontSize:9,background:a.color+'22',color:a.color,border:`1px solid ${a.color}44`,fontFamily:'monospace' }}>{a.label}</span>)}</div>}
                {(s.mustSee||[]).length>0 && <div style={{ display:'flex',flexWrap:'wrap',gap:3,paddingLeft:29,marginTop:4 }}>{s.mustSee.map((m,j)=><span key={j} style={{ padding:'2px 7px',borderRadius:8,fontSize:9,background:'#122012',color:'#4ade80',border:'1px solid #2a4a2a',fontFamily:'monospace' }}>📍{m}</span>)}</div>}
                {s.notes && <div style={{ fontSize:11,color:'#4a6a7a',fontStyle:'italic',paddingLeft:29,marginTop:4,borderLeft:'2px solid #1e3a4a',paddingLeft:10,marginLeft:29 }}>{s.notes}</div>}
                <div style={{ display:'flex',gap:3,marginTop:7,paddingLeft:29 }}>
                  {[['👁',()=>onView(s)],['✏️',()=>onEdit(s)],['🗺',()=>onFocus(s)],['↑',()=>onMove(s.id,-1)],['↓',()=>onMove(s.id,1)],['🗑',()=>onDelete(s.id)]].map(([lbl,fn],idx)=>(
                    <button key={idx} onClick={fn} style={{ padding:'4px 7px',borderRadius:5,border:'none',cursor:'pointer',fontFamily:'monospace',fontSize:9,background:lbl==='🗑'?'#2a0e0e':'#1a2e3a',color:lbl==='🗑'?'#f87171':'#b0c0cc' }}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ display:'flex',gap:6,marginTop:6 }}>
          <button onClick={onAdd} style={{ flex:1,padding:'10px',fontSize:11,background:'#ff6b35',color:'#07111a',border:'none',borderRadius:8,fontFamily:'monospace',fontWeight:700,cursor:'pointer' }}>+ Add Stop</button>
          <button onClick={onReset} title="Reset to suggested route" style={{ padding:'10px 12px',background:'transparent',color:'#4a6a7a',border:'1px solid #1e3a4a',borderRadius:8,fontFamily:'monospace',fontSize:10,cursor:'pointer' }}>↺</button>
        </div>
      </div>
    </div>
  )
}
