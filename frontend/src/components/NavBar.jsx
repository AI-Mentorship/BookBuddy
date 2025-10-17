import { Link } from "react-router-dom";
import '../css/Navbar.css'
//import profilePic from "../assets/profile.jpg";
function NavBar(){
    return <nav className="navbar">
        <div className="navbar_brand">
            <Link to="/">BookBuddy</Link>
        </div>
        <div className="navbar_links">
            <Link to="/" className="nav_link">Dashboard </Link>
            <Link to="/favorites" className="nav_link">Favorites </Link>
             <Link to="/profile" className="nav_link">Profile</Link>
        </div>
    </nav>
}
export default NavBar