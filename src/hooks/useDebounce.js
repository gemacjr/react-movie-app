import { useState, useEffect } from "react";

/**
 * WHAT: Delay updating a value until it has stopped changing for `delay` ms.
 *
 * HOW (once you implement the TODOs):
 * - Store a `debounced` copy of `value` in state.
 * - On each `value`/`delay` change, start a timer; when it fires, set `debounced`.
 * - Cleanup clears the timer so rapid changes only "win" after a quiet gap.
 *
 * WHY: Perfect for search-as-you-type. Without debouncing, every keystroke can
 * trigger a network request. Unlike `useDeferredValue` (which only defers *rendering*
 * work on the React scheduler), debounce controls *when side effects run* (API calls).
 *
 * LEARNER TASK: Replace the placeholder so `debounced` only updates after `delay`
 * ms of no changes. Clear the timer on cleanup and when deps change.
 *
 * Trade-off: shorter delay feels snappier but hits the API more often;
 * ~300–500ms is a common sweet spot for search.
 *
 * @param {unknown} value
 * @param {number} [delay=400]
 */
export function useDebounce(value, delay = 400) {
  // Placeholder so the app still runs until you implement debouncing.
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // TODO(learner): set a timeout to call setDebounced(value) after `delay`
    // TODO(learner): return a cleanup that clears that timeout
    setDebounced(value);
  }, [value, delay]);

  return debounced;
}
