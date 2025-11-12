import { useState } from "react";
import { Book } from "../services/api";
import { useBooks } from "../context/BooksContext";
import * as api from "../services/api";
import "../css/MarkAsReadModal.css";

interface MarkAsReadModalProps {
  book: Book;
  onClose: () => void;
}

export default function MarkAsReadModal({ book, onClose }: MarkAsReadModalProps) {
  const { markAsRead } = useBooks();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    try {
      await api.createReview(book, rating, review || undefined);
      markAsRead(book, rating, review || undefined);
      onClose();
      // Trigger a re-render in parent to update button state
      setTimeout(() => {
        window.dispatchEvent(new Event("bookMarkedAsRead"));
      }, 100);
    } catch (error) {
      console.error("Failed to create review:", error);
      setError("Failed to save review. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mark-as-read-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="mark-as-read-title">Mark as Read</h2>
        <p className="mark-as-read-book-info">
          {book.title} by {book.author}
        </p>

        <form onSubmit={handleSubmit} className="mark-as-read-form">
          <div className="mark-as-read-section">
            <label className="mark-as-read-label">
              YOUR RATING <span className="mark-as-read-required">*</span>
            </label>
            <div className="mark-as-read-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`mark-as-read-star ${
                    star <= rating ? "mark-as-read-star-filled" : ""
                  }`}
                  onClick={() => {
                    setRating(star);
                    setError("");
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            {error && <p className="mark-as-read-error">{error}</p>}
          </div>

          <div className="mark-as-read-section">
            <label className="mark-as-read-label">YOUR REVIEW (Optional)</label>
            <textarea
              className="mark-as-read-textarea"
              placeholder="Share your thoughts about this book..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
            />
          </div>

          <div className="mark-as-read-actions">
            <button
              type="button"
              className="mark-as-read-button mark-as-read-button-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="mark-as-read-button mark-as-read-button-submit">
              Mark as Read
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

