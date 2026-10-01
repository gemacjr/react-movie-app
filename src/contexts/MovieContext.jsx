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
