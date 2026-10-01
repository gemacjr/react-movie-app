import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectFavorites } from "../store/favoritesSlice";

/**
 * Keep localStorage in sync with the Redux favorites state, which is
 * initialized from localStorage when the store is created.
 */
export default function FavoritesPersistence() {
  const favorites = useSelector(selectFavorites);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (err) {
      console.error("Failed to write localStorage", err);
    }
  }, [favorites]);

  return null;
}
