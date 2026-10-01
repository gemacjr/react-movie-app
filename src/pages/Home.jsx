import MovieCard from "../components/MovieCard";
import SearchForm from "../components/SearchForm";
import { useState, useCallback, useMemo } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";
import "../css/MoviesGrid.css";

function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openMovie } = useMovieContext();

  // WHY useDocumentTitle: tab label matches the screen the user is on.
  useDocumentTitle("Movie App · Home");

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

  // WHY useMemo: filter/sort is pure derived data. Recompute only when `movies`
  // changes — not on unrelated parent re-renders. Skip memo for tiny arrays
  // if profiling shows no benefit; here it's a clear teaching example.
  const visibleMovies = useMemo(() => {
    return movies
      .filter((movie) => Boolean(movie.poster_path))
      .slice()
      .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
  }, [movies]);

  return (
    <div className="home">
      <SearchForm onSearch={handleSearch} />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <p className="results-meta">
            Showing {visibleMovies.length} of {movies.length} (posters only,
            sorted by rating — via useMemo)
          </p>
          <div className="movies-grid">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={openMovie}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
