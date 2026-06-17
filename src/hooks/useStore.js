// Binds the async data service to React. Loads the whole state once, then
// re-reads on every store mutation (the store emits after each write).

import { useCallback, useEffect, useState } from 'react';
import { store } from '../lib/store.js';
import { buildSeed } from '../lib/seed.js';

const SEEDED_FLAG = 'habit-tracker:seeded';

export function useStore() {
  const [state, setState] = useState(null); // null = loading

  const refresh = useCallback(async () => {
    setState(await store.getState());
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      // Seed demo data exactly once for a fresh install.
      const existing = await store.listHabits();
      if (existing.length === 0 && !localStorage.getItem(SEEDED_FLAG)) {
        await store.importAll(buildSeed());
        localStorage.setItem(SEEDED_FLAG, '1');
      }
      if (active) await refresh();
    })();

    const unsub = store.subscribe(refresh);
    return () => {
      active = false;
      unsub();
    };
  }, [refresh]);

  return { state, store, refresh };
}
