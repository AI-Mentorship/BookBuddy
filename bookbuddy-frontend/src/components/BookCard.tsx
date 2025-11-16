import { Book } from "../services/api";
import BookCover from "./BookCover";
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
        <BookCover
          src={book.coverImage}
          alt={`${book.title} cover`}
          className="book-card-cover"
        />
        {showRating && rating && (
          <div className="book-card-rating-badge">
            <span className="book-card-rating-star">★</span>
            <span className="book-card-rating-value">{rating}</span>
          </div>
        )}
      </div>
      <div className="book-card-info">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.authors?.join(", ") || "Unknown Author"}</p>
      </div>
    </div>
  );
}

