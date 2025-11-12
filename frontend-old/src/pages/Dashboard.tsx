import React from "react";
import { useAuth } from "../context/AuthContext";
import "../css/Pages.css";

const Dashboard: React.FC = () => {
    const { userId } = useAuth();

    return (
        <div className="page-container">
            <h1 className="page-title">Dashboard</h1>
            <div className="dropdown-section">
                <p>Welcome to BookBuddy!</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                    User ID: {userId}
                </p>
                <p style={{ marginTop: '1rem' }}>
                    Your personalized book recommendations will appear here.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;