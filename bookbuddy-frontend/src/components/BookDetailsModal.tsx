import { useEffect, useState } from "react";
import { Book } from "../services/api";
import { useBooks } from "../context/BooksContext";
import BookCover from "./BookCover";
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
  const [isClosing, setIsClosing] = useState(false);

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} 
      onClick={handleClose}
    >
      <div 
        className={`modal-content book-details-modal ${isClosing ? 'modal-content-closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleClose}>
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
                <span className="book-details-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {read ? "Marked as Read" : "Mark as Read"}
              </button>
              <button
                className={`book-details-button book-details-button-save ${
                  saved ? "book-details-button-saved" : ""
                }`}
                onClick={handleSave}
              >
                <span className="book-details-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className="book-details-description">
              <h3 className="book-details-description-title">About this book</h3>
              <p className="book-details-description-text">{book.description}</p>
            </div>
          </div>

          <div className="book-details-cover">
            <BookCover
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="book-details-cover-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
