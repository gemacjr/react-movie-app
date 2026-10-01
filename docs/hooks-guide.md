# Hooks guide (Movie App)

This project uses built-in React hooks and a few custom hooks. Each section
covers **what** the hook does, **how** we use it here, **why** that choice,
and common **pitfalls**.

Also read the JSDoc above each file in `src/hooks/` and the short comments
next to call sites in components.

---

## Mental model

| Need | Prefer |
|------|--------|
| UI state for one component | `useState` / `useReducer` |
| Sync with an external system (DOM, network, storage) | `useEffect` |
| Remember a value without re-rendering | `useRef` |
| Derive expensive values from props/state | `useMemo` |
| Stable function identity for child deps | `useCallback` |
| Delay *side effects* (API calls) | custom `useDebounce` |
| Delay *rendering* of non-urgent UI | `useDeferredValue` |
| Unique DOM ids for a11y | `useId` |
| App-wide durable data | Redux (this app: favorites, toasts) |
| Session UI shared by a subtree | Context (this app: selected movie) |

---

## Built-in hooks in this app

### `useState`

**What:** Local reactive state.  
**How:** `Home` keeps `movies`, `loading`, `error`.  
**Why:** Page-scoped data that does not need Redux or Context.  
**Pitfall:** Too many related `useState`s → prefer `useReducer`.

### `useReducer`

**What:** State updates via named actions.  
**How:** `SearchForm` — `{ query, error }` with `setQuery` / `setError`.  
**Why:** Clear transitions when fields update together (typing clears errors).  
**Pitfall:** Overkill for a single boolean toggle.

### `useEffect`

**What:** Synchronize with something outside React after render.  
**How:** Search debounce side effect, modal Escape listener, online listeners, title.  
**Why:** Subscriptions and imperative DOM APIs do not belong in render.  
**Pitfall:** Missing cleanup → leaks/listeners stacking. Putting *derived* data in effects instead of computing during render.

### `useRef`

**What:** Mutable box that survives renders without causing them.  
**How:** Modal close-button focus + previously focused element; `usePrevious` internals.  
**Why:** Focus management and “last value” bookkeeping must not re-render the tree.  
**Pitfall:** Reading a ref during render for UI display is usually wrong — update UI with state.

### `useCallback`

**What:** Memoize a function identity.  
**How:** `Home`’s `handleSearch` / `loadPopular` so `SearchForm`’s effect does not loop.  
**Why:** Child effects depend on `onSearch`; a new function every render would re-fire forever.  
**Pitfall:** Memoizing every function “just in case” adds noise. Use when identity is a dependency or you pass to `memo` children.

### `useMemo`

**What:** Memoize an expensive derived value.  
**How:** `Home` filters to posters and sorts by rating; `Favorites` sorts A–Z.  
**Why:** Keep derived lists out of Redux; recompute only when the source array changes.  
**Pitfall:** Premature memoization. Measure first for heavy work; here it also documents the pattern.

### `useId`

**What:** Stable unique id string for the component instance.  
**How:** `SearchForm` label/`htmlFor`; `MovieModal` `aria-labelledby`.  
**Why:** Avoid hardcoding `id="search"` (collisions) and keep SSR/client ids aligned if you ever hydrate.  
**Pitfall:** Not for list `key`s — keys come from your data.

### `useDeferredValue`

**What:** A version of a value that may “lag” so urgent updates (typing) stay responsive.  
**How:** Search hint text shows the deferred query.  
**Why:** Demonstrates concurrent UI: keep the input controlled and instant; let secondary text catch up.  
**Pitfall:** Does **not** replace debounce for fetch. Deferred values still change often; they only deprioritize renders.

---

## Custom hooks

### `useDebounce` — `src/hooks/useDebounce.js` (**your exercise**)

**What:** Value that updates only after quiet time.  
**How:** `SearchForm` → `onSearch(debouncedQuery)` drives TMDB.  
**Why:** Control *when network requests fire*.  
**Vs deferred:** debounce = side-effect timing; deferred = render priority.  
**You:** implement the `setTimeout` + cleanup TODOs.

### `useLocalStorage` — `src/hooks/useLocalStorage.js`

**What:** State mirrored to `localStorage`.  
**How:** Available for small prefs; favorites themselves use Redux `preloadedState` + persistence.  
**Why:** Reusable pattern for theme/toggles without Redux.  
**Pitfall:** JSON only; multi-tab drift without `storage` events.

### `useDocumentTitle` — `src/hooks/useDocumentTitle.js`

**What:** Set (and restore) `document.title`.  
**How:** Home, Favorites, open modal.  
**Why:** Tabs are UX. Cleanup restores the previous title when the modal closes.  
**Pitfall:** Nested owners rely on restore order — keep titles intentional.

### `usePrevious` — `src/hooks/usePrevious.js`

**What:** Value from the previous render.  
**How:** `SearchForm` shows “typing…” when query changed.  
**Why:** Compare without a separate “lastQuery” piece of business state. Uses React’s “adjust state while rendering” pattern (not `ref.current` during render).  
**Pitfall:** First render is `undefined`.

### `useOnlineStatus` — `src/hooks/useOnlineStatus.js`

**What:** Boolean from `navigator.onLine` + events.  
**How:** `NavBar` offline banner.  
**Why:** Explain failures before the user retries blindly.  
**Pitfall:** “Online” ≠ “API healthy.”

---

## Quick map (file → hooks)

| File | Hooks |
|------|--------|
| `SearchForm.jsx` | `useReducer`, `useId`, `useDebounce`, `useDeferredValue`, `usePrevious`, `useEffect` |
| `Home.jsx` | `useState`, `useCallback`, `useMemo`, `useDocumentTitle` |
| `Favorites.jsx` | `useMemo`, `useDocumentTitle`, Redux `useSelector` |
| `MovieModal.jsx` | `useRef`, `useEffect`, `useId`, `useDocumentTitle` |
| `NavBar.jsx` | `useOnlineStatus` |
| Redux | `useSelector`, `useDispatch` (react-redux) |

---

## Practice checklist

1. Implement `useDebounce` (timer + cleanup). Watch the Network tab while typing.  
2. Chrome DevTools → Network → Offline: confirm the banner.  
3. Open a movie: tab title should become the movie name; close modal → page title returns.  
4. Compare: comment out `useMemo` sorting — behavior same, pattern still worth knowing for heavier transforms.
