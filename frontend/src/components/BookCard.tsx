import React from "react";
import type {BookDTO} from "../types/BookDTO";
import "../css/BookCard.css";

interface BookCardProps {
    book: BookDTO;
    onCardClick?: (book: BookDTO) => void;
    onSave?: (book: BookDTO) => void;
    onRead?: (book: BookDTO) => void;
    isSaved?: boolean;
    isRead?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onCardClick, onSave, onRead, isSaved, isRead }) => {

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave?.(book);
    };

    const handleReadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRead?.(book);
    };

    const handleCardClick = () => {
        onCardClick?.(book);
    };

    return (
        <div className="book-card" onClick={handleCardClick}>
            <img src={book.thumbnail || "/placeholder.png"} alt={book.title} className="book-card-image" />
            <div className="book-card-overlay">
                <div className="book-actions">
                    <button
                        className={`action-btn save-btn ${isSaved ? "active" : ""}`}
                        onClick={handleSaveClick}
                        aria-label={isSaved ? "Remove from saved" : "Save book"}
                    >
                        {isSaved ? "★" : "☆"}
                    </button>
                    <button
                        className={`action-btn read-btn ${isRead ? "active" : ""}`}
                        onClick={handleReadClick}
                        aria-label={isRead ? "Mark as unread" : "Mark as read"}
                    >
                        ✓
                    </button>
                </div>
                <div className="book-card-info">
                    <h3>{book.title}</h3>
                    <p>{book.authors?.join(", ") || "Unknown Author"}</p>
                </div>
            </div>
        </div>
    );
};

export default BookCard;