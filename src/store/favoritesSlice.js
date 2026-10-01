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
