import "../css/Favorites.css";
import "../css/MoviesGrid.css";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectFavorites } from "../store/favoritesSlice";
import { useMovieContext } from "../contexts/MovieContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const favorites = useSelector(selectFavorites);
  const { openMovie } = useMovieContext();

  useDocumentTitle(
    favorites.length
      ? `Movie App · Favorites (${favorites.length})`
      : "Movie App · Favorites"
  );

  const sortedFavorites = useMemo(() => {
    return favorites
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [favorites]);

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
    <div className="favorites">
      <p className="results-meta">
        {sortedFavorites.length} saved · A–Z (useMemo)
      </p>
      <div className="movies-grid">
        {sortedFavorites.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={openMovie} />
        ))}
      </div>
    </div>
  );
}

export default Favorites;
