import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
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

const Questionnaire: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            // Call your Spring Boot endpoint to save genres
            const userId = localStorage.getItem("userId");

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
            console.log("Preferences saved successfully" + data);

            // Navigate to dashboard
            navigate("/dashboard");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const goBackToLogin = () => {
        navigate("/signin");
    };

    return (
        <div className="questionnaire-container">
            <h1 className="title">BookBuddy</h1>
            <div className="question-box frosted-glass">
                <h2>
                    Select at least 3 genres you love. We'll tailor recommendations just for
                    you.
                </h2>
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

                <div className="btn-group">
                    <button className="back-btn" onClick={goBackToLogin} disabled={loading}>
                        Back to Sign In
                    </button>
                    <button
                        className={`dashboard-btn ${selected.length >= 3 && !loading ? "" : "disabled"}`}
                        onClick={selected.length >= 3 ? goToDashboard : undefined}
                        disabled={selected.length < 3 || loading}
                    >
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? "Saving..." : `Dashboard ${selected.length < 3 ? `(${selected.length}/3)` : ""}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;