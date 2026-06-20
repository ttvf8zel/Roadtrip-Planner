import { useState, useEffect, useCallback } from 'react'
import { supabase, hasSupabase } from './supabase'
import { DEFAULT_STOPS, BUDGET_FIXED, SEED_BOOKINGS, ROUTE_VERSION } from './data'

const LS_STOPS = 'rt_stops'
const LS_ROUTES = 'rt_routes'
const LS_BUDGET = 'rt_budget'
const LS_BOOKINGS = 'rt_bookings'
const LS_IMAGES = 'rt_images'
const LS_VERSION = 'rt_route_version'
const LS_VISITED = 'rt_visited'
const LS_TRAVELERS = 'rt_travelers'

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useTrip() {
  const [stops, setStops] = useState(() => loadLS(LS_STOPS, null))
  const [routeCache, setRouteCache] = useState(() => loadLS(LS_ROUTES, {}))
  const [budgetFixed, setBudgetFixed] = useState(() => loadLS(LS_BUDGET, BUDGET_FIXED))
  const [bookings, setBookings] = useState(() => loadLS(LS_BOOKINGS, SEED_BOOKINGS))
  const [imageCache, setImageCache] = useState(() => loadLS(LS_IMAGES, {}))
  const [visited, setVisited] = useState(() => loadLS(LS_VISITED, {}))
  const [travelers, setTravelers] = useState(() => loadLS(LS_TRAVELERS, ['Andreas', 'Rasmus', 'Friend 3']))
  const [syncing, setSyncing] = useState(false)

  // On first load with no localStorage, use defaults
  useEffect(() => {
    if (stops === null) setStops(DEFAULT_STOPS.map(s => ({ ...s })))
  }, [])

  // One-time migration when the suggested route (DEFAULT_STOPS/SEED_BOOKINGS) changes.
  // Refreshes the stop list to the new route while keeping existing bookings.
  useEffect(() => {
    const v = loadLS(LS_VERSION, 1)
    if (v < ROUTE_VERSION && stops !== null) {
      const fresh = DEFAULT_STOPS.map(s => ({ ...s }))
      setStops(fresh)
      saveLS(LS_STOPS, fresh)

      setBookings(prev => {
        const next = { ...prev }
        // bring in any newly-seeded stops' bookings (e.g. Bryce Canyon) that aren't present yet
        for (const [stopId, list] of Object.entries(SEED_BOOKINGS)) {
          if (!next[stopId]) next[stopId] = list.map(b => ({ ...b }))
        }
        // move the Bryce Canyon booking off the Zion stop if it's still there from before
        const bryceIdx = (next.d14 || []).findIndex(b => b.id === 'b_rubys_inn_bryce')
        if (bryceIdx > -1) {
          const bryce = next.d14[bryceIdx]
          next.d14 = next.d14.filter((_, i) => i !== bryceIdx)
          if (!(next.d39 || []).some(b => b.id === 'b_rubys_inn_bryce')) {
            next.d39 = [...(next.d39 || []), { ...bryce, stopId: 'd39', notes: bryce.notes.replace(/^⚠️.*?stop on the route\.\s*/, '') }]
          }
        }
        saveLS(LS_BOOKINGS, next)
        return next
      })
    }
    saveLS(LS_VERSION, ROUTE_VERSION)
  }, [])

  // Persist to localStorage on every change
  useEffect(() => { if (stops) saveLS(LS_STOPS, stops) }, [stops])
  useEffect(() => { saveLS(LS_ROUTES, routeCache) }, [routeCache])
  useEffect(() => { saveLS(LS_BUDGET, budgetFixed) }, [budgetFixed])
  useEffect(() => { saveLS(LS_BOOKINGS, bookings) }, [bookings])
  useEffect(() => { saveLS(LS_VISITED, visited) }, [visited])
  useEffect(() => { saveLS(LS_TRAVELERS, travelers) }, [travelers])

  // Supabase sync (if configured)
  useEffect(() => {
    if (!hasSupabase()) return
    loadFromSupabase()
    // Poll every 30s for changes from other users
    const interval = setInterval(loadFromSupabase, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadFromSupabase() {
    if (!hasSupabase()) return
    setSyncing(true)
    try {
      const { data } = await supabase.from('trip_data').select('*').eq('key', 'main').single()
      if (data?.value) {
        const v = data.value
        if (v.stops) setStops(v.stops)
        if (v.budgetFixed) setBudgetFixed(v.budgetFixed)
        if (v.bookings) setBookings(v.bookings)
        if (v.visited) setVisited(v.visited)
        if (v.travelers) setTravelers(v.travelers)
      }
    } catch {}
    setSyncing(false)
  }

  async function saveToSupabase(newStops, newBudget, newBookings, newVisited, newTravelers) {
    if (!hasSupabase()) return
    try {
      await supabase.from('trip_data').upsert({
        key: 'main',
        value: {
          stops: newStops, budgetFixed: newBudget, bookings: newBookings,
          visited: newVisited ?? loadLS(LS_VISITED, {}),
          travelers: newTravelers ?? loadLS(LS_TRAVELERS, []),
        },
        updated_at: new Date().toISOString()
      })
    } catch (e) { console.warn('Supabase sync failed', e) }
  }

  const updateStops = useCallback((fn) => {
    setStops(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveLS(LS_STOPS, next)
      saveToSupabase(next, loadLS(LS_BUDGET, BUDGET_FIXED), loadLS(LS_BOOKINGS, {}))
      return next
    })
  }, [])

  const updateBudgetFixed = useCallback((fn) => {
    setBudgetFixed(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveLS(LS_BUDGET, next)
      saveToSupabase(loadLS(LS_STOPS, DEFAULT_STOPS), next, loadLS(LS_BOOKINGS, {}))
      return next
    })
  }, [])

  const updateBookings = useCallback((fn) => {
    setBookings(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveLS(LS_BOOKINGS, next)
      saveToSupabase(loadLS(LS_STOPS, DEFAULT_STOPS), loadLS(LS_BUDGET, BUDGET_FIXED), next)
      return next
    })
  }, [])

  const updateVisited = useCallback((fn) => {
    setVisited(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveLS(LS_VISITED, next)
      saveToSupabase(loadLS(LS_STOPS, DEFAULT_STOPS), loadLS(LS_BUDGET, BUDGET_FIXED), loadLS(LS_BOOKINGS, {}), next)
      return next
    })
  }, [])

  const updateTravelers = useCallback((fn) => {
    setTravelers(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveLS(LS_TRAVELERS, next)
      saveToSupabase(loadLS(LS_STOPS, DEFAULT_STOPS), loadLS(LS_BUDGET, BUDGET_FIXED), loadLS(LS_BOOKINGS, {}), loadLS(LS_VISITED, {}), next)
      return next
    })
  }, [])

  const cacheRoute = useCallback((key, data) => {
    setRouteCache(prev => { const n = {...prev, [key]: data}; saveLS(LS_ROUTES, n); return n })
  }, [])

  const cacheImage = useCallback((key, url) => {
    setImageCache(prev => { const n = {...prev, [key]: url}; saveLS(LS_IMAGES, n); return n })
  }, [])

  const resetToDefault = useCallback(() => {
    const fresh = DEFAULT_STOPS.map(s => ({ ...s }))
    const freshBookings = Object.fromEntries(Object.entries(SEED_BOOKINGS).map(([k, v]) => [k, v.map(b => ({ ...b }))]))
    setStops(fresh)
    setBudgetFixed(BUDGET_FIXED)
    setBookings(freshBookings)
    setRouteCache({})
    saveLS(LS_STOPS, fresh)
    saveLS(LS_BUDGET, BUDGET_FIXED)
    saveLS(LS_BOOKINGS, freshBookings)
    saveLS(LS_ROUTES, {})
    saveLS(LS_VERSION, ROUTE_VERSION)
    saveToSupabase(fresh, BUDGET_FIXED, freshBookings)
  }, [])

  return {
    stops: stops || [],
    routeCache, cacheRoute,
    imageCache, cacheImage,
    budgetFixed, updateBudgetFixed,
    bookings, updateBookings,
    updateStops, resetToDefault,
    visited, updateVisited,
    travelers, updateTravelers,
    syncing, hasSupabase: hasSupabase()
  }
}
