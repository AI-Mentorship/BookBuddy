import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <DarkModeProvider>
      <BooksProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/rate-books" element={<RateBooksPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/saved" element={<SavedBooksPage />} />
            <Route path="/read" element={<ReadBooksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reviews" element={<MyReviewsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BooksProvider>
    </DarkModeProvider>
  );
}

export default App;

