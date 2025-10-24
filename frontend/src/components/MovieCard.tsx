// MovieCard.tsx
import { useBookContext } from "../context/BookContext";
import "../css/MovieCard.css";

type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
  cover_url: string;
};

type BookProps = {
  book: Book;
};

function MovieCard({ book }: BookProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useBookContext();

  const favorite = isFavorite(book.id);

  // ✅ Correct event type
  function onFavoriteClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (favorite) removeFromFavorites(book.id);
    else addToFavorites(book);
  }

  return (
    <div className="book-card">
      <img src={book.cover_url} alt={book.title} />
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <p>{book.year}</p>
      <button
        className={`favorite-btn ${favorite ? "active" : ""}`}
        onClick={onFavoriteClick}
      >
        ♥
      </button>
    </div>
  );
}

export default MovieCard;
