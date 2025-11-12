import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import FiltersSidebar, { Filters } from "../components/FiltersSidebar";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import "../css/DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { books, loading, loadBooks } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showMarkAsRead, setShowMarkAsRead] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "title" | "author" | "isbn">("all");
  const [filters, setFilters] = useState<Filters>({
    pageLength: [],
    minRating: [],
    maturity: [],
  });

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

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
    // BookDetailsModal will automatically show again with updated state
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSearchFilter("all");
    setFilters({
      pageLength: [],
      minRating: [],
      maturity: [],
    });
    // Reload books from backend
    loadBooks();
  };

  const filteredBooks = useMemo(() => {
    let filtered = books;

    // Apply search query with filter
    const query = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((book) => {
      if (!query) return true;

      switch (searchFilter) {
        case "title":
          return book.title.toLowerCase().includes(query);
        case "author":
          return book.author.toLowerCase().includes(query);
        case "isbn":
          return book.isbn?.toLowerCase().includes(query);
        default:
          return (
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.isbn?.toLowerCase().includes(query)
          );
      }
    });

    // Apply page length filters
    if (filters.pageLength.length > 0) {
      filtered = filtered.filter((book) => {
        return filters.pageLength.some((filter) => {
          if (filter === "0-200 pages") return book.pages <= 200;
          if (filter === "200-400 pages") return book.pages > 200 && book.pages <= 400;
          if (filter === "400-600 pages") return book.pages > 400 && book.pages <= 600;
          if (filter === "600+ pages") return book.pages > 600;
          return false;
        });
      });
    }

    // Apply min rating filters
    if (filters.minRating.length > 0) {
      filtered = filtered.filter((book) => {
        return filters.minRating.some((filter) => {
          if (filter === "5 Stars") return book.rating >= 5;
          if (filter === "4+ Stars") return book.rating >= 4;
          if (filter === "3+ Stars") return book.rating >= 3;
          if (filter === "2+ Stars") return book.rating >= 2;
          return false;
        });
      });
    }

    // Apply maturity filters
    if (filters.maturity.length > 0) {
      filtered = filtered.filter((book) => filters.maturity.includes(book.maturity));
    }

    return filtered;
  }, [books, searchQuery, searchFilter, filters]);

  const showFilters = searchQuery.length > 0;

  return (
    <div className="dashboard-page page-fade">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchFilter={searchFilter}
        onSearchFilterChange={(filter) => setSearchFilter(filter as "all" | "title" | "author" | "isbn")}
      />
      <div className="dashboard-layout">
        {showFilters && (
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
        )}
        <div className={`dashboard-content ${showFilters ? "dashboard-content-with-sidebar" : ""}`}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#9ca3af", fontWeight: 600 }}>Loading books...</p>
          ) : filteredBooks.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", fontWeight: 600 }}>No books found.</p>
          ) : (
            <div className="dashboard-grid">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
              ))}
            </div>
          )}
          <button className="dashboard-refresh-button" onClick={handleRefresh}>
            <span className="dashboard-refresh-icon">↻</span>
            Refresh
          </button>
        </div>
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
        />
      )}
    </div>
  );
}
