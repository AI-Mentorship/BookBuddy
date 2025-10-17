// MovieCard.jsx

import { useBookContext } from "../context/BookContext";
import "../css/MovieCard.css";
function MovieCard({ book }) {

    const {isFavorite, addToFavorites, removeFromFavorites} = useBookContext();

    
    const favorite = isFavorite(book.id);


    function onFavoriteClick(e){
        e.preventDefault()
        if (favorite) removeFromFavorites(book.id)
        else addToFavorites(book)
    }
  return (
    <div className="book-card">
      <img src={book.cover_url} alt={book.title} />
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <p>{book.year}</p>
      <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                        ♥
                    </button>
    </div>
  );
}


export default MovieCard