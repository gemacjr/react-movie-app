# React Practice Features Design

Date: 2026-08-31  
Project: Movie App (Vite + React 19 tutorial frontend)

## Goal

Extend the existing movie app so learners practice:

- Child → parent data flow (callback props)
- `createPortal` from `react-dom`
- `React.lazy` + `<Suspense>`
- Redux Toolkit for global state
- Additional hooks: `useRef`, `useReducer`, custom `useLocalStorage`, custom `useDebounce`

Keep patterns distinct: each concept should have a clear home so they do not blur together.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| State strategy | Hybrid: favorites → Redux; Context keeps session UI selection |
| Portals | Both: movie detail modal + toast overlay |
| Context role | Selected movie + modal open/close |
| Lazy / Suspense | Both: route pages (`Home`, `Favorites`) and `MovieModal` |
| Child → parent | Both: `SearchForm` → `Home`, `MovieCard` → page via `onSelect` |
| Hooks set | Focused set A (`useRef`, `useReducer`, `useLocalStorage`, `useDebounce`) |
| Architecture | Feature-layered (Approach 1) |
| Search UX | Live debounced search as you type |
| Redux library | Redux Toolkit + `react-redux` |

## Architecture & state ownership

| Concern | Owner | Notes |
|---------|--------|-------|
| Favorites list | Redux `favorites` slice | Global, shared across routes |
| Favorites persistence | `useLocalStorage` + Redux hydrate/sync | Replace current Context `localStorage` effects |
| Toast queue | Redux `toasts` slice | Global; any feature can dispatch |
| Selected movie / modal | `MovieContext` | Session UI only; not durable |
| Search query / results / loading / error | Local state in `Home` | Page-scoped |
| Search form local UI (`query`, field `error`) | `useReducer` in `SearchForm` | Hook practice without duplicating toasts |
| Debounced query | `useDebounce` inside `SearchForm` | Debounced value passed up via `onSearch` |

### High-level flow

1. User types in `SearchForm` → local reducer updates `query` → debounced value bubbles via `onSearch(debouncedQuery)` → `Home` fetches TMDB.
2. User clicks a `MovieCard` → `onSelect(movie)` to page → Context `openMovie(movie)` → lazy `MovieModal` portals to `document.body`.
3. User toggles favorite on card → Redux `toggleFavorite` → toast dispatched → `ToastHost` portals toasts to `document.body`.
4. Route changes → lazy page chunks load under `<Suspense>` with a simple fallback.

## Components & files

### New

| Path | Purpose |
|------|---------|
| `src/store/index.js` | `configureStore` with `favorites` + `toasts` reducers |
| `src/store/favoritesSlice.js` | `addFavorite`, `removeFavorite`, `toggleFavorite`, `isFavorite` selector helpers |
| `src/store/toastsSlice.js` | `addToast`, `removeToast` (id + message + type) |
| `src/hooks/useLocalStorage.js` | Read/write JSON-safe localStorage with React state sync |
| `src/hooks/useDebounce.js` | Debounce a changing value (default ~400ms) |
| `src/components/FavoritesPersistence.jsx` | Mounted once under Provider; syncs Redux favorites ↔ `useLocalStorage` |
| `src/components/SearchForm.jsx` | Child form; `useReducer` + `useDebounce`; calls `onSearch(query)` |
| `src/components/MovieModal.jsx` | Lazy-loaded; `createPortal`; `useRef` focus; Escape/backdrop close |
| `src/components/ToastHost.jsx` | `createPortal`; maps Redux toasts; auto-dismiss ~3s |
| `src/components/PageFallback.jsx` | Shared Suspense fallback UI |

### Changed

| Path | Change |
|------|--------|
| `src/main.jsx` | Wrap app with Redux `<Provider store={store}>` |
| `src/App.jsx` | Lazy routes + Suspense; keep `MovieProvider`; mount `ToastHost` + conditional `MovieModal` |
| `src/contexts/MovieContext.jsx` | Remove favorites; expose `selectedMovie`, `openMovie`, `closeMovie` |
| `src/components/MovieCard.jsx` | Redux for favorite toggle; prop `onSelect(movie)` for parent |
| `src/pages/Home.jsx` | Use `SearchForm`; live search from `onSearch`; pass `onSelect` into cards |
| `src/pages/Favorites.jsx` | Read favorites from Redux; empty state when length 0; pass `onSelect` |
| `src/css/*` | Styles for modal, toasts, fallback (match existing CSS style) |
| `package.json` | Add `@reduxjs/toolkit`, `react-redux` |

### Explicit non-goals

- No TypeScript migration
- No backend / auth
- No unit test suite in this pass (manual verification only)
- Do not put selected movie or search results into Redux
- Do not use portal for NavBar or layout chrome

## Data flow details

### Child → parent

- **SearchForm → Home:** `onSearch(query: string)` when debounced query changes (and on explicit submit if kept). Home owns fetch/`movies`/`loading`/`error`.
- **MovieCard → Home/Favorites:** `onSelect(movie)` only. Favorite mutations go through Redux, not parent callbacks, so “callback vs store” stays clear.

### Redux

- `favorites` state is an array of full movie objects (matches current Favorites UI; no extra detail fetches).
- Hydrate from `localStorage` key `"favorites"` (same key as today) via `FavoritesPersistence` on mount (`setFavorites` or equivalent).
- Persist on change through `FavoritesPersistence` + `useLocalStorage("favorites")`.
- `toasts`: `{ id, message, type }[]`; `addToast` from favorite toggle; `ToastHost` removes after timeout and on dismiss. No duplicate-suppression in v1.

### Context

```text
selectedMovie: movie | null
openMovie(movie) → set selected
closeMovie() → set null
```

Modal renders only when `selectedMovie` is non-null.

### Portals

- `MovieModal`: `createPortal(ui, document.body)`
- `ToastHost`: `createPortal(ui, document.body)`
- Both use CSS fixed positioning; modal traps focus with `useRef` on the dialog container / close button.

### Lazy / Suspense

```text
const Home = lazy(() => import("./pages/Home"))
const Favorites = lazy(() => import("./pages/Favorites"))
const MovieModal = lazy(() => import("./components/MovieModal"))
```

- Routes wrapped in `<Suspense fallback={<PageFallback />}>`
- Modal wrapped in its own Suspense near App so opening a movie can show a small fallback if the chunk is cold

## Hooks plan

| Hook | Where | Why |
|------|--------|-----|
| `useDebounce` | SearchForm | Live search without request-per-keystroke |
| `useLocalStorage` | FavoritesPersistence | Replace ad-hoc Context effects |
| `useRef` | MovieModal | Initial focus + restore focus on close |
| `useReducer` | SearchForm | Local `{ query, error }` (and optional `status`) |

## Error & edge cases

- Empty debounced query: restore popular movies
- API failure: existing Home error message pattern
- Favorites empty: show empty state (`favorites.length === 0`), fixing current truthy-array bug
- Modal: Escape, backdrop click, close button all call `closeMovie`
- Toasts: auto-remove ~3s
- Suspense: accessible text fallback (“Loading…”)
- Learning stub: implement `useDebounce` body (timer + cleanup); surrounding wiring provided

## Manual verification

1. Toggle favorite → toast via portal; refresh keeps favorites
2. Click card → modal portals; focus moves; Escape/backdrop closes
3. Navigate Home ↔ Favorites → Suspense fallback when chunks load
4. Type in search → debounced live results; clear/empty restores popular
5. `SearchForm` / `MovieCard` still communicate up via callbacks as designed
6. Redux DevTools (optional) shows favorites/toasts actions

## Learning contribution (implementation)

Leave `useDebounce` as a stub for the learner: signature and JSDoc provided; they implement the timer + cleanup. Surrounding SearchForm wiring is done for them.
