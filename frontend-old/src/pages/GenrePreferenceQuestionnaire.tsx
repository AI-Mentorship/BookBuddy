import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Questionnaire.css";

const genres = [
    "Fiction",
    "Non-Fiction",
    "Mystery / Thriller / Crime",
    "Romance",
    "Science Fiction (Sci-Fi)",
    "Fantasy",
    "Historical Fiction",
    "Biography / Memoir",
    "Self-Help / Personal Development",
    "Young Adult (YA)",
    "Children's",
    "Horror",
    "Poetry",
    "Religion & Spirituality",
    "Travel",
    "Science & Technology",
    "Business & Economics",
    "Health & Wellness",
    "Graphic Novels / Comics",
    "Classics",
    "Drama / Literary Fiction",
    "Adventure",
    "Cooking / Food & Drink",
    "Humor",
    "Education / Academic",
];

const GenrePreferenceQuestionnaire: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { userId } = useAuth();

    const toggleGenre = (genre: string) => {
        setSelected((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const goToDashboard = async () => {
        if (selected.length < 3) {
            setError("Please select at least 3 genres to continue");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/genre-preference/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    genre: selected
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                throw new Error(errorData.message || "Failed to save preferences");
            }

            const data = await response.json();
            console.log("Preferences saved successfully", data);

            // Navigate to Book Review page after saving preferences
            navigate("/book-review");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="questionnaire-container">
            <h1 className="title">BookBuddy</h1>

            <div className="question-box">
                <h2>Select at least 3 genres you love</h2>
                <p className="subtitle">We'll tailor recommendations just for you</p>

                <div className="genres-grid">
                    {genres.map((genre) => (
                        <button
                            key={genre}
                            className={`genre-btn ${
                                selected.includes(genre) ? "selected" : ""
                            }`}
                            onClick={() => toggleGenre(genre)}
                            disabled={loading}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}

                <button
                    className="dashboard-btn"
                    onClick={goToDashboard}
                    disabled={selected.length < 3 || loading}
                >
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? "Saving..." : `Continue ${selected.length < 3 ? `(${selected.length}/3)` : ""}`}
                </button>
            </div>
        </div>
    )
};

export default GenrePreferenceQuestionnaire;