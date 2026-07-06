# Stellarenes ✦

A personalised interactive birthday gift — a constellation of 20 stars, each one holding a private message. Stars wake when Renes types the secret word she was given for that feeling.

---

## How it works

- 20 stars float across the sky, one for every feeling
- Each star is locked until its secret word is typed into the input bar
- Unlocking a star plays a short tone, bursts particles, and reveals a personal message
- A hidden **birthday star** at the centre opens with a special code given on the day
- A **playlist star** appears once all 20 are lit — links to a Spotify playlist
- A secret **easter egg** star rewards finding the hidden word
- Progress syncs to Supabase so stars stay lit across devices; the creator can undo any star from the dashboard

## Project structure

```
stellarenes/
├── index.html    — HTML template + Component class (event handlers, canvas loop)
├── app.js        — app logic: audio engine, canvas & particles, lifecycle, render
├── data.js       — all star content: messages, secret words, Spotify link
├── styles.css    — layout, animations, responsive breakpoints
├── config.js     — Supabase project URL + anon key (fill in before deploying)
├── support.js    — Framer DC runtime (do not edit)
└── vercel.json   — Vercel static hosting config
```

## Editing content

Open **`data.js`** — everything Renes will read lives there.

- Change a star's message → edit the `text` field inside its `notes` array
- Change a secret word → edit the `code` field (codes must be unique across all stars)
- Update the Spotify playlist → replace the `SPOTIFY` URL at the bottom
- Add a second message to a star → add another `{ code, text }` object to its `notes` array

## Editing the design

Open **`styles.css`** for colours, animations, and layout tweaks.

## Supabase setup

Supabase stores every unlock so you can see which words Renes has typed, and lets you undo a star by deleting its row.

### 1. Create the table

In your Supabase project → **SQL Editor** → paste and run:

```sql
create table public.unlocks (
  id          uuid default gen_random_uuid() primary key,
  code        text not null unique,
  star_id     text not null,
  star_title  text not null,
  unlocked_at timestamptz default now() not null
);

alter table public.unlocks enable row level security;

create policy "public read"   on public.unlocks for select using (true);
create policy "public insert" on public.unlocks for insert with check (true);
```

### 2. Enable Realtime

**Database → Replication** → find `unlocks` in the tables list → toggle it on.

This makes the app re-sync live when you delete a row from the dashboard.

### 3. Fill in `config.js`

**Settings → API** → copy your Project URL and anon public key, then open `config.js`:

```js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_KEY = 'eyJ...your-anon-key...';
```

### 4. Undoing a star (creator only)

**Table Editor → `unlocks`** → find the row by `code` or `star_title` → delete it.  
The app will re-sync within seconds and the star will go dark again.

> Internal codes (`_complete`, `_playlist`) are never stored in Supabase — they are computed locally.

## Deployment

Hosted as a static site — no build step, no backend.

- **GitHub**: [github.com/GOHSUNJIN/stellarenes](https://github.com/GOHSUNJIN/stellarenes)
- **Vercel**: import the GitHub repo, leave all settings default, deploy
