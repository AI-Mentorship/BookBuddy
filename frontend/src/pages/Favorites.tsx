import React from "react";
import { useAuth } from "../context/AuthContext";
import "../css/Pages.css";

const Favorites: React.FC = () => {
    const { userId } = useAuth();

    return (
        <div className="page-container">
            <h1 className="page-title">Favorites</h1>
            <div className="dropdown-section">
                <p>Your favorite books will appear here.</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                    User ID: {userId}
                </p>
            </div>
        </div>
    );
};

export default Favorites;