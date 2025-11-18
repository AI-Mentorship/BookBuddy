import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book, ReadBook } from "../services/api";
import { readBooksApi } from "../services/axiosApi";
import "../css/ReadBooksPage.css";

export default function ReadBooksPage() {
    const { userProfile, readBooks: contextReadBooks, loadReadBooks: loadContextReadBooks } = useBooks();
    const [readBooks, setReadBooks] = useState<ReadBook[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);

    // Load read books and total count - OPTIMIZED: Use context data if available
    const loadReadBooks = async (forceRefresh = false) => {
        if (!userProfile.userId) {
            setLoading(false);
            return;
        }

        // Use context data if available and not forcing refresh
        if (!forceRefresh && contextReadBooks.length > 0) {
            setReadBooks(contextReadBooks);
            setTotalCount(contextReadBooks.length);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const [books, count] = await Promise.all([
                readBooksApi.getReadBooks(userProfile.userId!),
                readBooksApi.getTotalReadBooks(userProfile.userId!).catch(() => null),
            ]);
            setReadBooks(books);
            setTotalCount(count);
            // Refresh context data
            await loadContextReadBooks();
        } catch (err) {
            setError("Failed to load read books. Please try again.");
            setReadBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load - use context data if available
    useEffect(() => {
        if (userProfile.userId) {
            if (contextReadBooks.length > 0) {
                // Use context data immediately
                setReadBooks(contextReadBooks);
                setTotalCount(contextReadBooks.length);
                setLoading(false);
            } else {
                // Load if context doesn't have data
                setLoading(true);
                loadReadBooks();
            }
        } else {
            setLoading(false);
            setReadBooks([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile.userId, contextReadBooks.length]);

    // Handle refresh - force refresh from API
    const handleRefresh = async () => {
        if (!userProfile.userId) return;

        try {
            setRefreshing(true);
            setError(null);
            await loadReadBooks(true); // Force refresh
        } catch (err) {
            setError("Failed to refresh. Please try again.");
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

    const handleOpenMarkAsRead = () => {
        setShowMarkAsRead(true);
    };

    const handleCloseMarkAsRead = async () => {
        setShowMarkAsRead(false);
        if (selectedBook) {
            setSelectedBook(null);
        }
        // Refresh read books after marking as read
        if (userProfile.userId) {
            await loadReadBooks();
        }
    };

    const displayCount = totalCount !== null ? totalCount : readBooks.length;

    // Loading state
    if (loading && readBooks.length === 0) {
        return (
            <div className="read-books-page page-fade">
                <Navbar />
                <div className="read-books-content">
                    <div className="read-books-empty-state">
                        <p className="read-books-empty-message">Loading your read books…</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state (when no books loaded)
    if (error && readBooks.length === 0) {
        return (
            <div className="read-books-page page-fade">
                <Navbar />
                <div className="read-books-content">
                    <div className="read-books-empty-state">
                        <p className="read-books-empty-message">Failed to load read books. Please try again.</p>
                        <button onClick={handleRefresh} className="read-books-retry-button">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="read-books-page page-fade">
            <Navbar />
            <div className="read-books-content">
                <div className="read-books-header">
                    <div>
                        <h1 className="read-books-title">Read Books</h1>
                        <p className="read-books-subtitle">
                            {displayCount} {displayCount === 1 ? 'book' : 'books'} you've read
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="refresh-button"
                        title="Refresh books"
                    >
                        {refreshing ? (
                            <div className="loading-spinner-small"></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        )}
                    </button>
                </div>

                {error && readBooks.length > 0 && (
                    <div className="read-books-error-banner">
                        <p>Something went wrong. Please try refreshing.</p>
                        <button onClick={handleRefresh}>Retry</button>
                    </div>
                )}

                {readBooks.length === 0 ? (
                    <div className="read-books-empty-state">
                        <p className="read-books-empty-message">You haven't read any books yet.</p>
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
                    onMarkAsRead={handleOpenMarkAsRead}
                />
            )}

            {selectedBook && showMarkAsRead && (
                <MarkAsReadModal
                    book={selectedBook}
                    onClose={handleCloseMarkAsRead}
                    mode={readBooks.some((rb) => rb.book.id === selectedBook.id) ? "edit" : "create"}
                    initialRating={readBooks.find((rb) => rb.book.id === selectedBook.id)?.rating}
                    initialReview={readBooks.find((rb) => rb.book.id === selectedBook.id)?.review}
                />
            )}
        </div>
    );
}