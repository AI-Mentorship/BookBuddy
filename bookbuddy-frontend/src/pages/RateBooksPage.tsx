import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/RateBooksPage.css";

// Placeholder book data
const PLACEHOLDER_BOOKS = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: 2, title: "1984", author: "George Orwell" },
  { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen" },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
  { id: 6, title: "Lord of the Flies", author: "William Golding" },
  { id: 7, title: "Animal Farm", author: "George Orwell" },
  { id: 8, title: "Brave New World", author: "Aldous Huxley" },
];

interface RatedBook {
  id: number;
  title: string;
  author: string;
  rating: number;
}

export default function RateBooksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof PLACEHOLDER_BOOKS>([]);
  const [ratedBooks, setRatedBooks] = useState<RatedBook[]>([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Simulate search with placeholder data
      const filtered = PLACEHOLDER_BOOKS.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : PLACEHOLDER_BOOKS.slice(0, 3));
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRating = (bookId: number, rating: number) => {
    const book = searchResults.find((b) => b.id === bookId);
    if (book) {
      setRatedBooks((prev) => {
        const existing = prev.findIndex((rb) => rb.id === bookId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], rating };
          return updated;
        } else {
          return [...prev, { id: book.id, title: book.title, author: book.author, rating }];
        }
      });
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="rate-books-page page-fade">
      <div className="rate-books-content">
        <h1 className="rate-books-title">Rate books you've read</h1>
        <p className="rate-books-subtitle">
          Help us understand your taste by rating books you've enjoyed
        </p>

        <div className="rate-books-search-container">
          <div className="rate-books-search-wrapper">
            <div className="rate-books-search-icon">🔍</div>
            <input
              type="text"
              className="rate-books-search-input"
              placeholder="Search for books by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              className="rate-books-search-button"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="rate-books-results">
            {searchResults.map((book) => {
              const existingRating = ratedBooks.find((rb) => rb.id === book.id);
              return (
                <div key={book.id} className="rate-books-result-item">
                  <div className="rate-books-result-info">
                    <h3 className="rate-books-result-title">{book.title}</h3>
                    <p className="rate-books-result-author">{book.author}</p>
                  </div>
                  <div className="rate-books-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rate-books-star ${
                          existingRating && star <= existingRating.rating
                            ? "rate-books-star-filled"
                            : ""
                        }`}
                        onClick={() => handleRating(book.id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rate-books-actions">
          <button
            type="button"
            className="rate-books-skip-button"
            onClick={handleSkip}
          >
            Skip for now
          </button>
          <button
            type="button"
            className="rate-books-continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

