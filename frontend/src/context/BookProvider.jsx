// src/context/BookProvider.jsx
import { useState, useEffect } from "react";
import { BookContext } from "./BookContext";

export const BookProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage when app starts
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Add book to favorites
  const addToFavorites = (book) => {
    setFavorites((prev) => {
      if (prev.some((b) => b.id === book.id)) return prev; // avoid duplicates
      return [...prev, book];
    });
  };

  // Remove book from favorites
  const removeFromFavorites = (bookId) => {
    setFavorites((prev) => prev.filter((book) => book.id !== bookId));
  };

  // Check if a book is favorited
  const isFavorite = (bookId) => favorites.some((b) => b.id === bookId);

  // Value shared across the app
  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};
