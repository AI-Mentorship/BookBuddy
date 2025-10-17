import "../css/Favorites.css";
import { useBookContext } from "../context/BookContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const { favorites } = useBookContext();

  if (favorites) {
    return (
      <div className="favorites">
        <h2>Your Favorites</h2>
        <div className="books-grid">
          {favorites.map((book) => (
            <MovieCard book={book} key={book.id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-empty">
      <h2>No Favorite Books Yet</h2>
      <p>Start adding books to your favorites and they will appear here!</p>
    </div>
  );
}

export default Favorites;