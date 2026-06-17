// First-run demo data so the app looks alive immediately. Generated relative to
// "today" so the heatmap and streaks always have something to show.

import { dayKey, addDays } from './dates.js';

export function buildSeed(today = new Date()) {
  const habits = [
    {
      id: 'seed-gto',
      name: 'GTO Study',
      icon: 'Spade',
      type: 'quantitative',
      target: 15,
      unit: 'mins',
      createdAt: dayKey(addDays(today, -29)),
      order: 0,
    },
    {
      id: 'seed-run',
      name: 'Morning Run',
      icon: 'Footprints',
      type: 'quantitative',
      target: 5,
      unit: 'miles',
      createdAt: dayKey(addDays(today, -29)),
      order: 1,
    },
    {
      id: 'seed-read',
      name: 'Read',
      icon: 'BookOpen',
      type: 'binary',
      target: 1,
      unit: '',
      createdAt: dayKey(addDays(today, -29)),
      order: 2,
    },
    {
      id: 'seed-meditate',
      name: 'Meditate',
      icon: 'Brain',
      type: 'binary',
      target: 1,
      unit: '',
      createdAt: dayKey(addDays(today, -29)),
      order: 3,
    },
  ];

  // Deterministic pseudo-random so the demo is stable per-day.
  const rand = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const logs = {};
  habits.forEach((h, hi) => {
    logs[h.id] = {};
    for (let i = 29; i >= 0; i--) {
      const key = dayKey(addDays(today, -i));
      const r = rand(hi * 53 + i * 7 + 1);
      // ~70% consistency, skipping today for a couple of habits to show "in progress".
      if (i === 0 && hi % 2 === 1) continue;
      if (r > 0.3) {
        if (h.type === 'quantitative') {
          // Sometimes partial, mostly complete.
          const v = r > 0.45 ? h.target + Math.round(rand(r) * 5) : Math.round(h.target * 0.6);
          logs[h.id][key] = { value: v };
        } else {
          logs[h.id][key] = { value: true };
        }
      }
    }
  });

  // Demonstrate a grace-day shield bridging one missed run last week.
  const shieldDay = dayKey(addDays(today, -4));
  logs['seed-run'][shieldDay] = { value: 0, shield: true };

  return { version: 1, habits, logs, settings: { view: 'today' } };
}
