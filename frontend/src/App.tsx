import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
  return (
    <BookProvider>
      <Routes>
        {/* Authentication / Onboarding */}
        <Route path="/login" element={<Login />} />
        <Route path="/questionnaire" element={<Questionnaire />} />

        {/* Main App Pages with Navbar */}
        <Route
          path="/*"
          element={
            <>
              <NavBar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
            </>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BookProvider>
  );
};

export default App;
