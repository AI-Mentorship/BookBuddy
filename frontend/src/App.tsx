import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { BookProvider } from "./context/BookProvider";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Questionnaire from "./pages/Questionnaire";
import "./css/App.css";
import "./css/index.css";

const App: React.FC = () => {
    const location = useLocation();

    // Hide navbar on signin, signup, and questionnaire pages
    const hideNavbarRoutes = ["/signin", "/signup", "/questionnaire"];
    const showNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <BookProvider>
            {/* Conditionally render Navbar */}
            {showNavbar && <NavBar />}

            <main className="main-content">
                <Routes>
                    {/* Authentication / Onboarding */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/questionnaire" element={<Questionnaire />} />

                    {/* Main App Pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Redirect base path to signin */}
                    <Route path="/" element={<Navigate to="/signin" />} />

                    {/* Fallback - catch all undefined routes */}
                    <Route path="*" element={<Navigate to="/signin" />} />
                </Routes>
            </main>
        </BookProvider>
    );
};

export default App;