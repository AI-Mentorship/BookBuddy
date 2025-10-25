import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { BookProvider } from "./context/BookProvider";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Login from "./pages/login";
import Questionnaire from "./pages/questionnaire";
import "./css/App.css";
import "./css/index.css";

const App: React.FC = () => {
    const location = useLocation();

    // List of routes that should NOT show the navbar
    const hideNavbarRoutes = ["/login", "/questionnaire"];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <BookProvider>
            {/* Conditionally render Navbar */}
            {showNavbar && <NavBar />}

            <main className="main-content">
                <Routes>
                    {/* Authentication / Onboarding */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/questionnaire" element={<Questionnaire />} />

                    {/* Main App Pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Redirect base path to login */}
                    <Route path="/" element={<Navigate to="/login" />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </main>
        </BookProvider>
    );
};

export default App;
