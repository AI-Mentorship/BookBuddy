import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BooksProvider } from "./context/BooksContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import "./css/global.css";
import Auth from "./pages/Auth";
import GenresPage from "./pages/GenresPage";
import RateBooksPage from "./pages/RateBooksPage";
import DashboardPage from "./pages/DashboardPage";
import SavedBooksPage from "./pages/SavedBooksPage";
import ReadBooksPage from "./pages/ReadBooksPage";
import ProfilePage from "./pages/ProfilePage";
import MyReviewsPage from "./pages/MyReviewsPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <BooksProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route
              path="/genres"
              element={
                <ProtectedRoute>
                  <GenresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-books"
              element={
                <ProtectedRoute>
                  <RateBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/read"
              element={
                <ProtectedRoute>
                  <ReadBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <MyReviewsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BooksProvider>
    </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;

