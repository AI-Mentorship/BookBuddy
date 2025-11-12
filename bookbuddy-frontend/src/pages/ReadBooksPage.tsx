import { useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import "../css/ReadBooksPage.css";

export default function ReadBooksPage() {
  const { readBooks } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showMarkAsRead, setShowMarkAsRead] = useState(false);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setShowMarkAsRead(false);
  };

  const handleMarkAsRead = () => {
    setShowMarkAsRead(true);
  };

  const handleCloseMarkAsRead = () => {
    setShowMarkAsRead(false);
    if (selectedBook) {
      setSelectedBook(null);
    }
  };

  const getRatingForBook = (bookId: string) => {
    const readBook = readBooks.find((rb) => rb.book.id === bookId);
    return readBook?.rating;
  };

  return (
    <div className="read-books-page page-fade">
      <Navbar />
      <div className="read-books-content">
        <div className="read-books-header">
          <h1 className="read-books-title">Read Books</h1>
          <p className="read-books-subtitle">{readBooks.length} books you've read</p>
        </div>
        {readBooks.length === 0 ? (
          <div className="read-books-empty-state">
            <p className="read-books-empty-message">No books read yet.</p>
            <p className="read-books-empty-action">Start exploring and mark books as read!</p>
          </div>
        ) : (
          <div className="read-books-grid">
            {readBooks.map((readBook) => (
              <BookCard
                key={readBook.book.id}
                book={readBook.book}
                onClick={() => handleBookClick(readBook.book)}
                showRating={true}
                rating={readBook.rating}
              />
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
        <MarkAsReadModal book={selectedBook} onClose={handleCloseMarkAsRead} />
      )}
    </div>
  );
}

