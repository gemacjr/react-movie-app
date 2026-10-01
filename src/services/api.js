

const API_KEY = "f77152abd1e69432cbb51eeaf6beaa62";
const BASE_URL="https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch popular movies: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
}

export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Failed to search movies: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
}