import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import "../css/Home.css";
import type { Book } from "../context/BookContext";

interface OpenLibraryBook {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchBooks = async (query: string): Promise<void> => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const mappedBooks: Book[] = data.docs
        .slice(0, 40)
        .map((book: OpenLibraryBook, index: number) => ({
          id: index,
          title: book.title,
          author: book.author_name?.join(", ") || "Unknown Author",
          year: book.first_publish_year?.toString() || "N/A",
          cover_url: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Cover",
        }));

      setBooks(mappedBooks);
    } catch (err) {
      console.error(err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks("horror");
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await fetchBooks(searchQuery);
    setSearchQuery("");
  };

  return (
    <div className="Dashboard">
      <div className="Form">
        <form onSubmit={handleSearch} className="search_Form">
          <input
            type="text"
            placeholder="Search for Books"
            className="search_input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button type="submit" className="search_button">
            Search
          </button>
        </form>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div className="books-grid">
        {books.length > 0
          ? books.map((book) => <MovieCard key={book.id} book={book} />)
          : !loading && (
              <p style={{ textAlign: "center" }}>No books to display</p>
            )}
      </div>
    </div>
  );
}

export default Dashboard;
