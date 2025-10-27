import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Questionnaire.css";

const BookReviewPlaceholder: React.FC = () => {
    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <div className="questionnaire-container">
            <h1 className="title">BookBuddy</h1>

            <div className="question-box" style={{ maxWidth: "600px", textAlign: "center" }}>
                <h2>Book Reviews Coming Soon!</h2>
                <p className="subtitle">
                    This feature is under construction. For now, you can go straight to your dashboard.
                </p>

                <button
                    className="dashboard-btn"
                    onClick={goToDashboard}
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default BookReviewPlaceholder;
