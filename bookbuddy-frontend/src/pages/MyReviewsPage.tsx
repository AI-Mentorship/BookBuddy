import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import BookCover from "../components/BookCover";
import "../css/MyReviewsPage.css";

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const { readBooks, removeReview, loadReadBooks, userProfile, loading } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showMarkAsRead, setShowMarkAsRead] = useState(false);
  const [editMode, setEditMode] = useState<{
    enabled: boolean;
    rating?: number;
    review?: string;
  }>({ enabled: false });

  // Ensure reviews are loaded when visiting this tab
  useEffect(() => {
    if (userProfile.userId && readBooks.length === 0) {
      loadReadBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.userId]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setShowMarkAsRead(false);
    setEditMode({ enabled: false });
  };

  const handleMarkAsRead = () => {
    setShowMarkAsRead(true);
  };

  const handleCloseMarkAsRead = () => {
    setShowMarkAsRead(false);
    setEditMode({ enabled: false });
  };

  const handleEditReview = (book: Book, rating?: number, review?: string) => {
    setSelectedBook(book);
    setEditMode({ enabled: true, rating, review });
    setShowMarkAsRead(true);
  };

  const handleDeleteReview = (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      removeReview(bookId);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) {
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="my-reviews-page page-fade">
      <Navbar />
      <div className="my-reviews-content">
        <h1 className="my-reviews-title">My Reviews</h1>
        {loading && readBooks.length === 0 ? (
          <div className="my-reviews-empty-state">
            <p className="my-reviews-empty-message">Loading your reviews…</p>
          </div>
        ) : readBooks.length === 0 ? (
          <div className="my-reviews-empty-state">
            <p className="my-reviews-empty-message">You haven't written any reviews yet.</p>
            <button
              className="my-reviews-browse-button"
              onClick={() => navigate("/dashboard")}
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="my-reviews-list">
            {readBooks.map((readBook) => (
              <div key={readBook.book.id} className="my-reviews-card">
                <div className="my-reviews-card-content">
                  <BookCover
                    src={readBook.book.coverImage}
                    alt={`${readBook.book.title} cover`}
                    className="my-reviews-cover"
                    onClick={() => handleBookClick(readBook.book)}
                  />
                  <div className="my-reviews-info">
                    <h3 className="my-reviews-book-title">{readBook.book.title}</h3>
                    <p className="my-reviews-book-author">by {readBook.book.author}</p>
                    <div className="my-reviews-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`my-reviews-star ${
                            star <= readBook.rating ? "my-reviews-star-filled" : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {readBook.review && (
                      <p className="my-reviews-text">{readBook.review}</p>
                    )}
                    <p className="my-reviews-date">
                      Reviewed on {formatDate(new Date().toISOString())}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        className="my-reviews-browse-button"
                        onClick={() => handleEditReview(readBook.book, readBook.rating, readBook.review)}
                      >
                        Edit Review
                      </button>
                      <button
                        className="my-reviews-delete-button"
                        onClick={() => handleDeleteReview(readBook.book.id)}
                        title="Delete review"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && !showMarkAsRead && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {selectedBook && showMarkAsRead && (
        <MarkAsReadModal
          book={selectedBook}
          onClose={handleCloseMarkAsRead}
          mode={editMode.enabled ? "edit" : "create"}
          initialRating={editMode.rating}
          initialReview={editMode.review}
        />
      )}
    </div>
  );
}

