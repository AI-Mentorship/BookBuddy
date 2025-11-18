const API_BASE_URL = "http://localhost:8080";

// Simple health check to verify backend connectivity
export async function healthCheck(): Promise<{ status: string } | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (!res.ok) return null;
        return await res.json();
    } catch (_) {
        return null;
    }
}

export interface Book {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    pages: number;
    published: number;
    genres: string[];
    maturity: "NOT_MATURE" | "MATURE";
    rating: number;
    reviewCount: number;
    description: string;
    isbn?: string;
}

export interface ReadBook {
    book: Book;
    rating: number;
    review?: string;
}

// Books API
export async function fetchBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/api/books`);
    if (!response.ok) {
        throw new Error("Failed to fetch books");
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapDtoToBook) : [];
}

// Saved Books API
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

export async function getSavedBooks(userId: number): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/saved-books/user/${userId}`);
    if (!response.ok) {
        if (response.status === 204) return []; // No content
        throw new Error("Failed to fetch saved books");
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapDtoToBook) : [];
}

export async function deleteSavedBook(userId: number, googleBooksId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/saved-books/delete/user/${userId}/book/${googleBooksId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete saved book");
    }
}

export async function getTotalSavedBooks(userId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/saved-books/total/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to get total saved books");
    }
    return await response.json();
}

// Read Books API
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

    // If the book is already marked as read on the backend, gracefully
    // fall back to updating the existing review/rating instead of failing.
    if (!response.ok) {
        if (response.status === 409) {
            // Duplicate (already read) → update the review/rating in place
            await updateReview(userId, googleBooksId, rating, review);
            return;
        }
        // Some deployments may not map DuplicateResourceException to 409.
        // Inspect the error text and gracefully fallback if it indicates a duplicate.
        try {
            const errText = await response.text();
            if (typeof errText === "string" && /already\s+read/i.test(errText)) {
                await updateReview(userId, googleBooksId, rating, review);
                return;
            }
        } catch (_) {
            // ignore parse errors and fall through
        }
        throw new Error("Failed to mark book as read");
    }
}

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

export async function getReadBooks(userId: number): Promise<ReadBook[]> {
    // Some deployments only expose the legacy path. To avoid depending on backend changes,
    // try the legacy path first, then fall back to the cleaner alias if available.
    const endpoints = [
        `${API_BASE_URL}/read-books/read-books/${userId}`, // legacy method path under class-level mapping
        `${API_BASE_URL}/read-books/user/${userId}`, // cleaner alias if present
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 204) return []; // No content
                // If not OK, try next endpoint
                continue;
            }

            // Attempt to parse JSON; if it fails, try next endpoint
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
            // Network or CORS error — try the next endpoint
            continue;
        }
    }

    throw new Error("Failed to fetch read books");
}

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

export async function deleteReadBook(userId: number, googleBooksId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/read-books/delete/${userId}/${googleBooksId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete read book");
    }
}

export async function getTotalReadBooks(userId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/read-books/total/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to get total read books");
    }
    return await response.json();
}

// --- Helpers --------------------------------------------------------------

// Map backend BookDTO (and subclasses) to the frontend Book shape
function mapDtoToBook(dto: any): Book {
    if (!dto || typeof dto !== "object") {
        return emptyBook();
    }

    const id: string = dto.googleBooksId || dto.id || "";
    const title: string = dto.title || "Untitled";
    const authorList: string[] = Array.isArray(dto.authors) ? dto.authors : [];
    const author: string = authorList.length > 0 ? authorList.join(", ") : "Unknown Author";
    const coverImage: string = dto.thumbnail || dto.coverImage || "";
    const pages: number = typeof dto.pageCount === "number" ? dto.pageCount : 0;
    const published: number = parseYear(dto.publishedDate);
    const genres: string[] = Array.isArray(dto.categories) ? dto.categories : [];
    const rating: number = typeof dto.averageRating === "number" ? dto.averageRating : 0;
    const maturity: Book["maturity"] = normalizeMaturity(dto.maturityRating);
    const description: string = dto.description || "";
    const reviewCount: number = typeof dto.ratingsCount === "number" ? dto.ratingsCount : 0;
    const isbn: string | undefined = extractIsbn(dto);

    return {
        id,
        title,
        author,
        coverImage,
        pages,
        published,
        genres,
        maturity,
        rating,
        reviewCount,
        description,
        isbn,
    };
}

function emptyBook(): Book {
    return {
        id: "",
        title: "Untitled",
        author: "Unknown Author",
        coverImage: "",
        pages: 0,
        published: new Date().getFullYear(),
        genres: [],
        maturity: "NOT_MATURE",
        rating: 0,
        reviewCount: 0,
        description: "",
    };
}

function parseYear(publishedDate?: string): number {
    if (!publishedDate || typeof publishedDate !== "string") return new Date().getFullYear();
    // Extract first 4-digit year
    const match = publishedDate.match(/\d{4}/);
    if (match) {
        const year = parseInt(match[0], 10);
        if (!isNaN(year)) return year;
    }
    return new Date().getFullYear();
}

function normalizeMaturity(val?: string): Book["maturity"] {
    if (!val || typeof val !== "string") return "NOT_MATURE";
    const v = val.toLowerCase();
    if (v.includes("mature")) return "MATURE";
    return "NOT_MATURE";
}

function extractIsbn(dto: any): string | undefined {
    // If backend ever includes industryIdentifiers, try to pick ISBN_13
    const ids = dto?.industryIdentifiers;
    if (Array.isArray(ids)) {
        const isbn13 = ids.find((i: any) => i?.type === "ISBN_13")?.identifier;
        const isbn10 = ids.find((i: any) => i?.type === "ISBN_10")?.identifier;
        return isbn13 || isbn10 || undefined;
    }
    return undefined;
}

// Genre Preferences API
export async function saveGenrePreferences(userId: number, genres: string[]): Promise<void> {
    // Remove duplicates before sending
    const uniqueGenres = Array.from(new Set(genres));
    
    const response = await fetch(`${API_BASE_URL}/genre-preference/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            genre: uniqueGenres, // Backend expects "genre" not "genres"
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to save genre preferences");
    }
}

export async function getGenrePreferences(userId: number): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/genre-preference/saved-genres/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch genre preferences");
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map((item: any) => item.genre) : [];
}

// Auth API
export async function signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
}): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/signUp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign up");
    }

    return await response.json();
}

export async function login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/signIn`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid email or password");
    }

    return await response.json();
}

export async function updateUser(
    userId: number,
    userData: {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        birthDate?: string;
    }
): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
    }

    return await response.json();
}