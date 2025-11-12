import { Book } from "../services/api";
import "../css/BookCard.css";

interface BookCardProps {
  book: Book;
  onClick: () => void;
  showRating?: boolean;
  rating?: number;
}

export default function BookCard({ book, onClick, showRating = false, rating }: BookCardProps) {
  return (
    <div className="book-card" onClick={onClick}>
      <div className="book-card-cover-wrapper">
        <img
          src={book.coverImage}
          alt={`${book.title} cover`}
          className="book-card-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x300?text=No+Cover";
          }}
        />
        {showRating && rating && (
          <div className="book-card-rating-badge">
            <span className="book-card-rating-star">★</span>
            <span className="book-card-rating-value">{rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}

