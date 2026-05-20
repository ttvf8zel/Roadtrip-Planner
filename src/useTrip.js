import { useState, useEffect, useCallback } from 'react'
import { supabase, hasSupabase } from './supabase'
import { DEFAULT_STOPS, BUDGET_FIXED } from './data'

const LS_STOPS = 'rt_stops'
const LS_ROUTES = 'rt_routes'
const LS_BUDGET = 'rt_budget'
const LS_BOOKINGS = 'rt_bookings'

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
  const [bookings, setBookings] = useState(() => loadLS(LS_BOOKINGS, {}))
  const [syncing, setSyncing] = useState(false)

  // On first load with no localStorage, use defaults
  useEffect(() => {
    if (stops === null) setStops(DEFAULT_STOPS.map(s => ({ ...s })))
  }, [])

  // Persist to localStorage on every change
  useEffect(() => { if (stops) saveLS(LS_STOPS, stops) }, [stops])
  useEffect(() => { saveLS(LS_ROUTES, routeCache) }, [routeCache])
  useEffect(() => { saveLS(LS_BUDGET, budgetFixed) }, [budgetFixed])
  useEffect(() => { saveLS(LS_BOOKINGS, bookings) }, [bookings])

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
      }
    } catch {}
    setSyncing(false)
  }

  async function saveToSupabase(newStops, newBudget, newBookings) {
    if (!hasSupabase()) return
    try {
      await supabase.from('trip_data').upsert({
        key: 'main',
        value: { stops: newStops, budgetFixed: newBudget, bookings: newBookings },
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

  const cacheRoute = useCallback((key, data) => {
    setRouteCache(prev => { const n = {...prev, [key]: data}; saveLS(LS_ROUTES, n); return n })
  }, [])

  const resetToDefault = useCallback(() => {
    const fresh = DEFAULT_STOPS.map(s => ({ ...s }))
    setStops(fresh)
    setBudgetFixed(BUDGET_FIXED)
    setBookings({})
    setRouteCache({})
    saveLS(LS_STOPS, fresh)
    saveLS(LS_BUDGET, BUDGET_FIXED)
    saveLS(LS_BOOKINGS, {})
    saveLS(LS_ROUTES, {})
    saveToSupabase(fresh, BUDGET_FIXED, {})
  }, [])

  return {
    stops: stops || [],
    routeCache, cacheRoute,
    budgetFixed, updateBudgetFixed,
    bookings, updateBookings,
    updateStops, resetToDefault,
    syncing, hasSupabase: hasSupabase()
  }
}
