import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book } from "../services/api";
import "../css/SavedBooksPage.css";

export default function SavedBooksPage() {
    const { savedBooks, userProfile, loadSavedBooks } = useBooks();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);

    // Ensure latest saved books are loaded when navigating to this page
    useEffect(() => {
        if (userProfile.userId) {
            loadSavedBooks();
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
        <div className="saved-books-page page-fade">
            <Navbar />
            <div className="saved-books-content">
                <div className="saved-books-header">
                    <h1 className="saved-books-title">Your Reading List</h1>
                    <p className="saved-books-subtitle">{savedBooks.length} books saved to read later</p>
                </div>
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