import React from "react";
import { useAuth } from "../context/AuthContext";
import "../css/Pages.css";

const Profile: React.FC = () => {
    const { userId, logout } = useAuth();

    return (
        <div className="page-container">
            <h1 className="page-title">Profile</h1>
            <div className="dropdown-section">
                <p>Manage your profile settings here.</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                    User ID: {userId}
                </p>
                <button
                    onClick={logout}
                    className="login-button"
                    style={{ marginTop: '2rem' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;