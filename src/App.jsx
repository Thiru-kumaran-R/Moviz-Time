import { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar.jsx";
import { Search } from "./components/Search.jsx";
import { NumResults } from "./components/NumResults.jsx";
import { Box } from "./components/Box.jsx";
import { Main } from "./components/Main.jsx";
import { MovieList } from "./components/MovieList.jsx";
import { WatchedSummary } from "./components/WatchedSummary.jsx";
import { WatchedMoviesList } from "./components/WatchedMoviesList.jsx";
import { MoviesDetail } from "./components/MoviesDetail.jsx";
import { Error } from "./components/Error.jsx";
import { Loading } from "./components/Loading.jsx";

const API_KEY = "https://www.omdbapi.com/?apikey=b7666db7";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [watched, setWatched] = useState(
    () => JSON.parse(localStorage.getItem("watched")) || []
  );

  function handleAddWatched(movie) {
    setWatched((prevMovie) => [...prevMovie, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_KEY}&s=${query}`);
        const data = await response.json();

        console.log(data);
        if (!response.ok) {
          throw new Error("Something went wrong !");
        }

        if (data.Response === "False") {
          throw new Error("Movie not found...");
        }

        setMovies(data.Search);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
  }, [query]);

  return (
    <>
      <NavBar>
        <Search onSetQuery={setQuery} query={query} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {loading && <Loading />}
          {!loading && !error ? (
            <MovieList movies={movies} setSelectedID={setSelectedID} />
          ) : null}
          {error && <Error message={error} />}
        </Box>

        <Box>
          {selectedID ? (
            <MoviesDetail
              selectedID={selectedID}
              setSelectedID={setSelectedID}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
