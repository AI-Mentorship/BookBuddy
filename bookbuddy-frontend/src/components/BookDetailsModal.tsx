import { useEffect, useState } from "react";
import { Book } from "../services/api";
import { useBooks } from "../context/BooksContext";
import "../css/BookDetailsModal.css";

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
  onMarkAsRead: () => void;
}

export default function BookDetailsModal({
  book,
  onClose,
  onMarkAsRead,
}: BookDetailsModalProps) {
  const { toggleSave, isSaved, isRead } = useBooks();
  const [saved, setSaved] = useState(isSaved(book.id));
  const [read, setRead] = useState(isRead(book.id));

  useEffect(() => {
    const checkState = () => {
      setSaved(isSaved(book.id));
      setRead(isRead(book.id));
    };
    checkState();
    
    const handleBookMarked = () => {
      checkState();
    };
    window.addEventListener("bookMarkedAsRead", handleBookMarked);
    return () => window.removeEventListener("bookMarkedAsRead", handleBookMarked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  const handleSave = () => {
    toggleSave(book);
    setSaved(!saved);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content book-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="book-details-content">
          <div className="book-details-info">
            <h1 className="book-details-title">{book.title}</h1>
            <p className="book-details-author">by {book.author}</p>

            <div className="book-details-rating">
              <div className="book-details-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`book-details-star ${
                      star <= Math.round(book.rating) ? "book-details-star-filled" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="book-details-rating-text">
                {book.rating} out of {book.reviewCount.toLocaleString()} reviews
              </span>
            </div>

            <div className="book-details-meta">
              <div className="book-details-meta-item">
                <span className="book-details-meta-label">PAGES</span>
                <span className="book-details-meta-value">{book.pages}</span>
              </div>
              <div className="book-details-meta-item">
                <span className="book-details-meta-label">PUBLISHED</span>
                <span className="book-details-meta-value">{book.published}</span>
              </div>
            </div>

            <div className="book-details-genres">
              {book.genres.map((genre) => (
                <span key={genre} className="book-details-genre-chip">
                  {genre}
                </span>
              ))}
            </div>

            <div className="book-details-actions">
              <button
                className={`book-details-button book-details-button-read ${
                  read ? "book-details-button-read-completed" : ""
                }`}
                onClick={read ? undefined : onMarkAsRead}
                disabled={read}
              >
                <span>🔖</span>
                {read ? "Marked as Read" : "Mark as Read"}
              </button>
              <button
                className={`book-details-button book-details-button-save ${
                  saved ? "book-details-button-saved" : ""
                }`}
                onClick={handleSave}
              >
                <span>🔖</span>
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className="book-details-description">
              <h3 className="book-details-description-title">About this book</h3>
              <p className="book-details-description-text">{book.description}</p>
            </div>
          </div>

          <div className="book-details-cover">
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="book-details-cover-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Cover";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

