import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Book } from "../services/api";
import * as api from "../services/api";

interface ReadBook {
    book: Book;
    rating: number;
    review?: string;
}

export interface UserProfile {
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    profilePicture: string;
    bio: string;
    favoriteBook: string;
    selectedGenres: string[];
}

interface BooksContextType {
    savedBooks: Book[];
    readBooks: ReadBook[];
    ratings: Record<string, { stars: number; review?: string }>;
    userProfile: UserProfile;
    isAuthenticated: boolean;
    books: Book[];
    loading: boolean;
    loadBooks: () => Promise<void>;
    loadReadBooks: () => Promise<void>;
    loadSavedBooks: () => Promise<void>;
    loadGenrePreferences: () => Promise<void>;
    toggleSave: (book: Book) => Promise<void>;
    markAsRead: (book: Book, rating: number, review?: string) => Promise<void>;
    updateExistingReview: (book: Book, rating: number, review?: string) => Promise<void>;
    removeReview: (bookId: string) => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => void;
    logout: () => void;
    isSaved: (bookId: string) => boolean;
    isRead: (bookId: string) => boolean;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
    const [books, setBooks] = useState<Book[]>([]);
    const [savedBooks, setSavedBooks] = useState<Book[]>([]);
    const [readBooks, setReadBooks] = useState<ReadBook[]>([]);
    const [ratings, setRatings] = useState<Record<string, { stars: number; review?: string }>>({});
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        // hydrate from localStorage if available
        try {
            const raw = localStorage.getItem("bb.userProfile");
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    firstName: "",
                    lastName: "",
                    email: "",
                    birthDate: "",
                    profilePicture: "",
                    bio: "",
                    favoriteBook: "",
                    selectedGenres: [],
                    ...parsed,
                } as UserProfile;
            }
        } catch (e) {
            console.warn("Failed to parse stored user profile", e);
        }
        return {
        firstName: "",
        lastName: "",
        email: "",
        birthDate: "",
        profilePicture: "",
        bio: "",
        favoriteBook: "",
        selectedGenres: [],
        } as UserProfile;
    });

    // persist userProfile to localStorage whenever it changes
    useEffect(() => {
        try {
            if (userProfile && userProfile.userId) {
                localStorage.setItem("bb.userProfile", JSON.stringify(userProfile));
            } else {
                // keep minimal for guests
                localStorage.removeItem("bb.userProfile");
            }
        } catch (e) {
            console.warn("Failed to persist user profile", e);
        }
    }, [userProfile]);

    // Load books and user data when profile is set - OPTIMIZED: Load in parallel
    useEffect(() => {
        if (userProfile.userId) {
            // Load all data in parallel for better performance
            Promise.all([
                loadBooks().catch(err => console.error("Failed to load books:", err)),
                loadSavedBooks().catch(err => console.error("Failed to load saved books:", err)),
                loadReadBooks().catch(err => console.error("Failed to load read books:", err)),
                loadGenrePreferences().catch(err => console.error("Failed to load genre preferences:", err))
            ]);
        } else {
            // Clear data when user logs out
            setBooks([]);
            setSavedBooks([]);
            setReadBooks([]);
            setRatings({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile.userId]); // Only depend on userId, not the functions

    const loadBooks = async () => {
        setLoading(true);
        try {
            const fetchedBooks = await api.fetchBooks();
            setBooks(fetchedBooks);
        } catch (error) {
            console.error("Failed to load books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

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

    const loadReadBooks = async () => {
        if (!userProfile.userId) {
            return;
        }

        try {
            // Don't set loading here - let individual pages handle their own loading states
            const books = await api.getReadBooks(userProfile.userId);
            setReadBooks(books);

            const ratingsMap: Record<string, { stars: number; review?: string }> = {};
            books.forEach((rb) => {
                ratingsMap[rb.book.id] = { stars: rb.rating, review: rb.review };
            });
            setRatings(ratingsMap);
        } catch (error) {
            console.error("Failed to load read books:", error);
            setReadBooks([]);
        }
    };

    const loadGenrePreferences = async () => {
        if (!userProfile.userId) return;

        try {
            const genres = await api.getGenrePreferences(userProfile.userId);
            // Only update if we got genres back (even if empty array)
            if (Array.isArray(genres)) {
                setUserProfile((prev) => ({ ...prev, selectedGenres: genres }));
            }
        } catch (error) {
            console.error("Failed to load genre preferences:", error);
            // Set empty array on error so UI doesn't show stale data
            setUserProfile((prev) => ({ ...prev, selectedGenres: [] }));
        }
    };

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
                // If it was not present (edge case), add it
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

    const isSaved = (bookId: string) => {
        return savedBooks.some((b) => b.id === bookId);
    };

    const isRead = (bookId: string) => {
        return readBooks.some((rb) => rb.book.id === bookId);
    };

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

    const updateProfile = (profile: Partial<UserProfile>) => {
        // Optimistic update - update UI immediately
        setUserProfile((prev) => ({ ...prev, ...profile }));

        // If genres are updated, save them to backend (fire and forget for better UX)
        if (profile.selectedGenres && userProfile.userId) {
            // Don't await - let it save in background for better performance
            api.saveGenrePreferences(userProfile.userId, profile.selectedGenres).catch((error) => {
                console.error("Failed to save genre preferences:", error);
                // Optionally: show a toast notification or rollback on error
            });
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem("bb.userProfile");
        } catch {}
        setUserProfile({
            firstName: "",
            lastName: "",
            email: "",
            birthDate: "",
            profilePicture: "",
            bio: "",
            favoriteBook: "",
            selectedGenres: [],
        });
        setSavedBooks([]);
        setReadBooks([]);
        setRatings({});
    };

    return (
        <BooksContext.Provider
            value={{
                books,
                savedBooks,
                readBooks,
                ratings,
                userProfile,
                isAuthenticated: Boolean(userProfile.userId),
                loading,
                loadBooks,
                loadReadBooks,
                loadSavedBooks,
                loadGenrePreferences,
                toggleSave,
                markAsRead,
                updateExistingReview,
                removeReview,
                updateProfile,
                logout,
                isSaved,
                isRead,
            }}
        >
            {children}
        </BooksContext.Provider>
    );
}

export function useBooks() {
    const context = useContext(BooksContext);
    if (context === undefined) {
        throw new Error("useBooks must be used within a BooksProvider");
    }
    return context;
}
