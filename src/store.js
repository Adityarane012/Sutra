// App state: one object, saved to the browser (localStorage) so the demo
// works offline and survives a refresh. In the full version this syncs to
// Supabase; the shape matches the tables in schema.sql.

import { useCallback, useEffect, useRef, useState } from 'react';
import { seedDemo } from './engine/seed.js';

const KEY = 'sutra-demo-v2';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.version === 1) return s;
    }
  } catch { /* storage blocked: fall through */ }
  return seedDemo();
}

export function useStore() {
  const [state, setState] = useState(load);
  const ref = useRef(state);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  /**
   * Apply a change to a deep copy of the state. Engine functions mutate the
   * copy; whatever `fn` returns is handed back to the caller synchronously.
   */
  const update = useCallback((fn) => {
    const next = structuredClone(ref.current);
    const out = fn(next);
    ref.current = next;
    setState(next);
    return out;
  }, []);

  const reset = useCallback(() => {
    const fresh = seedDemo();
    ref.current = fresh;
    setState(fresh);
  }, []);

  return { state, update, reset };
}
