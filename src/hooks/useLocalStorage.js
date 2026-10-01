import { useState, useEffect } from "react";

/**
 * WHAT: Keep React state in sync with `localStorage` under a string key.
 *
 * HOW:
 * - Lazy `useState` initializer reads once on mount (avoids reading on every render).
 * - `useEffect` writes whenever `key` or `value` changes.
 *
 * WHY: Prefer this over sprinkling `localStorage.getItem/setItem` in components when
 * several places need the same persisted value, or when you want a single reusable
 * persistence pattern. For *global* durable data shared across many screens
 * (like favorites in this app), Redux + one sync bridge can be clearer — this hook
 * shines for smaller, local preferences (theme, last search, UI toggles).
 *
 * PITFALLS:
 * - Values must be JSON-serializable.
 * - Multiple tabs can drift; this hook does not listen to `storage` events.
 * - Private browsing / quota errors are caught; writes may silently fail after log.
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, import("react").Dispatch<import("react").SetStateAction<T>>]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Failed to write localStorage", err);
    }
  }, [key, value]);

  return [value, setValue];
}
