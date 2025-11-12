import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Book } from "../services/api";
import * as api from "../services/api";

interface ReadBook {
  book: Book;
  rating: number;
  review?: string;
}

export interface UserProfile {
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
  books: Book[];
  loading: boolean;
  loadBooks: () => Promise<void>;
  toggleSave: (book: Book) => void;
  markAsRead: (book: Book, rating: number, review?: string) => void;
  removeReview: (bookId: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
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
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "John",
    lastName: "A",
    email: "sai1@gmail.com",
    birthDate: "11/05/2025",
    profilePicture: "https://ui-avatars.com/api/?name=John%20A&background=0742BF&color=fff&size=200",
    bio: "Excited to Read!",
    favoriteBook: "",
    selectedGenres: ["Religion & Spirituality", "Health & Wellness", "Adventure"],
  });

  // Load books, saved books, and reviews on mount
  useEffect(() => {
    loadBooks();
    loadSavedBooks();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    try {
      // TODO: Implement GET /api/books/saved endpoint
      // For now, saved books are managed locally via toggleSave
    } catch (error) {
      console.error("Failed to load saved books:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const reviews = await api.fetchReviews();
      setReadBooks(reviews);
      const ratingsMap: Record<string, { stars: number; review?: string }> = {};
      reviews.forEach((rb) => {
        ratingsMap[rb.book.id] = { stars: rb.rating, review: rb.review };
      });
      setRatings(ratingsMap);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  const toggleSave = async (book: Book) => {
    try {
      const isCurrentlySaved = savedBooks.some((b) => b.id === book.id);
      if (isCurrentlySaved) {
        await api.deleteSavedBook(book.id);
        setSavedBooks((prev) => prev.filter((b) => b.id !== book.id));
      } else {
        await api.saveBook(book);
        setSavedBooks((prev) => [...prev, book]);
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      // Keep UI state even if backend fails
    }
  };

  const markAsRead = async (book: Book, rating: number, review?: string) => {
    try {
      await api.markBookAsRead(book, rating, review);
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
      // Keep UI state even if backend fails
    }
  };

  const isSaved = (bookId: string) => {
    return savedBooks.some((b) => b.id === bookId);
  };

  const isRead = (bookId: string) => {
    return readBooks.some((rb) => rb.book.id === bookId);
  };

  const removeReview = async (bookId: string) => {
    try {
      await api.unmarkBookAsRead(bookId);
      setReadBooks((prev) => prev.filter((rb) => rb.book.id !== bookId));
      setRatings((prev) => {
        const updated = { ...prev };
        delete updated[bookId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove review:", error);
      // Update UI even if backend fails
      setReadBooks((prev) => prev.filter((rb) => rb.book.id !== bookId));
      setRatings((prev) => {
        const updated = { ...prev };
        delete updated[bookId];
        return updated;
      });
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  return (
    <BooksContext.Provider
      value={{
        books,
        savedBooks,
        readBooks,
        ratings,
        userProfile,
        loading,
        loadBooks,
        toggleSave,
        markAsRead,
        removeReview,
        updateProfile,
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

