# Habits — Minimalist Habit Tracker

A high-performance, premium habit tracker built with **React (Vite)**, **Tailwind CSS**, and **Lucide-React**. Track daily habits with a GitHub-style heatmap, smart streaks with grace days, and a focused Midnight dark theme.

![Midnight theme](public/icon.svg)

## ✨ Features

- **GitHub-style heatmap** — a 30-day contribution grid per habit visualizes consistency at a glance.
- **Binary & Quantitative habits** — toggle a simple Done/Not-Done, or count toward a goal (e.g. _10/15 mins of GTO study_, _5/10 miles run_).
- **Smart streaks** — current & longest streaks, plus a weekly **grace-day "shield"** 🛡️ that prevents a streak from breaking once per week.
- **Today vs. Weekly views** — switch between a focused daily list and a bird's-eye weekly grid.
- **Midnight aesthetics** — `#09090b` background, `#18181b` cards, Emerald-500 accents, subtle hover states and smooth transitions.
- **Offline-first PWA** — installable, responsive, mobile-ready, with LocalStorage persistence.

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

The app seeds a few example habits on first run so the UI looks alive immediately. Clear it via your browser's LocalStorage (key `habit-tracker:v1`).

## 🎨 Theme tokens

| Token              | Value     | Usage                |
| ------------------ | --------- | -------------------- |
| `midnight.bg`      | `#09090b` | App background       |
| `midnight.card`    | `#18181b` | Cards / surfaces     |
| `midnight.border`  | `#27272a` | Hairline borders     |
| `emerald-500`      | `#10b981` | Completions / accent |

## 🧠 Streak logic

A habit is **complete** on a day when a binary habit is marked done, or a quantitative habit reaches its target. The **shield** (grace day) bridges a single missed day so the streak survives — limited to **one per ISO week** to keep it honest. See [`src/lib/streaks.js`](src/lib/streaks.js).

## 🏗️ Architecture

The code is intentionally modular so you can swap LocalStorage for a Python/FastAPI backend later **without touching the UI**:

```
src/
├── lib/
│   ├── dates.js      # timezone-stable day-key + ISO-week helpers
│   ├── streaks.js    # pure streak / completion engine (easy to port to Python)
│   ├── store.js      # ← the data-service SEAM (LocalStorage today, REST tomorrow)
│   └── seed.js       # first-run demo data
├── hooks/
│   └── useStore.js   # binds the async store to React
└── components/       # presentational UI (Heatmap, HabitCard, WeeklyView, …)
```

Every `store` method is **async** and already mirrors a REST surface, so the migration is a drop-in. See [`BACKEND.md`](BACKEND.md) for the FastAPI integration guide.

## 📱 PWA

A minimal service worker (`public/sw.js`) caches the app shell for offline use and is registered in production builds. The web manifest (`public/manifest.webmanifest`) makes the app installable on mobile and desktop.

## License

MIT
