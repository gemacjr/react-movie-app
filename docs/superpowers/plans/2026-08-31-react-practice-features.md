# React Practice Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the movie app with Redux favorites/toasts, Context-based modal selection, portals, lazy routes/modal, child→parent callbacks, and practice hooks (`useDebounce` stub for learner).

**Architecture:** Feature-layered hybrid — Redux Toolkit owns durable global state (favorites + toasts); `MovieContext` owns session UI (selected movie); `SearchForm`/`MovieCard` practice callback props; portals mount modal and toasts on `document.body`; routes and modal use `lazy` + `Suspense`.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, Redux Toolkit, react-redux, react-dom `createPortal`

**Spec:** `docs/superpowers/specs/2026-08-31-react-practice-features-design.md`

## Global Constraints

- Keep Context vs Redux roles distinct (no selected movie / search results in Redux)
- Favorites persist under localStorage key `"favorites"` (same as today)
- Live debounced search; empty debounced query restores popular movies
- Manual verification only (no new unit test suite)
- Leave `useDebounce` body as a learner stub (signature + TODO comments)
- Match existing dark CSS style (`#1a1a1a`, `#ff4757` accents)
- No git repo yet — skip commit steps unless user initializes git first
- Do not put API keys in new files beyond existing `src/services/api.js`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/store/favoritesSlice.js` | Favorites array + add/remove/toggle |
| `src/store/toastsSlice.js` | Toast queue + add/remove |
| `src/store/index.js` | `configureStore` |
| `src/hooks/useLocalStorage.js` | JSON localStorage ↔ React state |
| `src/hooks/useDebounce.js` | Debounce hook (**learner stub**) |
| `src/components/FavoritesPersistence.jsx` | Sync Redux favorites ↔ localStorage |
| `src/components/SearchForm.jsx` | Child form; `useReducer` + debounce; `onSearch` |
| `src/components/MovieModal.jsx` | Portal modal; `useRef` focus |
| `src/components/ToastHost.jsx` | Portal toasts; auto-dismiss |
| `src/components/PageFallback.jsx` | Suspense fallback |
| `src/contexts/MovieContext.jsx` | Selection only |
| `src/components/MovieCard.jsx` | Redux favorite + `onSelect` |
| `src/pages/Home.jsx` / `Favorites.jsx` | Wire callbacks + Redux |
| `src/App.jsx` / `src/main.jsx` | Provider, lazy, Suspense, hosts |
| `src/css/Modal.css`, `Toast.css`, `Fallback.css` | New UI styles |

---

### Task 1: Install Redux and create store slices

**Files:**
- Modify: `package.json` (via npm)
- Create: `src/store/favoritesSlice.js`
- Create: `src/store/toastsSlice.js`
- Create: `src/store/index.js`

**Interfaces:**
- Consumes: none
- Produces:
  - `store` default export from `src/store/index.js`
  - Actions: `addFavorite(movie)`, `removeFavorite(movieId)`, `toggleFavorite(movie)`, `setFavorites(movies[])`, `addToast({ message, type? })`, `removeToast(id)`
  - Selectors (inline or exported): `state => state.favorites.items`, `state => state.toasts.items`

- [ ] **Step 1: Install dependencies**

Run:

```bash
cd "/Users/edmini/Projects/React Movie Tutuorial/frontend"
npm install @reduxjs/toolkit react-redux
```

Expected: packages appear in `package.json` dependencies.

- [ ] **Step 2: Create favorites slice**

Create `src/store/favoritesSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
  },
  reducers: {
    setFavorites(state, action) {
      state.items = action.payload;
    },
    addFavorite(state, action) {
      const movie = action.payload;
      if (!state.items.some((m) => m.id === movie.id)) {
        state.items.push(movie);
      }
    },
    removeFavorite(state, action) {
      const movieId = action.payload;
      state.items = state.items.filter((m) => m.id !== movieId);
    },
    toggleFavorite(state, action) {
      const movie = action.payload;
      const exists = state.items.some((m) => m.id === movie.id);
      if (exists) {
        state.items = state.items.filter((m) => m.id !== movie.id);
      } else {
        state.items.push(movie);
      }
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, toggleFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavorites = (state) => state.favorites.items;
export const selectIsFavorite = (movieId) => (state) =>
  state.favorites.items.some((m) => m.id === movieId);
```

- [ ] **Step 3: Create toasts slice**

Create `src/store/toastsSlice.js`:

```js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const toastsSlice = createSlice({
  name: "toasts",
  initialState: {
    items: [],
  },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ message, type = "info" }) {
        return {
          payload: { id: nanoid(), message, type },
        };
      },
    },
    removeToast(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastsSlice.actions;
export default toastsSlice.reducer;
export const selectToasts = (state) => state.toasts.items;
```

- [ ] **Step 4: Create store**

Create `src/store/index.js`:

```js
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import toastsReducer from "./toastsSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    toasts: toastsReducer,
  },
});
```

- [ ] **Step 5: Verify install**

Run: `node -e "import('@reduxjs/toolkit').then(m => console.log('rtk', !!m.configureStore))"`

Expected: prints `rtk true`

---

### Task 2: Custom hooks (`useLocalStorage` + learner stub `useDebounce`)

**Files:**
- Create: `src/hooks/useLocalStorage.js`
- Create: `src/hooks/useDebounce.js`

**Interfaces:**
- Consumes: none
- Produces:
  - `useLocalStorage(key: string, initialValue: any) => [value, setValue]`
  - `useDebounce(value: any, delayMs?: number) => debouncedValue` (stub returns `value` until learner implements)

- [ ] **Step 1: Implement `useLocalStorage`**

Create `src/hooks/useLocalStorage.js`:

```js
import { useState, useEffect } from "react";

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
```

- [ ] **Step 2: Create learner stub `useDebounce`**

Create `src/hooks/useDebounce.js`:

```js
import { useState, useEffect } from "react";

/**
 * Debounce a rapidly changing value.
 *
 * LEARNER TASK: Replace the placeholder so `debounced` only updates
 * after `delay` ms of no changes to `value`. Clear the timer on cleanup
 * and when `value`/`delay` change.
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
```

- [ ] **Step 3: Manual sanity check**

In a scratch note or temporary log: importing these modules should not throw. Full behavior checked after SearchForm (Task 5) and persistence (Task 3).

---

### Task 3: FavoritesPersistence + wire Redux Provider

**Files:**
- Create: `src/components/FavoritesPersistence.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `store`, `setFavorites`, `selectFavorites`, `useLocalStorage`
- Produces: App tree wrapped in `<Provider>`; favorites hydrated/persisted under key `"favorites"`

- [ ] **Step 1: Create FavoritesPersistence**

Create `src/components/FavoritesPersistence.jsx`:

```js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFavorites, selectFavorites } from "../store/favoritesSlice";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * One-way bridge: hydrate Redux once from localStorage, then
 * keep localStorage in sync when Redux favorites change.
 */
export default function FavoritesPersistence() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const [stored, setStored] = useLocalStorage("favorites", []);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      dispatch(setFavorites(Array.isArray(stored) ? stored : []));
      hydrated.current = true;
    }
  }, [dispatch, stored]);

  useEffect(() => {
    if (!hydrated.current) return;
    setStored(favorites);
  }, [favorites, setStored]);

  return null;
}
```

- [ ] **Step 2: Wrap app with Provider**

Update `src/main.jsx` to:

```js
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import FavoritesPersistence from "./components/FavoritesPersistence";
import "./css/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <FavoritesPersistence />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
```

- [ ] **Step 3: Manual verify boot**

Run: `npm run dev`

Expected: app loads without console errors related to Provider/store.

---

### Task 4: Slim MovieContext to selection-only

**Files:**
- Modify: `src/contexts/MovieContext.jsx` (replace contents)

**Interfaces:**
- Consumes: none
- Produces: `useMovieContext()` → `{ selectedMovie, openMovie, closeMovie }`

- [ ] **Step 1: Rewrite MovieContext**

Replace `src/contexts/MovieContext.jsx` with:

```js
import { createContext, useContext, useState } from "react";

const MovieContext = createContext(null);

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const openMovie = (movie) => setSelectedMovie(movie);
  const closeMovie = () => setSelectedMovie(null);

  const value = { selectedMovie, openMovie, closeMovie };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};
```

- [ ] **Step 2: Note temporary breakage**

`MovieCard` and `Favorites` still import old favorites API — expected until Tasks 6–7. Prefer implementing those next before long manual testing.

---

### Task 5: SearchForm (child→parent + useReducer + useDebounce)

**Files:**
- Create: `src/components/SearchForm.jsx`
- Modify: `src/pages/Home.jsx` (partial — SearchForm + live search; keep grid for now)

**Interfaces:**
- Consumes: `useDebounce`, `onSearch(query: string)` prop
- Produces: `SearchForm({ onSearch })` calling `onSearch` when debounced query changes and on submit

- [ ] **Step 1: Create SearchForm**

Create `src/components/SearchForm.jsx`:

```js
import { useEffect, useReducer } from "react";
import { useDebounce } from "../hooks/useDebounce";

const initialState = { query: "", error: null };

function searchReducer(state, action) {
  switch (action.type) {
    case "setQuery":
      return { ...state, query: action.payload, error: null };
    case "setError":
      return { ...state, error: action.payload };
    case "clearError":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function SearchForm({ onSearch }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const debouncedQuery = useDebounce(state.query, 400);

  useEffect(() => {
    onSearch(debouncedQuery.trim());
  }, [debouncedQuery, onSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = state.query.trim();
    if (q === "") {
      dispatch({ type: "setError", payload: "Please enter a search query." });
      return;
    }
    onSearch(q);
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        placeholder="Search movies..."
        className="search-input"
        value={state.query}
        onChange={(e) =>
          dispatch({ type: "setQuery", payload: e.target.value })
        }
      />
      <button type="submit" className="search-button">
        Search
      </button>
      {state.error && <div className="error-message">{state.error}</div>}
    </form>
  );
}
```

- [ ] **Step 2: Update Home to use SearchForm + live search**

Replace `src/pages/Home.jsx` with:

```js
import MovieCard from "../components/MovieCard";
import SearchForm from "../components/SearchForm";
import { useState, useEffect, useCallback } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openMovie } = useMovieContext();

  const loadPopular = useCallback(async () => {
    setLoading(true);
    try {
      const popularMovies = await getPopularMovies();
      setMovies(popularMovies);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch popular movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPopular();
  }, [loadPopular]);

  const handleSearch = useCallback(
    async (query) => {
      if (query === "") {
        loadPopular();
        return;
      }
      setLoading(true);
      try {
        const results = await searchMovies(query);
        setMovies(results);
        setError(null);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch search results. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [loadPopular]
  );

  return (
    <div className="home">
      <SearchForm onSearch={handleSearch} />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={openMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
```

Note: `MovieCard` `onSelect` + Redux favorite come in Task 6; if Home errors on missing prop until then, implement Task 6 immediately after.

- [ ] **Step 3: Manual verify search (after Task 6 if needed)**

Expected: typing triggers search after debounce (once learner implements stub — until then every keystroke may search); clearing input restores popular.

---

### Task 6: MovieCard with Redux favorites + onSelect + toasts

**Files:**
- Modify: `src/components/MovieCard.jsx`

**Interfaces:**
- Consumes: `toggleFavorite`, `selectIsFavorite`, `addToast`, prop `onSelect(movie)`
- Produces: card that toggles favorite in Redux, fires toast, calls `onSelect` on poster/info click (not on heart)

- [ ] **Step 1: Rewrite MovieCard**

Replace `src/components/MovieCard.jsx` with:

```js
import "../css/MovieCard.css";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleFavorite,
  selectIsFavorite,
} from "../store/favoritesSlice";
import { addToast } from "../store/toastsSlice";

function MovieCard({ movie, onSelect }) {
  const dispatch = useDispatch();
  const favorite = useSelector(selectIsFavorite(movie.id));

  function onFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
    dispatch(
      addToast({
        message: favorite
          ? `Removed "${movie.title}" from favorites`
          : `Added "${movie.title}" to favorites`,
        type: favorite ? "info" : "success",
      })
    );
  }

  function handleSelect() {
    if (onSelect) onSelect(movie);
  }

  return (
    <div className="movie-card" onClick={handleSelect} role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className="movie-poster">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="movie-overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={onFavoriteClick}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            ❤️
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.split("-")[0]}</p>
      </div>
    </div>
  );
}

export default MovieCard;
```

- [ ] **Step 2: Manual verify favorite toggle**

Expected: heart toggles; Redux state updates; refresh keeps favorites (via FavoritesPersistence). Toasts visible after Task 8.

---

### Task 7: Favorites page from Redux + empty state fix

**Files:**
- Modify: `src/pages/Favorites.jsx`

**Interfaces:**
- Consumes: `selectFavorites`, `openMovie` from Context, `MovieCard`
- Produces: grid when `items.length > 0`, else empty state

- [ ] **Step 1: Rewrite Favorites**

Replace `src/pages/Favorites.jsx` with:

```js
import "../css/Favorites.css";
import { useSelector } from "react-redux";
import { selectFavorites } from "../store/favoritesSlice";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const favorites = useSelector(selectFavorites);
  const { openMovie } = useMovieContext();

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>No Favorites Movies Yet</h2>
        <p>
          Start adding movies to your favorites and they will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="movies-grid">
      {favorites.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={openMovie} />
      ))}
    </div>
  );
}

export default Favorites;
```

- [ ] **Step 2: Manual verify**

Expected: empty state when none; grid when some; click opens modal after Task 8–9.

---

### Task 8: ToastHost portal + styles

**Files:**
- Create: `src/components/ToastHost.jsx`
- Create: `src/css/Toast.css`
- Modify: `src/App.jsx` (mount ToastHost — full App rewrite in Task 10; for now can mount early)

**Interfaces:**
- Consumes: `selectToasts`, `removeToast`, `createPortal`
- Produces: toasts fixed top-right on `document.body`, auto-remove after 3000ms

- [ ] **Step 1: Add Toast.css**

Create `src/css/Toast.css`:

```css
.toast-host {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 220px;
  max-width: 360px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #333;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.toast.success {
  border-color: #2ed573;
}

.toast.info {
  border-color: #646cff;
}

.toast-dismiss {
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.toast-dismiss:hover {
  color: #fff;
}
```

- [ ] **Step 2: Create ToastHost**

Create `src/components/ToastHost.jsx`:

```js
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeToast, selectToasts } from "../store/toastsSlice";
import "../css/Toast.css";

const DISMISS_MS = 3000;

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, DISMISS_MS);
    return () => clearTimeout(id);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast ${toast.type}`} role="status">
      <span>{toast.message}</span>
      <button
        type="button"
        className="toast-dismiss"
        aria-label="Dismiss"
        onClick={() => dispatch(removeToast(toast.id))}
      >
        ×
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useSelector(selectToasts);

  return createPortal(
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}
```

- [ ] **Step 3: Temporary mount if App not yet updated**

If implementing before Task 10, add `<ToastHost />` inside `MovieProvider` in `App.jsx`. Task 10 will include the final placement.

- [ ] **Step 4: Manual verify**

Toggle a favorite → toast appears top-right via portal; disappears ~3s.

---

### Task 9: MovieModal portal (lazy target) + styles

**Files:**
- Create: `src/components/MovieModal.jsx`
- Create: `src/css/Modal.css`

**Interfaces:**
- Consumes: `useMovieContext`, `createPortal`, `useRef`, `useEffect`
- Produces: default export modal that portals when `selectedMovie` set; Escape/backdrop/close call `closeMovie`; focuses close button on open

- [ ] **Step 1: Add Modal.css**

Create `src/css/Modal.css`:

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog {
  background: #1a1a1a;
  color: #fff;
  border-radius: 8px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  padding: 1.5rem;
  position: relative;
  border: 1px solid #333;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.modal-poster {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.modal-dialog h2 {
  margin-bottom: 0.5rem;
  padding-right: 2rem;
}

.modal-meta {
  color: #999;
  margin-bottom: 1rem;
}

.modal-overview {
  line-height: 1.5;
  color: #ddd;
}
```

- [ ] **Step 2: Create MovieModal**

Create `src/components/MovieModal.jsx`:

```js
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/Modal.css";

export default function MovieModal() {
  const { selectedMovie, closeMovie } = useMovieContext();
  const closeBtnRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!selectedMovie) return undefined;

    previouslyFocused.current = document.activeElement;
    closeBtnRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") closeMovie();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [selectedMovie, closeMovie]);

  if (!selectedMovie) return null;

  const { title, overview, poster_path, release_date } = selectedMovie;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={closeMovie}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="modal-close"
          onClick={closeMovie}
          aria-label="Close"
        >
          ×
        </button>
        {poster_path && (
          <img
            className="modal-poster"
            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
            alt=""
          />
        )}
        <h2 id="movie-modal-title">{title}</h2>
        <p className="modal-meta">{release_date?.split("-")[0]}</p>
        <p className="modal-overview">
          {overview || "No overview available."}
        </p>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 3: Manual verify (after Task 10 wires lazy modal)**

Click card → modal in body; Escape / backdrop / × closes; focus returns.

---

### Task 10: App lazy routes + Suspense + hosts

**Files:**
- Create: `src/components/PageFallback.jsx`
- Create: `src/css/Fallback.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: lazy `Home`, `Favorites`, `MovieModal`; `ToastHost`; `MovieProvider`
- Produces: Suspense-wrapped routes; modal Suspense; toast host always mounted

- [ ] **Step 1: PageFallback**

Create `src/css/Fallback.css`:

```css
.page-fallback {
  padding: 2rem;
  text-align: center;
  color: #999;
}
```

Create `src/components/PageFallback.jsx`:

```js
import "../css/Fallback.css";

export default function PageFallback({ label = "Loading..." }) {
  return (
    <div className="page-fallback" role="status">
      {label}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite App.jsx**

Replace `src/App.jsx` with:

```js
import { lazy, Suspense } from "react";
import "./css/App.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import { MovieProvider, useMovieContext } from "./contexts/MovieContext";
import ToastHost from "./components/ToastHost";
import PageFallback from "./components/PageFallback";

const Home = lazy(() => import("./pages/Home"));
const Favorites = lazy(() => import("./pages/Favorites"));
const MovieModal = lazy(() => import("./components/MovieModal"));

function ModalHost() {
  const { selectedMovie } = useMovieContext();
  if (!selectedMovie) return null;
  return (
    <Suspense fallback={<PageFallback label="Loading movie..." />}>
      <MovieModal />
    </Suspense>
  );
}

function App() {
  return (
    <MovieProvider>
      <NavBar />
      <main className="main-content">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Suspense>
      </main>
      <ModalHost />
      <ToastHost />
    </MovieProvider>
  );
}

export default App;
```

Note: existing markup used `main-context` in JSX but `App.css` defines `.main-content` — use `main-content` so padding applies.

- [ ] **Step 3: Full manual verification checklist**

1. `npm run dev` — no console errors  
2. Toggle favorite → toast portal; refresh keeps favorites  
3. Click card → modal portal; Escape/backdrop closes  
4. Navigate Home ↔ Favorites → Suspense fallback may flash on cold chunks  
5. Type search → after learner implements `useDebounce`, requests wait ~400ms; clear restores popular  
6. Empty favorites shows empty state (`length === 0`)  
7. Heart click does not open modal (`stopPropagation`)

---

### Task 11: Learner handoff note (useDebounce)

**Files:**
- Modify: none required (optional short comment in README — skip unless user asks for docs)

**Interfaces:**
- Consumes: stub from Task 2
- Produces: clear ask for user to fill in `useDebounce`

- [ ] **Step 1: Confirm stub still present**

Open `src/hooks/useDebounce.js` and ensure TODO(learner) comments remain; do not silently complete the debounce logic in agent implementation unless the user asks.

- [ ] **Step 2: Ask user to implement**

In the session, point them to `src/hooks/useDebounce.js` and ask them to implement the timeout + cleanup (~5–10 lines), explaining the snappy-vs-API-calls trade-off.

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| Favorites in Redux | 1, 6, 7 |
| Toasts in Redux + portal | 1, 8 |
| Context selected movie | 4, 9, 10 |
| Both portals | 8, 9 |
| Lazy routes + lazy modal + Suspense | 10 |
| SearchForm child→parent | 5 |
| MovieCard onSelect child→parent | 6, 5, 7 |
| useLocalStorage | 2, 3 |
| useDebounce learner stub | 2, 11 |
| useReducer in SearchForm | 5 |
| useRef modal focus | 9 |
| Live debounced search; empty → popular | 5 |
| Favorites empty state fix | 7 |
| Persist key `"favorites"` | 3 |
| Manual verification | 10 Step 3 |
| No selected movie in Redux | 4, 1 |

## Placeholder / consistency check

- Action names consistent: `toggleFavorite`, `setFavorites`, `addToast`, `removeToast`, `openMovie`, `closeMovie`
- Selectors: `selectFavorites`, `selectIsFavorite`, `selectToasts`
- localStorage key: `"favorites"` only
- CSS class: `main-content` (fixes prior mismatch)
- No TBD left in task steps
