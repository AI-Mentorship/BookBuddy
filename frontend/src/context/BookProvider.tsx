import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { BookContext } from "./BookContext";
import type { Book } from "./BookContext";

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Book[]>([]);

  // Load favorites from localStorage when app starts
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        const parsed: Book[] = JSON.parse(storedFavs);
        setFavorites(parsed);
      } catch (error) {
        console.error("Failed to parse favorites:", error);
      }
    }
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Add book to favorites
  const addToFavorites = (book: Book) => {
    setFavorites((prev) => {
      if (prev.some((b) => b.id === book.id)) return prev; // avoid duplicates
      return [...prev, book];
    });
  };

  // Remove book from favorites
  const removeFromFavorites = (bookId: number) => {
    setFavorites((prev) => prev.filter((book) => book.id !== bookId));
  };

  // Check if a book is favorited
  const isFavorite = (bookId: number) => favorites.some((b) => b.id === bookId);

  // Value shared across the app
  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};
