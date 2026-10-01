import { lazy, Suspense } from "react";
import "./css/App.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import { MovieProvider, useMovieContext } from "./contexts/MovieContext";
import ToastHost from "./components/ToastHost";
import PageFallback from "./components/PageFallback";

const Home = lazy(() => import("./pages/Home"));
const Favorites = lazy(() => import("./pages/Favorites"));
const MovieModal = lazy(() => import("./components/MovieModal"));

function ModalHost() {
  const { selectedMovie } = useMovieContext();
  if (!selectedMovie) return null;
  return (
    <Suspense fallback={<PageFallback label="Loading movie..." />}>
      <MovieModal />
    </Suspense>
  );
}

function App() {
  return (
    <MovieProvider>
      <NavBar />
      <main className="main-content">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Suspense>
      </main>
      <ModalHost />
      <ToastHost />
    </MovieProvider>
  );
}

export default App;
