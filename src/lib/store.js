// Data service.
//
// This module is the single seam between the UI and persistence. Today it is
// backed by LocalStorage; tomorrow you can drop in a Python/FastAPI backend by
// reimplementing the methods of `createLocalStore` (or writing a sibling
// `createApiStore`) against `fetch('/api/...')` — the async signatures already
// match a REST surface:
//
//   GET    /habits                  -> listHabits()
//   POST   /habits                  -> createHabit(habit)
//   PATCH  /habits/:id              -> updateHabit(id, patch)
//   DELETE /habits/:id              -> deleteHabit(id)
//   PUT    /habits/:id/logs/:day    -> setEntry(habitId, dayKey, entry)
//   GET    /habits/:id/logs         -> getLogs(habitId)
//
// Because every method returns a Promise, the React layer never has to change.

import { dayKey } from './dates.js';

const STORAGE_KEY = 'habit-tracker:v1';

const DEFAULT_STATE = {
  version: 1,
  habits: [],
  logs: {}, // { [habitId]: { [dayKey]: { value, shield } } }
  settings: { view: 'today' },
};

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function write(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Quota or private-mode failures are non-fatal for the session. */
  }
}

// A tiny pub/sub so multiple components (and other tabs) stay in sync.
const listeners = new Set();
function emit() {
  for (const fn of listeners) fn();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) emit();
  });
}

export const store = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  async getState() {
    return read();
  },

  async listHabits() {
    return read().habits.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  async createHabit(habit) {
    const state = read();
    const newHabit = {
      id: uid(),
      name: habit.name?.trim() || 'New habit',
      icon: habit.icon || 'Target',
      type: habit.type === 'quantitative' ? 'quantitative' : 'binary',
      target: Number(habit.target) || 1,
      unit: habit.unit?.trim() || '',
      createdAt: dayKey(),
      order: state.habits.length,
    };
    state.habits.push(newHabit);
    state.logs[newHabit.id] = {};
    write(state);
    emit();
    return newHabit;
  },

  async updateHabit(id, patch) {
    const state = read();
    const idx = state.habits.findIndex((h) => h.id === id);
    if (idx === -1) return null;
    state.habits[idx] = { ...state.habits[idx], ...patch, id };
    write(state);
    emit();
    return state.habits[idx];
  },

  async deleteHabit(id) {
    const state = read();
    state.habits = state.habits.filter((h) => h.id !== id);
    delete state.logs[id];
    write(state);
    emit();
  },

  async reorderHabits(orderedIds) {
    const state = read();
    const map = new Map(orderedIds.map((id, i) => [id, i]));
    state.habits.forEach((h) => {
      if (map.has(h.id)) h.order = map.get(h.id);
    });
    write(state);
    emit();
  },

  async getLogs(habitId) {
    return read().logs[habitId] || {};
  },

  /**
   * Upsert a single day's entry. Pass `null` to clear the day.
   * entry: { value: number|boolean, shield?: boolean }
   */
  async setEntry(habitId, day, entry) {
    const state = read();
    if (!state.logs[habitId]) state.logs[habitId] = {};
    if (entry == null) {
      delete state.logs[habitId][day];
    } else {
      state.logs[habitId][day] = entry;
    }
    write(state);
    emit();
    return state.logs[habitId][day] || null;
  },

  async setView(view) {
    const state = read();
    state.settings.view = view;
    write(state);
    emit();
  },

  // --- Import / export: handy for debugging and for a future backend sync. ---
  async exportAll() {
    return read();
  },

  async importAll(state) {
    write({ ...structuredClone(DEFAULT_STATE), ...state });
    emit();
  },
};
