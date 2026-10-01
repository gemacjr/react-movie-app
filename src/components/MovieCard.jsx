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
            onKeyDown={(e) => e.stopPropagation()}
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
