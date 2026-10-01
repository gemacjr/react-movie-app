import { useState } from "react";

/**
 * WHAT: Return the value from the *previous* render (or `undefined` on the first).
 *
 * HOW (React-recommended “adjust state while rendering” pattern):
 * - Keep `current` and `previous` in state.
 * - When the incoming `value` differs from `current`, update both during render
 *   (`previous` ← old current, `current` ← new value). React then re-renders
 *   with the correct previous snapshot.
 *
 * WHY: Compare "what changed?" without an effect lag — e.g. detect that the
 * search query changed so you can show a "typing…" hint. Prefer this over
 * reading `ref.current` during render (refs are for non-render bookkeeping).
 *
 * PITFALLS:
 * - First render always gets `undefined`.
 * - Only use this pattern to store information from previous renders — do not
 *   fetch or subscribe during render.
 *
 * @template T
 * @param {T} value
 * @returns {T | undefined}
 */
export function usePrevious(value) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(undefined);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}
