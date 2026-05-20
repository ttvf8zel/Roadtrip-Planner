# 🇺🇸 Road Trip Planner — Setup Guide

## Deploy in ~10 minutes

### Step 1 — Get the code on GitHub
1. Go to github.com → New repository → name it `roadtrip-planner` → Create
2. Download this zip, unzip it
3. In the folder, open terminal and run:
   ```
   git init
   git add .
   git commit -m "Road trip planner"
   git remote add origin https://github.com/YOUR_USERNAME/roadtrip-planner.git
   git push -u origin main
   ```

### Step 2 — Set up Supabase (free database for real-time sharing)
1. Go to supabase.com → Sign up free → New project
2. Wait ~2 mins for it to spin up
3. Go to **SQL Editor** → paste and run this:
   ```sql
   create table trip_data (
     key text primary key,
     value jsonb,
     updated_at timestamptz default now()
   );
   alter table trip_data enable row level security;
   create policy "allow all" on trip_data for all using (true) with check (true);
   ```
4. Go to **Settings → API** → copy:
   - Project URL (looks like `https://xxxx.supabase.co`)
   - `anon` `public` key

### Step 3 — Deploy to Netlify
1. Go to netlify.com → Sign up free → "Import from Git" → pick your GitHub repo
2. Build settings are auto-detected from netlify.toml
3. Before deploying: go to **Site settings → Environment variables** → add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy site**
5. You get a URL like `https://amazing-trip-abc123.netlify.app`
6. Rename it: Site settings → Domain management → to something like `our-usa-roadtrip.netlify.app`

### Step 4 — Share with friends
Send them the Netlify URL. Anyone with the link can:
- View and edit all stops
- Add/edit bookings
- Track the budget
- All changes sync automatically every 30 seconds

### Without Supabase (local only)
The app works fine without Supabase — everything saves to your browser's localStorage. It just won't sync between devices/friends. You can always add Supabase later.

---
## Features
- 🗺 **Map tab** — Real interactive map with road routing (OSRM), actual drive times, draggable pins
- 📋 **Stops tab** — Full stop list with notes, must-dos, accommodation, reorder, edit
- 💰 **Budget tab** — Pre-filled with our research, tap to update actuals, running total vs 80k DKK
- 🎟 **Bookings tab** — Per-city hotel/activity bookings with confirmation numbers, dates, status
- 💾 **Auto-save** — Every change saves instantly to localStorage + Supabase
- 🔄 **Real-time sync** — Polls Supabase every 30s for changes from your friends
