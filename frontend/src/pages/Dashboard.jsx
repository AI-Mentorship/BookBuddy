import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import "../css/Home.css";

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Function to fetch books from Open Library
  const fetchBooks = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const mappedBooks = data.docs.slice(0, 40).map((book, index) => ({
        id: index,
        title: book.title,
        author: book.author_name?.join(", ") || "Unknown Author",
        year: book.first_publish_year || "N/A",
        cover_id: book.cover_i,
      }));

      setBooks(mappedBooks);
    } catch (err) {
      console.error(err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load popular books on first render
  useEffect(() => {
    fetchBooks("horror"); // default query
  }, []);

  // 🔹 Handle user search
  const handleSearch = async (e) => {
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
        {books.length > 0 ? (
          books.map((book) => (
            <MovieCard
              key={book.id}
              book={{
                ...book,
                cover_url: book.cover_id
                  ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
                  : "https://via.placeholder.com/150x200?text=No+Cover",
              }}
            />
          ))
        ) : (
          !loading && <p style={{ textAlign: "center" }}>No books to display</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
