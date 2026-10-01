import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import toastsReducer from "./toastsSlice";

function loadStoredFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem("favorites"));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    toasts: toastsReducer,
  },
  preloadedState: {
    favorites: {
      items: loadStoredFavorites(),
    },
  },
});
