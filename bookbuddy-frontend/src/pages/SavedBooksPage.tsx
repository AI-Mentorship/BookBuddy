import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import { savedBooksApi } from "../services/axiosApi";
import "../css/SavedBooksPage.css";

export default function SavedBooksPage() {
    const { userProfile } = useBooks();
    const [savedBooks, setSavedBooks] = useState<Book[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);

    // Load saved books and total count
    const loadSavedBooks = async () => {
        if (!userProfile.userId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const [books, count] = await Promise.all([
                savedBooksApi.getSavedBooks(userProfile.userId!),
                savedBooksApi.getTotalSavedBooks(userProfile.userId!).catch(() => null),
            ]);
            setSavedBooks(books);
            setTotalCount(count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load saved books";
            setError(errorMessage);
            setSavedBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (userProfile.userId) {
            setLoading(true);
            loadSavedBooks();
        } else {
            setLoading(false);
            setSavedBooks([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile.userId]);

    // Handle refresh
    const handleRefresh = async () => {
        if (!userProfile.userId) return;

        try {
            setRefreshing(true);
            setError(null);
            await loadSavedBooks();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to refresh";
            setError(errorMessage);
        } finally {
            setRefreshing(false);
        }
    };


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
        // Refresh saved books after marking as read
        if (userProfile.userId) {
            loadSavedBooks();
        }
    };

    const displayCount = totalCount !== null ? totalCount : savedBooks.length;

    // Loading state
    if (loading && savedBooks.length === 0) {
        return (
            <div className="saved-books-page page-fade">
                <Navbar />
                <div className="saved-books-content">
                    <div className="saved-books-empty-state">
                        <p className="saved-books-empty-message">Loading your reading list…</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state (when no books loaded)
    if (error && savedBooks.length === 0) {
        return (
            <div className="saved-books-page page-fade">
                <Navbar />
                <div className="saved-books-content">
                    <div className="saved-books-empty-state">
                        <p className="saved-books-empty-message">Error: {error}</p>
                        <button onClick={handleRefresh} className="saved-books-retry-button">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-books-page page-fade">
            <Navbar />
            <div className="saved-books-content">
                <div className="saved-books-header">
                    <div>
                        <h1 className="saved-books-title">Your Reading List</h1>
                        <p className="saved-books-subtitle">
                            {displayCount} {displayCount === 1 ? 'book' : 'books'} saved to read later
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="saved-books-refresh-button"
                    >
                        {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>

                {error && savedBooks.length > 0 && (
                    <div className="saved-books-error-banner">
                        <p>Warning: {error}</p>
                        <button onClick={handleRefresh}>Retry</button>
                    </div>
                )}

                {savedBooks.length === 0 ? (
                    <div className="saved-books-empty-state">
                        <p className="saved-books-empty-message">Your reading list is empty.</p>
                        <p className="saved-books-empty-action">Save books you want to read!</p>
                    </div>
                ) : (
                    <div className="saved-books-grid">
                        {savedBooks.map((book) => (
                            <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
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