import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Navbar.css";

function NavBar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">BookBuddy</Link>
            </div>

            <div className="navbar-links">
                <Link to="/dashboard" className="nav-link">
                    Dashboard
                </Link>
                <Link to="/savedbooks" className="nav-link">
                    Saved Books
                </Link>
                <Link to="/favorites" className="nav-link">
                    Favorites
                </Link>
                <Link to="/profile" className="nav-link">
                    Profile
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default NavBar;