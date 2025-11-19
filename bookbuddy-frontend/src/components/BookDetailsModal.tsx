import { useEffect, useState, useRef } from "react";
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
  const { toggleSave, removeReview, isSaved, isRead } = useBooks();
  const [saved, setSaved] = useState(isSaved(book.id));
  const [read, setRead] = useState(isRead(book.id));
  const [isClosing, setIsClosing] = useState(false);
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync state on open
    setSaved(isSaved(book.id));
    setRead(isRead(book.id));
  
    const handleBookMarked = () => {
      setRead(isRead(book.id));
    };
  
    const handleBookUnmarked = () => {
      setRead(isRead(book.id));
    };
  
    window.addEventListener("bookMarkedAsRead", handleBookMarked);
    window.addEventListener("bookUnmarkedAsRead", handleBookUnmarked);
  
    return () => {
      window.removeEventListener("bookMarkedAsRead", handleBookMarked);
      window.removeEventListener("bookUnmarkedAsRead", handleBookUnmarked);
    };
  }, [book.id]);

  // Scroll modal into view when it opens
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  

  const handleSave = () => {
    toggleSave(book);
    setSaved(!saved);
  };

  const handleMarkAsRead = () => {
    if (read) {
      setShowUnmarkConfirm(true);
    } else {
      onMarkAsRead();
    }
  };

  const confirmUnmark = async () => {
    setShowUnmarkConfirm(false);
    try {
      await removeReview(book.id);
      window.dispatchEvent(new CustomEvent("bookUnmarkedAsRead", { 
        detail: { googleBooksId: book.id } 
      }));
    } catch (error) {
      console.error("Failed to unmark:", error);
    }
  };

  const cancelUnmark = () => {
    setShowUnmarkConfirm(false);
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
        ref={modalRef}
        className={`modal-content book-details-modal ${isClosing ? 'modal-content-closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        <div className="book-details-header">
          <div className="book-details-cover-container">
            <BookCover
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="book-details-cover-image"
            />
          </div>
          
          <div className="book-details-header-info">
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
              {book.genres.slice(0, 3).map((genre) => {
                const cleanGenre = genre.includes('/') 
                  ? genre.split('/').pop()?.trim() || genre
                  : genre;
                return (
                  <span key={genre} className="book-details-genre-chip">
                    {cleanGenre}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="book-details-actions">
          <button
            className={`book-details-button book-details-button-read ${
              read ? "book-details-button-read-completed" : ""
            }`}
            onClick={handleMarkAsRead}
          >
            <span className="book-details-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="book-details-tabs">
          <button className="book-details-tab book-details-tab-active">
            Description
          </button>
        </div>

        <div className="book-details-tab-content">
          <div className="book-details-description-content">
            <div 
              className="book-details-description-text" 
              dangerouslySetInnerHTML={{ __html: book.description }}
            />
          </div>
        </div>

        {showUnmarkConfirm && (
          <div className="confirm-dialog-overlay" onClick={cancelUnmark}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3 className="confirm-dialog-title">Unmark as Read?</h3>
              <p className="confirm-dialog-message">
                This will remove "{book.title}" from your read books list and delete your review and rating.
              </p>
              <div className="confirm-dialog-actions">
                <button 
                  className="confirm-dialog-button confirm-dialog-button-cancel" 
                  onClick={cancelUnmark}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-dialog-button confirm-dialog-button-confirm" 
                  onClick={confirmUnmark}
                >
                  Unmark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}