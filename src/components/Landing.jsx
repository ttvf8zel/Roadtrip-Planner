import { useState, useEffect } from 'react'

const DEPARTURE = new Date('2026-09-21T00:00:00')

const CREW = [
  { src: '/crew/person1.jpg', fallback: '🪨', h: 78 },
  { src: '/crew/person2.jpg', fallback: '🪨', h: 92 },
  { src: '/crew/person3.jpg', fallback: '🪨', h: 70 },
]

const FLAG_RED = '#b22234'
const FLAG_BLUE = '#3c3b6e'
const FLAG_WHITE = '#f5f3ec'

function getTimeLeft() {
  const diff = DEPARTURE.getTime() - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true }
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
    done: false,
  }
}

const STONE_FILTER = 'grayscale(0.9) sepia(0.35) contrast(1.15) brightness(0.92)'

export default function Landing({ onEnter }) {
  const [t, setT] = useState(getTimeLeft)
  const [errored, setErrored] = useState({})

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const countdownUnits = [
    ['DAYS', t.d, FLAG_RED, '#fff'],
    ['HRS',  t.h, '#fff', '#07111a'],
    ['MIN',  t.m, FLAG_BLUE, '#fff'],
    ['SEC',  t.s, FLAG_RED, '#fff'],
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'monospace', color: '#fff',
    }}>
      {/* Sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #1b3a6b 0%, #4a7bb5 32%, #a9cdf0 58%, #e8dcc8 78%, #cdb98f 100%)',
      }} />

      {/* Stars in the sky, flag-canton style */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '30%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.8) 1.4px, transparent 1.6px)',
        backgroundSize: '46px 40px',
        backgroundPosition: '10px 10px',
        opacity: 0.7,
      }} />

      {/* Mountain / rock base — flag-toned granite */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '58%',
        background: 'linear-gradient(160deg, #a3433f 0%, #9c9286 35%, #6d6f8f 70%, #3c3b6e 100%)',
        clipPath: 'polygon(0% 38%, 8% 22%, 18% 32%, 28% 12%, 38% 28%, 50% 6%, 62% 26%, 74% 10%, 86% 30%, 100% 18%, 100% 100%, 0% 100%)',
      }} />
      {/* Rock texture: red / white / blue stripes etched into the stone */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '58%',
        background: 'repeating-linear-gradient(115deg, rgba(178,34,52,.18) 0 10px, rgba(245,243,236,.14) 10px 20px, rgba(60,59,110,.18) 20px 30px)',
        clipPath: 'polygon(0% 38%, 8% 22%, 18% 32%, 28% 12%, 38% 28%, 50% 6%, 62% 26%, 74% 10%, 86% 30%, 100% 18%, 100% 100%, 0% 100%)',
        mixBlendMode: 'overlay',
      }} />
      {/* Fine rock crack lines */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '58%',
        background: 'repeating-linear-gradient(115deg, rgba(0,0,0,.08) 0 3px, transparent 3px 14px)',
        clipPath: 'polygon(0% 38%, 8% 22%, 18% 32%, 28% 12%, 38% 28%, 50% 6%, 62% 26%, 74% 10%, 86% 30%, 100% 18%, 100% 100%, 0% 100%)',
        mixBlendMode: 'multiply',
      }} />

      {/* Carved busts */}
      <div style={{
        position: 'absolute', bottom: '6%', left: 0, width: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '4vw',
        padding: '0 4vw',
      }}>
        {CREW.map((c, i) => (
          <div key={i} style={{
            width: 'min(22vw, 150px)', height: 'min(22vw, 150px)',
            marginBottom: `-${100 - c.h}px`,
            borderRadius: '50% 50% 12% 12% / 60% 60% 14% 14%',
            background: 'linear-gradient(135deg, #ada499, #756d62)',
            boxShadow: 'inset 0 0 24px rgba(0,0,0,.45), 0 12px 28px rgba(0,0,0,.45)',
            border: '3px solid #8c8378',
            overflow: 'hidden', position: 'relative', flexShrink: 0,
          }}>
            {!errored[i] ? (
              <img
                src={c.src}
                alt=""
                onError={() => setErrored(p => ({ ...p, [i]: true }))}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: STONE_FILTER, opacity: 0.92 }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'min(10vw, 56px)', filter: 'grayscale(.4)', opacity: .85 }}>
                {c.fallback}
              </div>
            )}
            {/* texture overlay for stone blend */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(100deg, rgba(255,255,255,.05) 0 2px, transparent 2px 10px)', mixBlendMode: 'overlay' }} />
          </div>
        ))}
      </div>

      {/* Top content panel */}
      <div style={{
        position: 'relative', zIndex: 2, marginTop: '6vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        padding: '22px 28px', textAlign: 'center', maxWidth: 760,
        background: 'rgba(7,17,26,.55)', borderRadius: 18, backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,.1)',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#ff6b6b', marginBottom: 8, fontWeight: 700 }}>
            Copenhagen → Coast to Coast
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 5.5vw, 52px)', fontWeight: 800, margin: 0, lineHeight: 1.1,
            background: `linear-gradient(90deg, #ff5b5b 0%, ${FLAG_WHITE} 50%, #7a93ff 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: FLAG_WHITE,
            textShadow: '0 4px 24px rgba(0,0,0,.7)',
          }}>
            🇺🇸 The Great American Road Trip
          </h1>
          <div style={{ fontSize: 13, color: '#aebdff', marginTop: 10, letterSpacing: 1, fontWeight: 600 }}>
            Sep 21 – Dec 14, 2026 · 84 days · 44 stops · 3 travelers
          </div>
        </div>

        {/* Countdown in flag colors */}
        <div style={{ display: 'flex', gap: 10 }}>
          {t.done
            ? <div style={{ fontSize: 20, color: '#4ade80', letterSpacing: 2 }}>🚀 WE'RE ON THE ROAD!</div>
            : countdownUnits.map(([label, val, bg, fg]) => (
              <div key={label} style={{
                background: bg, color: fg,
                borderRadius: 10, padding: '12px 16px', minWidth: 64,
                boxShadow: '0 6px 18px rgba(0,0,0,.35)',
                border: '1px solid rgba(255,255,255,.25)',
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
                <div style={{ fontSize: 9, letterSpacing: 2, marginTop: 4, opacity: .8 }}>{label}</div>
              </div>
            ))
          }
        </div>

        <button
          onClick={onEnter}
          style={{
            padding: '16px 40px', fontSize: 14, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace',
            background: '#ff6b35', color: '#07111a', border: 'none', borderRadius: 30,
            cursor: 'pointer', boxShadow: '0 8px 28px rgba(255,107,53,.4)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,107,53,.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,107,53,.4)' }}
        >
          🗺️ Go to Map
        </button>
      </div>
    </div>
  )
}
