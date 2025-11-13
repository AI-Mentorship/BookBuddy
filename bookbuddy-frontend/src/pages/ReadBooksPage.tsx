import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import "../css/ReadBooksPage.css";

export default function ReadBooksPage() {
    const { readBooks, loadReadBooks, userProfile, loading } = useBooks();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log("ReadBooksPage - userProfile:", userProfile);
        console.log("ReadBooksPage - readBooks:", readBooks);
        console.log("ReadBooksPage - loading:", loading);
    }, [userProfile, readBooks, loading]);

    // Ensure we fetch from backend when user navigates here
    useEffect(() => {
        console.log("ReadBooksPage - useEffect triggered, userId:", userProfile.userId);
        if (userProfile.userId) {
            console.log("ReadBooksPage - calling loadReadBooks()");
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

    return (
        <div className="read-books-page page-fade">
            <Navbar />
            <div className="read-books-content">
                <div className="read-books-header">
                    <h1 className="read-books-title">Read Books</h1>
                    <p className="read-books-subtitle">{readBooks.length} books you've read</p>
                </div>
                {loading && readBooks.length === 0 ? (
                    <div className="read-books-empty-state">
                        <p className="read-books-empty-message">Loading your read books…</p>
                    </div>
                ) : readBooks.length === 0 ? (
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