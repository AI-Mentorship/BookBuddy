import axios, { AxiosInstance } from 'axios';
import { Book, ReadBook } from './api';

const API_BASE_URL = "http://localhost:8080";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Map backend BookDTO to frontend Book
export function mapDtoToBook(dto: any): Book {
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
    const match = publishedDate.match(/\d{4}/);
    if (match) {
        const year = parseInt(match[0], 10);
        if (!isNaN(year)) return year;
    }
    return new Date().getFullYear();
}

function normalizeMaturity(val?: string): Book["maturity"] {
    if (!val || typeof val !== "string") return "NOT_MATURE";
    const v = val.toUpperCase();
    if (v === "MATURE") return "MATURE";
    return "NOT_MATURE"; // Default to NOT_MATURE for any other value
}

function extractIsbn(dto: any): string | undefined {
    const ids = dto?.industryIdentifiers;
    if (Array.isArray(ids)) {
        const isbn13 = ids.find((i: any) => i?.type === "ISBN_13")?.identifier;
        const isbn10 = ids.find((i: any) => i?.type === "ISBN_10")?.identifier;
        return isbn13 || isbn10 || undefined;
    }
    return undefined;
}

// Saved Books API
export const savedBooksApi = {
    // GET /saved-books/user/{userId}
    getSavedBooks: async (userId: number): Promise<Book[]> => {
        try {
            const response = await axiosInstance.get(`/saved-books/user/${userId}`);
            return Array.isArray(response.data) ? response.data.map(mapDtoToBook) : [];
        } catch (error: any) {
            if (error.response?.status === 204) return [];
            throw new Error(error.response?.data?.message || "Failed to fetch saved books");
        }
    },

    // POST /saved-books/save
    saveBook: async (userId: number, googleBooksId: string): Promise<{ userId: number; googleBooksId: string }> => {
        try {
            const response = await axiosInstance.post('/saved-books/save', {
                userId,
                googleBooksId,
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error("This book is already saved");
            }
            throw new Error(error.response?.data?.message || "Failed to save book");
        }
    },

    // DELETE /saved-books/delete/user/{userId}/book/{googleBooksId}
    deleteSavedBook: async (userId: number, googleBooksId: string): Promise<void> => {
        try {
            await axiosInstance.delete(`/saved-books/delete/user/${userId}/book/${googleBooksId}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to delete saved book");
        }
    },

    // GET /saved-books/total/{userId}
    getTotalSavedBooks: async (userId: number): Promise<number> => {
        try {
            const response = await axiosInstance.get(`/saved-books/total/${userId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to get total saved books");
        }
    },
};

// Read Books API
export const readBooksApi = {
    // GET /read-books/read-books/{userId}
    getReadBooks: async (userId: number): Promise<ReadBook[]> => {
        try {
            const response = await axiosInstance.get(`/read-books/read-books/${userId}`);
            
            // Handle 204 No Content
            if (response.status === 204 || !response.data) {
                return [];
            }
            
            const data = Array.isArray(response.data) ? response.data : [];
            
            return data.map((item: any) => {
                const book = mapDtoToBook(item);
                const rating = typeof item.privateRating === "number" ? item.privateRating : 0;
                const review = item.privateReview || undefined;
                return { book, rating, review };
            });
        } catch (error: any) {
            // Handle 204 No Content in error response
            if (error.response?.status === 204) {
                return [];
            }
            throw new Error(error.response?.data?.message || error.message || "Failed to fetch read books");
        }
    },

    // POST /read-books/save
    markBookAsRead: async (
        userId: number,
        googleBooksId: string,
        rating: number,
        review?: string
    ): Promise<{ userId: number; googleBooksId: string; privateReview: string; privateRating: number }> => {
        try {
            const response = await axiosInstance.post('/read-books/save', {
                userId,
                googleBooksId,
                privateRating: rating,
                privateReview: review || "",
            });
            return response.data;
        } catch (error: any) {
            // If duplicate (409), fall back to update
            if (error.response?.status === 409 || 
                (error.response?.data?.message && /already\s+read/i.test(error.response.data.message))) {
                return readBooksApi.updateReview(userId, googleBooksId, rating, review);
            }
            throw new Error(error.response?.data?.message || "Failed to mark book as read");
        }
    },

    // POST /read-books/saveAll
    saveAllReadBooks: async (
        userId: number,
        books: Array<{ googleBooksId: string; rating: number; review?: string }>
    ): Promise<{ status: string }> => {
        try {
            const response = await axiosInstance.post('/read-books/saveAll', 
                books.map((book) => ({
                    userId,
                    googleBooksId: book.googleBooksId,
                    privateRating: book.rating,
                    privateReview: book.review || "",
                }))
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to save read books");
        }
    },

    // PUT /read-books/update-review
    updateReview: async (
        userId: number,
        googleBooksId: string,
        rating: number,
        review?: string
    ): Promise<{ userId: number; googleBooksId: string; privateReview: string; privateRating: number }> => {
        try {
            const response = await axiosInstance.put('/read-books/update-review', {
                userId,
                googleBooksId,
                privateRating: rating,
                privateReview: review || "",
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to update review");
        }
    },

    // DELETE /read-books/delete/{userId}/{googleBooksId}
    deleteReadBook: async (userId: number, googleBooksId: string): Promise<void> => {
        try {
            await axiosInstance.delete(`/read-books/delete/${userId}/${googleBooksId}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to delete read book");
        }
    },

    // GET /read-books/total/{userId}
    getTotalReadBooks: async (userId: number): Promise<number> => {
        try {
            const response = await axiosInstance.get(`/read-books/total/${userId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to get total read books");
        }
    },
};

// Genre Preferences API
export const genrePreferencesApi = {
    // GET /genre-preference/saved-genres/{userId}
    getGenrePreferences: async (userId: number): Promise<string[]> => {
        try {
            const response = await axiosInstance.get(`/genre-preference/saved-genres/${userId}`);
            console.log("Raw API response:", response.data);
            
            // Handle different response formats
            if (Array.isArray(response.data)) {
                // Map the response to extract genre names
                const genres = response.data.map((item: any) => {
                    // Handle both {genre: "..."} and direct string formats
                    return typeof item === 'string' ? item : (item.genre || item.genreName || item);
                }).filter((g: any) => g != null && g !== '');
                
                console.log("Extracted genres:", genres);
                return genres;
            }
            
            console.warn("Unexpected response format:", response.data);
            return [];
        } catch (error: any) {
            console.error("Error in getGenrePreferences:", error);
            if (error.response?.status === 404) {
                console.log("No genres found (404)");
                return [];
            }
            throw new Error(error.response?.data?.message || "Failed to fetch genre preferences");
        }
    },

    // POST /genre-preference/save
    saveGenrePreferences: async (userId: number, genres: string[]): Promise<void> => {
        try {
            // Remove duplicates before sending
            const uniqueGenres = Array.from(new Set(genres));
            
            await axiosInstance.post('/genre-preference/save', {
                userId,
                genre: uniqueGenres, // Backend expects "genre" not "genres"
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to save genre preferences");
        }
    },
};

