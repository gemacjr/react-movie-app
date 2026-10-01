import { useEffect, useReducer, useId, useDeferredValue } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { usePrevious } from "../hooks/usePrevious";

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

/**
 * Child search form — practices:
 * - useReducer: related local fields (query + error) as one state machine
 * - useDebounce: when to fire the parent's onSearch (side effects)
 * - useDeferredValue: keep a lagging preview string while typing stays smooth
 * - usePrevious: detect that the query changed since last render
 * - useId: stable ids for label ↔ input association (a11y)
 */
export default function SearchForm({ onSearch }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const inputId = useId();
  const hintId = useId();

  const debouncedQuery = useDebounce(state.query, 400);
  // Deferred value updates later under load — good for non-urgent UI text,
  // not for deciding when to fetch (use debounce for that).
  const deferredQuery = useDeferredValue(state.query);
  const previousQuery = usePrevious(state.query);
  const queryJustChanged =
    previousQuery !== undefined && previousQuery !== state.query;

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
    <form onSubmit={handleSubmit} className="search-form" aria-describedby={hintId}>
      <div className="search-fields">
        <label htmlFor={inputId} className="search-label">
          Search movies
        </label>
        <div className="search-row">
          <input
            id={inputId}
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
        </div>
        <p id={hintId} className="search-hint" aria-live="polite">
          {state.query.trim()
            ? `Preview (deferred): “${deferredQuery.trim() || "…"}”`
            : "Type to search — requests wait for debounce; preview can lag via useDeferredValue."}
          {queryJustChanged ? " · typing…" : ""}
        </p>
      </div>
      {state.error && <div className="error-message">{state.error}</div>}
    </form>
  );
}
