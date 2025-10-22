import { createContext, useContext } from "react";

// Define the Book type
export type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
  cover_url: string;
};

// Define the context shape
export type BookContextType = {
  favorites: Book[];
  addToFavorites: (book: Book) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

// ✅ Export the actual context instance
export const BookContext = createContext<BookContextType | undefined>(
  undefined
);

// ✅ Hook for using the context
export const useBookContext = (): BookContextType => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
};
