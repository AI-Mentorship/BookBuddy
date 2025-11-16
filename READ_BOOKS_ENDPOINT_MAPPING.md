# Read Books Endpoint Mapping & Frontend Integration

## Overview
This document maps the frontend Read Books page components to backend endpoints, verifies DTO compatibility, and provides example React code for each operation.

---

## Operation: Fetch Read Books

**Endpoint:** `GET /read-books/read-books/{userId}`

**Request DTO:** Path parameter `userId` (Long)

**Response DTO:** `List<GetReadBookResponse>`

**Backend GetReadBookResponse Structure:**
```java
// Extends BookDTO, adds:
{
    // All BookDTO fields:
    googleBooksId: String,
    title: String,
    authors: List<String>,
    publisher: String,
    publishedDate: String,
    description: String,
    pageCount: Integer,
    categories: List<String>,
    averageRating: Double,
    maturityRating: String,
    thumbnail: String,
    language: String,
    previewLink: String,
    
    // Additional fields:
    privateReview: String,
    privateRating: Double
}
```

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly maps `GetReadBookResponse` to `ReadBook` interface: `{ book: Book; rating: number; review?: string }`
- Handles 204 No Content response for empty lists
- Maps `privateRating` to `rating` and `privateReview` to `review`

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 155-194)
export async function getReadBooks(userId: number): Promise<ReadBook[]> {
    const endpoints = [
        `${API_BASE_URL}/read-books/read-books/${userId}`, // legacy method path
        `${API_BASE_URL}/read-books/user/${userId}`, // cleaner alias if present
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 204) return []; // No content
                continue;
            }

            let data: any;
            try {
                data = await response.json();
            } catch (_) {
                continue;
            }

            return Array.isArray(data)
                ? data.map((item: any) => ({
                      book: mapDtoToBook(item),
                      rating: typeof item.privateRating === "number" ? item.privateRating : 0,
                      review: item.privateReview,
                  }))
                : [];
        } catch (_) {
            continue;
        }
    }

    throw new Error("Failed to fetch read books");
}
```

**Example Frontend Code:**
```typescript
import { useState, useEffect } from 'react';
import { getReadBooks } from '../services/api';
import { ReadBook } from '../services/api';

function ReadBooksList({ userId }: { userId: number }) {
    const [readBooks, setReadBooks] = useState<ReadBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReadBooks = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                setError(null);
                const books = await getReadBooks(userId);
                setReadBooks(books);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load read books');
                setReadBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReadBooks();
    }, [userId]);

    if (loading) return <div>Loading read books...</div>;
    if (error) return <div>Error: {error}</div>;
    if (readBooks.length === 0) return <div>No read books found.</div>;

    return (
        <div>
            <h2>Your Read Books ({readBooks.length})</h2>
            <ul>
                {readBooks.map((readBook) => (
                    <li key={readBook.book.id}>
                        <img src={readBook.book.coverImage} alt={readBook.book.title} />
                        <h3>{readBook.book.title}</h3>
                        <p>By {readBook.book.author}</p>
                        <div>
                            Rating: {readBook.rating}/5
                            {readBook.review && <p>Review: {readBook.review}</p>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 134-160)
const loadReadBooks = async () => {
    if (!userProfile.userId) {
        console.log("loadReadBooks - No userId, skipping");
        return;
    }

    try {
        setLoading(true);
        const books = await api.getReadBooks(userProfile.userId);
        setReadBooks(books);

        const ratingsMap: Record<string, { stars: number; review?: string }> = {};
        books.forEach((rb) => {
            ratingsMap[rb.book.id] = { stars: rb.rating, review: rb.review };
        });
        setRatings(ratingsMap);
    } catch (error) {
        console.error("loadReadBooks - Error:", error);
        setReadBooks([]);
    } finally {
        setLoading(false);
    }
};
```

---

## Operation: Add Read Book

**Endpoint:** `POST /read-books/save`

**Request DTO:** `ReadBookRequest`
```java
{
    userId: Long,
    googleBooksId: String,
    privateReview: String,
    privateRating: double
}
```

**Response DTO:** `ReadBookResponse`
```java
{
    userId: Long,
    googleBooksId: String,
    privateReview: String,
    privateRating: double
}
```

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly sends `{ userId, googleBooksId, privateRating, privateReview }` matching `ReadBookRequest`
- Frontend handles duplicate book scenario (409 status) by falling back to update
- Backend returns 201 CREATED with `ReadBookResponse`

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 90-130)
export async function markBookAsRead(
    userId: number,
    googleBooksId: string,
    rating: number,
    review?: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/read-books/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            googleBooksId,
            privateRating: rating,
            privateReview: review || "",
        }),
    });

    // If the book is already marked as read, gracefully fall back to updating
    if (!response.ok) {
        if (response.status === 409) {
            await updateReview(userId, googleBooksId, rating, review);
            return;
        }
        // Check error text for "already read" message
        try {
            const errText = await response.text();
            if (typeof errText === "string" && /already\s+read/i.test(errText)) {
                await updateReview(userId, googleBooksId, rating, review);
                return;
            }
        } catch (_) {
            // ignore parse errors
        }
        throw new Error("Failed to mark book as read");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState } from 'react';
import { markBookAsRead } from '../services/api';
import { Book } from '../services/api';

function MarkAsReadButton({ 
    book, 
    userId,
    onSuccess 
}: { 
    book: Book; 
    userId: number;
    onSuccess?: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    const handleSubmit = async () => {
        if (!userId) {
            setError("You must be logged in to mark books as read");
            return;
        }

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            await markBookAsRead(userId, book.id, rating, review || undefined);
            
            // Call success callback to refresh the list
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to mark book as read';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div>
                <label>Rating:</label>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={star <= rating ? 'selected' : ''}
                    >
                        ★
                    </button>
                ))}
            </div>
            <textarea
                placeholder="Write a review (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={saving || rating === 0}>
                {saving ? 'Saving...' : 'Mark as Read'}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 194-220)
const markAsRead = async (book: Book, rating: number, review?: string) => {
    if (!userProfile.userId) {
        throw new Error("User must be logged in to mark books as read");
    }

    try {
        await api.markBookAsRead(userProfile.userId, book.id, rating, review);

        setReadBooks((prev) => {
            const existing = prev.findIndex((rb) => rb.book.id === book.id);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { book, rating, review };
                return updated;
            }
            return [...prev, { book, rating, review }];
        });

        setRatings((prev) => ({
            ...prev,
            [book.id]: { stars: rating, review },
        }));
    } catch (error) {
        console.error("Failed to mark as read:", error);
        throw error;
    }
};
```

---

## Operation: Bulk Add Read Books

**Endpoint:** `POST /read-books/saveAll`

**Request DTO:** `List<ReadBookRequest>`
```java
[
    {
        userId: Long,
        googleBooksId: String,
        privateReview: String,
        privateRating: double
    },
    // ... more books
]
```

**Response DTO:** `Map<String, String>`
```java
{
    "status": "success"
}
```

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly sends array of `ReadBookRequest` objects
- Frontend expects a success response but doesn't use the response data

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 132-153)
export async function saveAllReadBooks(
    userId: number,
    books: Array<{ googleBooksId: string; rating: number; review?: string }>
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/read-books/saveAll`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            books.map((book) => ({
                userId,
                googleBooksId: book.googleBooksId,
                privateRating: book.rating,
                privateReview: book.review || "",
            }))
        ),
    });
    if (!response.ok) {
        throw new Error("Failed to save read books");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState } from 'react';
import { saveAllReadBooks } from '../services/api';
import { Book } from '../services/api';

interface BulkReadBook {
    book: Book;
    rating: number;
    review?: string;
}

function BulkMarkAsRead({ 
    books, 
    userId,
    onSuccess 
}: { 
    books: BulkReadBook[]; 
    userId: number;
    onSuccess?: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleBulkSave = async () => {
        if (!userId) {
            setError("You must be logged in to mark books as read");
            return;
        }

        if (books.length === 0) {
            setError("No books to save");
            return;
        }

        // Validate all books have ratings
        const invalidBooks = books.filter(b => !b.rating || b.rating === 0);
        if (invalidBooks.length > 0) {
            setError(`Please provide ratings for all books`);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            
            await saveAllReadBooks(
                userId,
                books.map(b => ({
                    googleBooksId: b.book.id,
                    rating: b.rating,
                    review: b.review
                }))
            );
            
            setSuccess(true);
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save read books';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h3>Bulk Mark as Read ({books.length} books)</h3>
            <button 
                onClick={handleBulkSave} 
                disabled={saving || books.length === 0}
            >
                {saving ? 'Saving...' : `Mark ${books.length} Books as Read`}
            </button>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">Successfully saved {books.length} books!</div>}
        </div>
    );
}
```

**Usage Example:**
```typescript
// Example usage in a component
function ImportReadBooks({ userId }: { userId: number }) {
    const [selectedBooks, setSelectedBooks] = useState<BulkReadBook[]>([]);

    const handleBulkImport = async () => {
        try {
            await saveAllReadBooks(userId, selectedBooks);
            // Refresh read books list
            loadReadBooks();
        } catch (error) {
            console.error("Failed to import books:", error);
        }
    };

    return (
        <BulkMarkAsRead 
            books={selectedBooks} 
            userId={userId}
            onSuccess={() => {
                setSelectedBooks([]);
                // Refresh UI
            }}
        />
    );
}
```

---

## Operation: Update Review

**Endpoint:** `PUT /read-books/update-review`

**Request DTO:** `ReadBookRequest`
```java
{
    userId: Long,
    googleBooksId: String,
    privateReview: String,
    privateRating: double
}
```

**Response DTO:** `ReadBookResponse`
```java
{
    userId: Long,
    googleBooksId: String,
    privateReview: String,
    privateRating: double
}
```

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly sends `ReadBookRequest` format
- Frontend currently ignores the response, but it's available if needed
- Backend returns 200 OK with `ReadBookResponse`

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 196-217)
export async function updateReview(
    userId: number,
    googleBooksId: string,
    rating: number,
    review?: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/read-books/update-review`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            googleBooksId,
            privateRating: rating,
            privateReview: review || "",
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to update review");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState, useEffect } from 'react';
import { updateReview } from '../services/api';
import { Book } from '../services/api';

function EditReviewModal({ 
    book, 
    userId,
    initialRating,
    initialReview,
    onClose,
    onSuccess 
}: { 
    book: Book; 
    userId: number;
    initialRating?: number;
    initialReview?: string;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const [rating, setRating] = useState(initialRating ?? 0);
    const [review, setReview] = useState(initialReview ?? "");
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setRating(initialRating ?? 0);
        setReview(initialReview ?? "");
    }, [initialRating, initialReview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userId) {
            setError("You must be logged in to update reviews");
            return;
        }

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        try {
            setUpdating(true);
            setError(null);
            
            await updateReview(userId, book.id, rating, review || undefined);
            
            onSuccess?.();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
            setError(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <h2>Edit Review</h2>
                <p>{book.title} by {book.author}</p>
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Rating:</label>
                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => {
                                        setRating(star);
                                        setError(null);
                                    }}
                                    className={star <= rating ? 'selected' : ''}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label>Review (Optional):</label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={6}
                            placeholder="Share your thoughts about this book..."
                        />
                    </div>
                    
                    {error && <div className="error">{error}</div>}
                    
                    <div>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={updating || rating === 0}>
                            {updating ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 222-250)
const updateExistingReview = async (book: Book, rating: number, review?: string) => {
    if (!userProfile.userId) {
        throw new Error("User must be logged in to update reviews");
    }

    try {
        await api.updateReview(userProfile.userId, book.id, rating, review);

        // Update local state for readBooks and ratings
        setReadBooks((prev) => {
            const idx = prev.findIndex((rb) => rb.book.id === book.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { book, rating, review };
                return updated;
            }
            return [...prev, { book, rating, review }];
        });

        setRatings((prev) => ({
            ...prev,
            [book.id]: { stars: rating, review },
        }));
    } catch (error) {
        console.error("Failed to update review:", error);
        throw error;
    }
};
```

**Usage in MarkAsReadModal:**
```typescript
// Already implemented in MarkAsReadModal.tsx (lines 20-42)
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
        setError("Please select a rating.");
        return;
    }
    try {
        if (mode === "edit") {
            await updateExistingReview(book, rating, review || undefined);
        } else {
            await markAsRead(book, rating, review || undefined);
        }
        onClose();
    } catch (error) {
        console.error("Failed to create review:", error);
        setError("Failed to save review. Please try again.");
    }
};
```

---

## Operation: Delete Read Book

**Endpoint:** `DELETE /read-books/delete/{userId}/{googleBooksId}`

**Request DTO:** Path parameters `userId` (Long) and `googleBooksId` (String)

**Response DTO:** `Void` (200 OK)

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly constructs the URL with path parameters
- Handles the void response appropriately

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 219-226)
export async function deleteReadBook(userId: number, googleBooksId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/read-books/delete/${userId}/${googleBooksId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete read book");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState } from 'react';
import { deleteReadBook } from '../services/api';
import { Book } from '../services/api';

function DeleteReadBookButton({ 
    book, 
    userId, 
    onDeleteSuccess 
}: { 
    book: Book; 
    userId: number;
    onDeleteSuccess?: () => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!userId) {
            setError("You must be logged in to delete read books");
            return;
        }

        // Confirm deletion
        if (!window.confirm(`Are you sure you want to remove "${book.title}" from your read books?`)) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);
            
            await deleteReadBook(userId, book.id);
            
            // Call success callback to refresh the list
            onDeleteSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete read book';
            setError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="delete-button"
            >
                {deleting ? 'Removing...' : 'Remove from Read Books'}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 260-277)
const removeReview = async (bookId: string) => {
    if (!userProfile.userId) {
        throw new Error("User must be logged in to remove reviews");
    }

    try {
        await api.deleteReadBook(userProfile.userId, bookId);
        setReadBooks((prev) => prev.filter((rb) => rb.book.id !== bookId));
        setRatings((prev) => {
            const updated = { ...prev };
            delete updated[bookId];
            return updated;
        });
    } catch (error) {
        console.error("Failed to remove review:", error);
        throw error;
    }
};
```

**Usage in MyReviewsPage:**
```typescript
// Already implemented in MyReviewsPage.tsx (lines 55-59)
const handleDeleteReview = (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
        removeReview(bookId);
    }
};
```

---

## Operation: Get Total Read Books Count

**Endpoint:** `GET /read-books/total/{userId}`

**Request DTO:** Path parameter `userId` (Long)

**Response DTO:** `Integer`

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend function exists and correctly expects a number
- Currently not used in ReadBooksPage, but available

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 228-234)
export async function getTotalReadBooks(userId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/read-books/total/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to get total read books");
    }
    return await response.json();
}
```

**Example Frontend Code:**
```typescript
import { useState, useEffect } from 'react';
import { getTotalReadBooks } from '../services/api';

function ReadBooksCount({ userId }: { userId: number }) {
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                setError(null);
                const count = await getTotalReadBooks(userId);
                setTotalCount(count);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get count');
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, [userId]);

    if (loading) return <span>Loading...</span>;
    if (error) return <span>Error loading count</span>;
    
    return <span>{totalCount ?? 0} books read</span>;
}
```

**Suggested Integration in ReadBooksPage:**
```typescript
// Enhanced ReadBooksPage with total count from backend
import { useEffect, useState } from "react";
import { useBooks } from "../context/BooksContext";
import { getTotalReadBooks } from "../services/api";
import "../css/ReadBooksPage.css";

export default function ReadBooksPage() {
    const { readBooks, loadReadBooks, userProfile, loading } = useBooks();
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);

    useEffect(() => {
        if (userProfile.userId) {
            loadReadBooks();
            // Optionally fetch total count from backend
            getTotalReadBooks(userProfile.userId)
                .then(setTotalCount)
                .catch((err) => {
                    console.error("Failed to get total count:", err);
                    // Fallback to local count
                    setTotalCount(readBooks.length);
                });
        }
    }, [userProfile.userId]);

    // Use backend count if available, otherwise use local count
    const displayCount = totalCount !== null ? totalCount : readBooks.length;

    return (
        <div className="read-books-page page-fade">
            <Navbar />
            <div className="read-books-content">
                <div className="read-books-header">
                    <h1 className="read-books-title">Read Books</h1>
                    <p className="read-books-subtitle">
                        {displayCount} {displayCount === 1 ? 'book' : 'books'} you've read
                    </p>
                </div>
                {/* ... rest of component ... */}
            </div>
        </div>
    );
}
```

---

## Summary of Findings

### ✅ Compatible Mappings
1. **GET /read-books/read-books/{userId}** - Frontend correctly fetches and maps `List<GetReadBookResponse>` to `ReadBook[]`
2. **POST /read-books/save** - Frontend correctly sends `ReadBookRequest` format with duplicate handling
3. **POST /read-books/saveAll** - Frontend correctly sends `List<ReadBookRequest>`
4. **PUT /read-books/update-review** - Frontend correctly sends `ReadBookRequest` format
5. **DELETE /read-books/delete/{userId}/{googleBooksId}** - Frontend correctly constructs URL
6. **GET /read-books/total/{userId}** - Frontend function exists and is compatible

### 🔧 Suggested Improvements

1. **Enhanced Error Handling:**
   - The `markBookAsRead` function already handles duplicate books gracefully by falling back to update
   - Consider adding more specific error messages for different failure scenarios
   - Add retry logic for network failures

2. **Use Backend Total Count:**
   - Currently `ReadBooksPage` uses `readBooks.length` for the count
   - Consider using `getTotalReadBooks()` API call for accurate count from backend
   - This ensures consistency even if local state is out of sync

3. **Response Handling:**
   - `markBookAsRead` and `updateReview` currently return `void` but backend returns `ReadBookResponse`
   - Consider updating to return the response for better confirmation and to update local state with server data

4. **Bulk Operations UI:**
   - `saveAllReadBooks` function exists but there's no UI component using it
   - Consider adding a bulk import feature for users to import multiple books at once

5. **Loading States:**
   - Add loading indicators for individual operations (save, update, delete)
   - Show progress for bulk operations

6. **Optimistic Updates:**
   - Current implementation updates local state immediately
   - Consider adding rollback logic if API call fails

### 📝 Missing Code/Adjustments

1. **ReadBooksPage Enhancement:**
   - Add error state handling for failed API calls
   - Add loading state while fetching read books
   - Consider using `getTotalReadBooks` for count display
   - Add refresh functionality

2. **Delete Confirmation:**
   - The current implementation in `MyReviewsPage` asks for confirmation
   - Consider adding a more user-friendly confirmation modal

3. **Review Display:**
   - Consider showing review dates if backend adds them
   - Add ability to filter/sort read books by rating or date

4. **Bulk Operations:**
   - No UI component exists for bulk marking books as read
   - Consider adding this feature for better UX

---

## Complete Example: Enhanced ReadBooksPage Component

```typescript
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book, getTotalReadBooks } from "../services/api";
import "../css/ReadBooksPage.css";

export default function ReadBooksPage() {
    const { readBooks, loadReadBooks, userProfile, loading } = useBooks();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!userProfile.userId) {
                return;
            }

            try {
                setError(null);
                
                // Load read books
                await loadReadBooks();
                
                // Optionally fetch total count from backend
                try {
                    const count = await getTotalReadBooks(userProfile.userId);
                    setTotalCount(count);
                } catch (countError) {
                    console.warn("Failed to get total count, using local count");
                    setTotalCount(readBooks.length);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load read books");
            }
        };

        loadData();
    }, [userProfile.userId]);

    const handleRefresh = async () => {
        if (!userProfile.userId) return;
        
        try {
            setRefreshing(true);
            setError(null);
            await loadReadBooks();
            
            // Refresh total count
            try {
                const count = await getTotalReadBooks(userProfile.userId);
                setTotalCount(count);
            } catch (countError) {
                setTotalCount(readBooks.length);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh");
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
        // Refresh read books after marking as read
        if (userProfile.userId) {
            loadReadBooks();
        }
    };

    const displayCount = totalCount !== null ? totalCount : readBooks.length;

    if (loading && readBooks.length === 0) {
        return (
            <div className="read-books-page page-fade">
                <Navbar />
                <div className="read-books-content">
                    <div className="loading">Loading your read books...</div>
                </div>
            </div>
        );
    }

    if (error && readBooks.length === 0) {
        return (
            <div className="read-books-page page-fade">
                <Navbar />
                <div className="read-books-content">
                    <div className="error-message">
                        <p>Error: {error}</p>
                        <button onClick={handleRefresh}>Retry</button>
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
                    >
                        {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>
                
                {error && readBooks.length > 0 && (
                    <div className="error-banner">
                        <p>Warning: {error}</p>
                        <button onClick={handleRefresh}>Retry</button>
                    </div>
                )}
                
                {readBooks.length === 0 ? (
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
```

---

## DTO Verification Summary

| Endpoint | Request DTO | Frontend Sends | Status |
|----------|------------|----------------|--------|
| GET /read-books/read-books/{userId} | Path param: `userId` | ✅ Correct | ✅ Match |
| POST /read-books/save | `ReadBookRequest: { userId, googleBooksId, privateReview, privateRating }` | ✅ Correct format | ✅ Match |
| POST /read-books/saveAll | `List<ReadBookRequest>` | ✅ Correct array format | ✅ Match |
| PUT /read-books/update-review | `ReadBookRequest: { userId, googleBooksId, privateReview, privateRating }` | ✅ Correct format | ✅ Match |
| DELETE /read-books/delete/{userId}/{googleBooksId} | Path params: `userId`, `googleBooksId` | ✅ Correct URL construction | ✅ Match |
| GET /read-books/total/{userId} | Path param: `userId` | ✅ Correct | ✅ Match |

| Endpoint | Response DTO | Frontend Expects | Status |
|----------|-------------|------------------|--------|
| GET /read-books/read-books/{userId} | `List<GetReadBookResponse>` | `ReadBook[]` (mapped) | ✅ Match |
| POST /read-books/save | `ReadBookResponse` | `void` (ignored) | ⚠️ Could use response |
| POST /read-books/saveAll | `Map<String, String>` | `void` (ignored) | ✅ Match |
| PUT /read-books/update-review | `ReadBookResponse` | `void` (ignored) | ⚠️ Could use response |
| DELETE /read-books/delete/{userId}/{googleBooksId} | `Void` | `void` | ✅ Match |
| GET /read-books/total/{userId} | `Integer` | `number` | ✅ Match |

**All DTOs are compatible!** ✅

---

## Key Implementation Notes

1. **Duplicate Book Handling:** The frontend `markBookAsRead` function intelligently handles the case where a book is already marked as read by automatically falling back to the update endpoint. This provides a seamless user experience.

2. **Response Mapping:** The `getReadBooks` function correctly maps `GetReadBookResponse` (which extends `BookDTO`) to the frontend `ReadBook` interface, extracting `privateRating` and `privateReview` into the appropriate fields.

3. **Error Resilience:** The frontend includes fallback logic for the GET endpoint, trying multiple URL patterns to handle different backend configurations.

4. **State Management:** The `BooksContext` properly maintains both `readBooks` and `ratings` state, keeping them in sync when books are added, updated, or deleted.

