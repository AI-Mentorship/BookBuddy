import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import GenrePreferenceQuestionnaire from "./pages/GenrePreferenceQuestionnaire";
import BookReviewQuestionnaire from "./pages/BookReviewQuestionnaire";
import SavedBooks from "./pages/SavedBooks";
import ProtectedRoute from "./components/ProtectedRoute";
import "./css/App.css";

const App: React.FC = () => {
    const location = useLocation();

    // Hide navbar on auth & onboarding pages
    const hideNavbarRoutes = [
        "/signin",
        "/signup",
        "/genre-preference",
        "/book-review",
    ];

    const showNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <AuthProvider>
            {showNavbar && <NavBar />}

            <main className="main-content">
                <Routes>
                    {/* ===== Authentication ===== */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* ===== Onboarding ===== */}
                    <Route
                        path="/genre-preference"
                        element={
                            <ProtectedRoute>
                                <GenrePreferenceQuestionnaire />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/book-review"
                        element={
                            <ProtectedRoute>
                                <BookReviewQuestionnaire />
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== Main App Pages ===== */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/savedbooks"
                        element={
                            <ProtectedRoute>
                                <SavedBooks />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <Favorites />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== Redirects ===== */}
                    <Route path="/" element={<Navigate to="/signin" replace />} />
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                </Routes>
            </main>
        </AuthProvider>
    );
};

export default App;