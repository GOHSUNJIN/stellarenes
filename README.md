# Stellarenes ✦

A personalised interactive birthday gift — a constellation of 20 stars, each holding a private message. Stars wake when Renes types the secret word she was given for that feeling.

---

## How it works

- 20 stars float across the sky, one for every feeling
- Each star is locked until its secret word is typed into the input bar
- Unlocking a star plays a short tone, bursts particles, and reveals a personal message
- A hidden **birthday star** at the centre opens with a special code given on the day
- When the last of the 20 stars is lit, a secret **egg star** appears automatically after she closes it
- A **playlist star** appears once all 20 are lit — links to a Spotify playlist with a personal note
- A secret **easter egg** star also unlocks manually by typing its word at any time
- Unlocks sync to Supabase so all her devices share the same progress
- Ambient music fades in after the intro and ducks softly while a message card is open
- The app remembers which note you were reading when you close and reopen a star
- Modal cards only close with the **close button** — tapping the backdrop does nothing

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Any letter | Focuses the word input |
| `Enter` | Submit the typed word |
| `Escape` | Close open card / share panel |
| `L` | Toggle the archive panel |
| `← → ↑ ↓` | Navigate between star orbs |

---

## Editing messages

Open **`messages.js`** — this is the only file you need to touch.

Each entry is a code word mapped to a message:

```js
kintsugi: `Your heart aches, and I wish I could carry it for you.
Broken things can be put back with gold in the cracks...`,

queen: `Happy birthday, Renes.
Twenty years of you...`,
```

- **Change a message** → find its code word, edit the text between the backticks
- **Change a secret word** → edit the `code` field in `data.js` and the matching key in `messages.js` (codes must be unique)
- **Update the Spotify playlist** → replace the `SPOTIFY` value at the bottom of `messages.js`

### All 20 codes

| Code | Star |
|------|------|
| `kintsugi` | When your heart aches |
| `weightless` | When you feel overwhelmed |
| `polaris` | When you feel lost |
| `supernova` | When you're not enough |
| `echo` | When you feel misunderstood |
| `moonlight` | When you can't sleep |
| `aurora` | When you need space |
| `orbit` | When you miss me |
| `ignite` | When you're afraid |
| `dusk` | When you feel exhausted |
| `eclipse` | When you feel loved |
| `luminous` | When you feel grateful |
| `zenith` | When you feel proud |
| `cosmos` | When you feel small |
| `serene` | When you're at peace |
| `nebula` | When you feel sick |
| `solar` | When you feel angry |
| `tether` | When you pull away |
| `radiant` | When you feel seen |
| `void` | When you feel lonely |

### Special codes

| Code | What it does |
|------|--------------|
| `queen` | Birthday star — give her this word on the day |
| `forever` | Secret easter egg star — type it any time |
| `_playlist` | Auto-unlocks playlist star when all 20 are lit |

---

## Project structure

```
stellarenes/
├── messages.js      — all message text (the only file you edit)
├── data.js          — star config: positions, colours, codes (rarely touched)
├── index.html       — HTML template + DC component class + arrow handlers
├── app.js           — core logic: render, lifecycle, data helpers, interaction
├── audio.js         — Web Audio tones + ambient music player
├── canvas.js        — background star field, shooting stars, burst particles
├── sync.js          — Supabase read/write + realtime subscription
├── styles.css       — layout, responsive breakpoints, accessibility
├── animations.css   — all @keyframes animations
├── config.js        — Supabase URL + anon key
├── support.js       — Framer DC runtime (do not edit)
├── sw.js            — service worker (auto-updates iOS home screen app)
├── favicon.svg      — browser tab icon
├── apple-touch-icon.png — iOS home screen icon
└── vercel.json      — cache headers config
```

---

## Pushing an update

1. Edit `messages.js`
2. `git add messages.js && git commit -m "update messages" && git push`
3. Vercel deploys automatically
4. iOS home screen app auto-reloads on next open (service worker handles it)

---

## Supabase setup

Supabase stores every unlock so you can see which words Renes has typed, and lets you undo a star by deleting its row.

### 1. Create the table

In your Supabase project → **SQL Editor** → paste and run:

```sql
create table public.unlocks (
  id          uuid default gen_random_uuid() primary key,
  code        text not null,
  star_id     text not null,
  star_title  text not null,
  device_id   text not null default 'renes',
  unlocked_at timestamptz default now() not null,
  unique(code, device_id)
);

alter table public.unlocks enable row level security;

create policy "public read"   on public.unlocks for select using (true);
create policy "public insert" on public.unlocks for insert with check (true);
```

### 2. Enable Realtime

**Database → Replication** → find `unlocks` → toggle it on.

### 3. Fill in `config.js`

**Settings → API** → copy your Project URL and anon key:

```js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_KEY = 'eyJ...your-anon-key...';
```

### 4. Undoing a star

**Table Editor → `unlocks`** → find the row by `code` → delete it.
The app re-syncs within seconds and the star goes dark again.

---

## Deployment

Hosted as a static site — no build step, no backend.

- **GitHub**: [github.com/GOHSUNJIN/stellarenes](https://github.com/GOHSUNJIN/stellarenes)
- **Vercel**: import the repo, leave all settings default, deploy
