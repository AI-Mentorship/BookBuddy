import { useState, useEffect, useRef } from "react";
import { Book } from "../services/api";
import { useBooks } from "../context/BooksContext";
import "../css/MarkAsReadModal.css";

interface MarkAsReadModalProps {
  book: Book;
  onClose: () => void;
  mode?: "create" | "edit";
  initialRating?: number;
  initialReview?: string;
}

export default function MarkAsReadModal({ book, onClose, mode = "create", initialRating, initialReview }: MarkAsReadModalProps) {
  const { markAsRead, updateExistingReview } = useBooks();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [review, setReview] = useState(initialReview ?? "");
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Scroll modal into view when it opens
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    try {
      if (mode === "edit") {
        await updateExistingReview(book, rating, review || undefined);
      } else {
        // Persist review by marking the book as read via context API (calls backend under the hood)
        await markAsRead(book, rating, review || undefined);
        // Trigger a re-render in parent to update button state
        setTimeout(() => {
          window.dispatchEvent(new Event("bookMarkedAsRead"));
        }, 100);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create review:", error);
      setError("Failed to save review. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={modalRef} className="modal-content mark-as-read-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="mark-as-read-title">{mode === "edit" ? "Edit Review" : "Mark as Read"}</h2>
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
              {mode === "edit" ? "Save Changes" : "Mark as Read"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

