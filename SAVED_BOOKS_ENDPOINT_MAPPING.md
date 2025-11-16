# Saved Books Endpoint Mapping & Frontend Integration

## Overview
This document maps the frontend Saved Books page components to backend endpoints, verifies DTO compatibility, and provides example React code for each operation.

---

## Operation: Fetch Saved Books

**Endpoint:** `GET /saved-books/user/{userId}`

**Request DTO:** Path parameter `userId` (Long)

**Response DTO:** `List<BookDTO>`

**Backend BookDTO Structure:**
```java
{
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
    previewLink: String
}
```

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend `api.ts` correctly maps `BookDTO` to frontend `Book` interface using `mapDtoToBook()`
- Handles 204 No Content response for empty lists
- Frontend `Book` interface includes all necessary fields

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 62-70)
export async function getSavedBooks(userId: number): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/saved-books/user/${userId}`);
    if (!response.ok) {
        if (response.status === 204) return []; // No content
        throw new Error("Failed to fetch saved books");
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapDtoToBook) : [];
}
```

**Example Frontend Code:**
```typescript
import { useState, useEffect } from 'react';
import { getSavedBooks } from '../services/api';
import { Book } from '../services/api';

function SavedBooksList({ userId }: { userId: number }) {
    const [savedBooks, setSavedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSavedBooks = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                setError(null);
                const books = await getSavedBooks(userId);
                setSavedBooks(books);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load saved books');
                setSavedBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedBooks();
    }, [userId]);

    if (loading) return <div>Loading saved books...</div>;
    if (error) return <div>Error: {error}</div>;
    if (savedBooks.length === 0) return <div>No saved books found.</div>;

    return (
        <div>
            <h2>Your Saved Books ({savedBooks.length})</h2>
            <ul>
                {savedBooks.map((book) => (
                    <li key={book.id}>
                        <img src={book.coverImage} alt={book.title} />
                        <h3>{book.title}</h3>
                        <p>By {book.author}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 122-132)
const loadSavedBooks = async () => {
    if (!userProfile.userId) return;

    try {
        const books = await api.getSavedBooks(userProfile.userId);
        setSavedBooks(books);
    } catch (error) {
        console.error("Failed to load saved books:", error);
        setSavedBooks([]);
    }
};
```

---

## Operation: Save Book

**Endpoint:** `POST /saved-books/save`

**Request DTO:** `SavedBookRequest`
```java
{
    userId: Long,
    googleBooksId: String
}
```

**Response DTO:** `SavedBookResponse`
```java
{
    userId: Long,
    googleBooksId: String
}
```

**Frontend Mapping:** ✅ **COMPATIBLE** (with minor improvement suggestion)
- Frontend correctly sends `{ userId, googleBooksId }` matching `SavedBookRequest`
- Frontend currently ignores the response, but it's available if needed
- Backend returns 201 CREATED with `SavedBookResponse`

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 46-60)
export async function saveBook(userId: number, googleBooksId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/saved-books/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            googleBooksId,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to save book");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState } from 'react';
import { saveBook } from '../services/api';
import { Book } from '../services/api';

function SaveBookButton({ book, userId }: { book: Book; userId: number }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!userId) {
            setError("You must be logged in to save books");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            
            await saveBook(userId, book.id);
            
            setSuccess(true);
            // Optionally refresh the saved books list
            // onSaveSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save book';
            setError(errorMessage);
            
            // Handle specific error cases
            if (errorMessage.includes('already saved') || errorMessage.includes('duplicate')) {
                setError('This book is already in your saved list');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <button 
                onClick={handleSave} 
                disabled={saving}
                className={success ? 'saved' : ''}
            >
                {saving ? 'Saving...' : success ? '✓ Saved' : 'Save Book'}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

**Improved Version (with response handling):**
```typescript
// Enhanced version that handles the SavedBookResponse
export async function saveBook(userId: number, googleBooksId: string): Promise<{ userId: number; googleBooksId: string }> {
    const response = await fetch(`${API_BASE_URL}/saved-books/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            googleBooksId,
        }),
    });
    
    if (!response.ok) {
        if (response.status === 409) {
            throw new Error("This book is already saved");
        }
        throw new Error("Failed to save book");
    }
    
    return await response.json(); // Returns SavedBookResponse
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 173-192)
const toggleSave = async (book: Book) => {
    if (!userProfile.userId) {
        throw new Error("User must be logged in to save books");
    }

    try {
        const isCurrentlySaved = savedBooks.some((b) => b.id === book.id);

        if (isCurrentlySaved) {
            await api.deleteSavedBook(userProfile.userId, book.id);
            setSavedBooks((prev) => prev.filter((b) => b.id !== book.id));
        } else {
            await api.saveBook(userProfile.userId, book.id);
            setSavedBooks((prev) => [...prev, book]);
        }
    } catch (error) {
        console.error("Failed to toggle save:", error);
        throw error;
    }
};
```

---

## Operation: Delete Saved Book

**Endpoint:** `DELETE /saved-books/delete/user/{userId}/book/{googleBooksId}`

**Request DTO:** Path parameters `userId` (Long) and `googleBooksId` (String)

**Response DTO:** `Void` (204 No Content or 200 OK)

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend correctly constructs the URL with path parameters
- Handles the void response appropriately

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 72-79)
export async function deleteSavedBook(userId: number, googleBooksId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/saved-books/delete/user/${userId}/book/${googleBooksId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete saved book");
    }
}
```

**Example Frontend Code:**
```typescript
import { useState } from 'react';
import { deleteSavedBook } from '../services/api';
import { Book } from '../services/api';

function DeleteSavedBookButton({ 
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
            setError("You must be logged in to delete saved books");
            return;
        }

        // Confirm deletion
        if (!window.confirm(`Are you sure you want to remove "${book.title}" from your saved books?`)) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);
            
            await deleteSavedBook(userId, book.id);
            
            // Call success callback to refresh the list
            onDeleteSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete saved book';
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
                {deleting ? 'Removing...' : 'Remove from Saved'}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

**Usage in BooksContext:**
```typescript
// Already implemented in BooksContext.tsx (lines 173-192)
// The delete is part of the toggleSave function
if (isCurrentlySaved) {
    await api.deleteSavedBook(userProfile.userId, book.id);
    setSavedBooks((prev) => prev.filter((b) => b.id !== book.id));
}
```

---

## Operation: Get Total Saved Books Count

**Endpoint:** `GET /saved-books/total/{userId}`

**Request DTO:** Path parameter `userId` (Long)

**Response DTO:** `Integer`

**Frontend Mapping:** ✅ **COMPATIBLE**
- Frontend function exists and correctly expects a number
- Currently not used in SavedBooksPage, but available

**Current Frontend Implementation:**
```typescript
// In api.ts (lines 81-87)
export async function getTotalSavedBooks(userId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/saved-books/total/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to get total saved books");
    }
    return await response.json();
}
```

**Example Frontend Code:**
```typescript
import { useState, useEffect } from 'react';
import { getTotalSavedBooks } from '../services/api';

function SavedBooksCount({ userId }: { userId: number }) {
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                setError(null);
                const count = await getTotalSavedBooks(userId);
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
    
    return <span>{totalCount ?? 0} saved books</span>;
}
```

**Suggested Integration in SavedBooksPage:**
```typescript
// Enhanced SavedBooksPage with total count from backend
import { useEffect, useState } from "react";
import { useBooks } from "../context/BooksContext";
import { getTotalSavedBooks } from "../services/api";
import "../css/SavedBooksPage.css";

export default function SavedBooksPage() {
    const { savedBooks, userProfile, loadSavedBooks } = useBooks();
    const [totalCount, setTotalCount] = useState<number | null>(null);

    useEffect(() => {
        if (userProfile.userId) {
            loadSavedBooks();
            // Optionally fetch total count from backend
            getTotalSavedBooks(userProfile.userId)
                .then(setTotalCount)
                .catch((err) => {
                    console.error("Failed to get total count:", err);
                    // Fallback to local count
                    setTotalCount(savedBooks.length);
                });
        }
    }, [userProfile.userId]);

    // Use backend count if available, otherwise use local count
    const displayCount = totalCount !== null ? totalCount : savedBooks.length;

    return (
        <div className="saved-books-page page-fade">
            <div className="saved-books-header">
                <h1 className="saved-books-title">Your Reading List</h1>
                <p className="saved-books-subtitle">
                    {displayCount} {displayCount === 1 ? 'book' : 'books'} saved to read later
                </p>
            </div>
            {/* ... rest of component ... */}
        </div>
    );
}
```

---

## Summary of Findings

### ✅ Compatible Mappings
1. **GET /saved-books/user/{userId}** - Frontend correctly fetches and maps `List<BookDTO>` to `Book[]`
2. **POST /saved-books/save** - Frontend correctly sends `SavedBookRequest` format
3. **DELETE /saved-books/delete/user/{userId}/book/{googleBooksId}** - Frontend correctly constructs URL
4. **GET /saved-books/total/{userId}** - Frontend function exists and is compatible

### 🔧 Suggested Improvements

1. **Enhanced Error Handling for Save Operation:**
   - The backend throws `DuplicateResourceException` when a book is already saved
   - Frontend should handle 409 status code or check error message for "already saved"
   - Consider updating `saveBook` to return the `SavedBookResponse` for confirmation

2. **Use Backend Total Count:**
   - Currently `SavedBooksPage` uses `savedBooks.length` for the count
   - Consider using `getTotalSavedBooks()` API call for accurate count from backend
   - This ensures consistency even if local state is out of sync

3. **Response Handling:**
   - `saveBook` currently returns `void` but backend returns `SavedBookResponse`
   - Consider updating to return the response for better confirmation

4. **Error Messages:**
   - Add more specific error handling for duplicate saves
   - Provide user-friendly error messages in the UI

### 📝 Missing Code/Adjustments

1. **SavedBooksPage Enhancement:**
   - Add error state handling for failed API calls
   - Add loading state while fetching saved books
   - Consider using `getTotalSavedBooks` for count display

2. **Delete Confirmation:**
   - The current implementation in `toggleSave` doesn't ask for confirmation
   - Consider adding a confirmation dialog for delete operations

3. **Optimistic Updates:**
   - Current implementation updates local state immediately
   - Consider adding rollback logic if API call fails

---

## Complete Example: Enhanced SavedBooksPage Component

```typescript
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import { useBooks } from "../context/BooksContext";
import { Book, getTotalSavedBooks } from "../services/api";
import "../css/SavedBooksPage.css";

export default function SavedBooksPage() {
    const { savedBooks, userProfile, loadSavedBooks } = useBooks();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showMarkAsRead, setShowMarkAsRead] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!userProfile.userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Load saved books
                await loadSavedBooks();
                
                // Optionally fetch total count from backend
                try {
                    const count = await getTotalSavedBooks(userProfile.userId);
                    setTotalCount(count);
                } catch (countError) {
                    console.warn("Failed to get total count, using local count");
                    setTotalCount(savedBooks.length);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load saved books");
            } finally {
                setLoading(false);
            }
        };

        loadData();
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
        // Refresh saved books after marking as read
        if (userProfile.userId) {
            loadSavedBooks();
        }
    };

    const displayCount = totalCount !== null ? totalCount : savedBooks.length;

    if (loading) {
        return (
            <div className="saved-books-page page-fade">
                <Navbar />
                <div className="saved-books-content">
                    <div className="loading">Loading your saved books...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-books-page page-fade">
                <Navbar />
                <div className="saved-books-content">
                    <div className="error-message">
                        <p>Error: {error}</p>
                        <button onClick={() => userProfile.userId && loadSavedBooks()}>
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
                    <h1 className="saved-books-title">Your Reading List</h1>
                    <p className="saved-books-subtitle">
                        {displayCount} {displayCount === 1 ? 'book' : 'books'} saved to read later
                    </p>
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
```

---

## DTO Verification Summary

| Endpoint | Request DTO | Frontend Sends | Status |
|----------|------------|----------------|--------|
| GET /saved-books/user/{userId} | Path param: `userId` | ✅ Correct | ✅ Match |
| POST /saved-books/save | `SavedBookRequest: { userId, googleBooksId }` | ✅ `{ userId, googleBooksId }` | ✅ Match |
| DELETE /saved-books/delete/user/{userId}/book/{googleBooksId} | Path params: `userId`, `googleBooksId` | ✅ Correct URL construction | ✅ Match |
| GET /saved-books/total/{userId} | Path param: `userId` | ✅ Correct | ✅ Match |

| Endpoint | Response DTO | Frontend Expects | Status |
|----------|-------------|------------------|--------|
| GET /saved-books/user/{userId} | `List<BookDTO>` | `Book[]` (mapped) | ✅ Match |
| POST /saved-books/save | `SavedBookResponse` | `void` (ignored) | ⚠️ Could use response |
| DELETE /saved-books/delete/user/{userId}/book/{googleBooksId} | `Void` | `void` | ✅ Match |
| GET /saved-books/total/{userId} | `Integer` | `number` | ✅ Match |

**All DTOs are compatible!** ✅

