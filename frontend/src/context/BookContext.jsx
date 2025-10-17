// src/context/BookContext.jsx
import { createContext, useContext } from "react";

// ✅ Create the context
export const BookContext = createContext();

// ✅ Custom hook to use the context
export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
};
