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
- Progress is saved in the browser so stars stay lit across visits

## Project structure

```
stellarenes/
├── index.html    — HTML template + Component class (event handlers, canvas loop)
├── app.js        — app logic: audio engine, canvas & particles, lifecycle, render
├── data.js       — all star content: messages, secret words, Spotify link
├── styles.css    — layout, animations, responsive breakpoints
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

## Dev toolbar

While `devMode()` returns `true` in `app.js`, three buttons appear in the bottom-left corner:

| Button | What it does |
|--------|-------------|
| `reset` | Clears all unlocked stars (for testing) |
| `intro` | Replays the opening intro screen |
| `light all` | Instantly lights all 20 stars |

Set `devMode()` to return `false` before sharing the gift.

## Deployment

Hosted as a static site — no build step, no backend.

- **GitHub**: [github.com/GOHSUNJIN/stellarenes](https://github.com/GOHSUNJIN/stellarenes)
- **Vercel**: import the GitHub repo, leave all settings default, deploy
