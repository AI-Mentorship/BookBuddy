import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import "../css/Navbar.css";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchFilter?: string;
  onSearchFilterChange?: (filter: string) => void;
}

export default function Navbar({
  searchQuery: externalQuery,
  onSearchChange,
  searchFilter: externalFilter,
  onSearchFilterChange,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [internalQuery, setInternalQuery] = useState("");
  const [internalFilter, setInternalFilter] = useState("all");
  const searchQuery = externalQuery !== undefined ? externalQuery : internalQuery;
  const searchFilter = externalFilter !== undefined ? externalFilter : internalFilter;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalQuery(value);
    }
  };

  const handleFilterChange = (value: string) => {
    if (onSearchFilterChange) {
      onSearchFilterChange(value);
    } else {
      setInternalFilter(value);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by parent component
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <div className="navbar-logo-circle">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#0742BF" />
            </svg>
          </div>
          <div className="navbar-logo-book">
            <svg viewBox="0 0 31 39" fill="none">
              <path
                d="M1.02113 34.1939V4.78304C1.02113 2.70113 2.78676 1.02113 4.96479 1.02113H28.2324C28.668 1.02113 29.0211 1.35867 29.0211 1.77505V31.5552M1.02113 34.1939C1.02113 32.6116 2.37067 31.3329 4.02591 31.3467L29.0211 31.5552M1.02113 34.1939C1.02113 35.7553 2.34536 37.0211 3.97887 37.0211H28.2324C28.668 37.0211 29.0211 36.6836 29.0211 36.2672V31.5552M12.0634 19.4923C13.0996 20.6302 15.8121 22.2232 18.3733 19.4923M12.0634 13.084V15.7227M18.3733 13.084V15.7227M26.2606 15.7227C26.2606 21.5521 21.3168 26.2777 15.2183 26.2777C9.11984 26.2777 4.17606 21.5521 4.17606 15.7227C4.17606 9.89336 9.11984 5.16773 15.2183 5.16773C21.3168 5.16773 26.2606 9.89336 26.2606 15.7227Z"
                stroke="white"
                strokeLinecap="round"
                strokeWidth="2.04225"
              />
            </svg>
          </div>
        </div>
        <span className="navbar-title" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          BOOK BUDDY
        </span>
      </div>

      <div className="navbar-center">
        <form className="navbar-search-form" onSubmit={handleSearch}>
          <div className="navbar-search-icon">🔍</div>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search by all fields..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <select
            className="navbar-search-dropdown"
            value={searchFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
          </select>
        </form>
      </div>

      <div className="navbar-right">
        <button
          className={`navbar-icon transition-hover ${isActive("/dashboard") ? "navbar-icon-active" : ""}`}
          onClick={() => navigate("/dashboard")}
          title="Dashboard"
        >
          📚
        </button>
        <button
          className={`navbar-icon transition-hover ${isActive("/read") ? "navbar-icon-active" : ""}`}
          onClick={() => navigate("/read")}
          title="Read Books"
        >
          📖
        </button>
        <button
          className={`navbar-icon transition-hover ${isActive("/saved") ? "navbar-icon-active" : ""}`}
          onClick={() => navigate("/saved")}
          title="Saved Books"
        >
          🔖
        </button>
        <button
          className={`navbar-icon transition-hover ${isActive("/profile") ? "navbar-icon-active" : ""}`}
          onClick={() => navigate("/profile")}
          title="Profile"
        >
          👤
        </button>
        <button
          className="navbar-icon transition-hover"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

