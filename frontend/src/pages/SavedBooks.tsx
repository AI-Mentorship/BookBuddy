import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import "../css/SavedBooks.css";
import { useAuth } from "../context/AuthContext";
import type {BookDTO} from "../types/BookDTO";

const SavedBooks: React.FC = () => {
    const { userId } = useAuth();
    const [savedBooks, setSavedBooks] = useState<BookDTO[]>([]);
    const [readBooks, setReadBooks] = useState<BookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<BookDTO | null>(null);

    const fetchSavedBooks = async () => {
        console.log("userId:", userId);
        if (!userId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/saved-books/user/${userId}`);
            console.log(response);
            if (!response.ok) throw new Error("Failed to fetch saved books");
            const data: BookDTO[] = await response.json();
            setSavedBooks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedBooks();
    }, [userId]);

    const handleSave = async (book: BookDTO) => {
        if (!userId) return;
        try {
            const isSaved = savedBooks.some(b => b.googleBooksId === book.googleBooksId);
            if (isSaved) {
                await fetch(`http://localhost:8080/saved-books/delete/user/${userId}/book/${book.googleBooksId}`, {
                    method: "DELETE",
                });
                setSavedBooks(savedBooks.filter(b => b.googleBooksId !== book.googleBooksId));
            } else {
                await fetch("http://localhost:8080/saved-books/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, googleBooksId: book.googleBooksId }),
                });
                setSavedBooks([...savedBooks, book]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToRead = (book: BookDTO) => {
        if (!readBooks.some(b => b.googleBooksId === book.googleBooksId)) {
            setReadBooks([...readBooks, book]);
            console.log("Added to read:", book.title);
            // TODO: later open review/rating modal
        }
    };

    const openModal = (book: BookDTO) => setSelectedBook(book);
    const closeModal = () => setSelectedBook(null);

    return (
        <div className="saved-books-page">
            <h1 className="page-title">Saved Books</h1>

            {loading ? (
                <p className="loading-message">Loading books...</p>
            ) : savedBooks.length === 0 ? (
                <p className="empty-message">No saved books yet.</p>
            ) : (
                <div className="books-masonry">
                    {savedBooks.map((book) => (
                        <BookCard
                            key={book.googleBooksId}
                            book={book}
                            onCardClick={openModal}
                            onSave={handleSave}
                            onRead={handleAddToRead}
                            isSaved={savedBooks.some(b => b.googleBooksId === book.googleBooksId)}
                            isRead={readBooks.some(b => b.googleBooksId === book.googleBooksId)}
                        />
                    ))}
                </div>
            )}

            {selectedBook && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div className="modal-body">
                            <div className="modal-left">
                                <img src={selectedBook.thumbnail} alt={selectedBook.title} />
                                <a href={selectedBook.previewLink} target="_blank" rel="noopener noreferrer" className="preview-link">
                                    Preview Book
                                </a>
                            </div>
                            <div className="modal-right">
                                <h2>{selectedBook.title}</h2>
                                <p>{selectedBook.authors?.join(", ") || "Unknown"}</p>
                                <p>{selectedBook.description}</p>
                                <p><strong>Published:</strong> {selectedBook.publishedDate}</p>
                                <p><strong>Publisher:</strong> {selectedBook.publisher}</p>
                                <p><strong>Pages:</strong> {selectedBook.pageCount}</p>
                                <p><strong>Categories:</strong> {selectedBook.categories?.join(", ")}</p>
                                {selectedBook.averageRating > 0 && <p><strong>Rating:</strong> {selectedBook.averageRating}/5</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedBooks;
