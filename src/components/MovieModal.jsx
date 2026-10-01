import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "../css/Modal.css";

export default function MovieModal() {
  const { selectedMovie, closeMovie } = useMovieContext();
  const closeBtnRef = useRef(null);
  const previouslyFocused = useRef(null);
  // useId gives a unique title id even if multiple dialogs exist later.
  const titleId = useId();

  useDocumentTitle(
    selectedMovie ? `${selectedMovie.title} · Movie App` : ""
  );

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
        aria-labelledby={titleId}
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
        <h2 id={titleId}>{title}</h2>
        <p className="modal-meta">{release_date?.split("-")[0]}</p>
        <p className="modal-overview">
          {overview || "No overview available."}
        </p>
      </div>
    </div>,
    document.body
  );
}
