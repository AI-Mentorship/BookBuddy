import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import * as api from "../services/api";  // ADD THIS IMPORT
import "../css/GenresPage.css";

const GENRES = [
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

export default function GenresPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateProfile, userProfile } = useBooks();
    const isEditMode = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("edit") === "1";
    }, [location.search]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Prefill selections when editing
    useEffect(() => {
        if (isEditMode && userProfile?.selectedGenres?.length) {
            setSelectedGenres(userProfile.selectedGenres);
        }
    }, [isEditMode, userProfile.selectedGenres]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) => {
            if (prev.includes(genre)) {
                return prev.filter((g) => g !== genre);
            } else {
                return [...prev, genre];
            }
        });
    };

    const handleContinue = async () => {
        if (selectedGenres.length >= 3) {
            setLoading(true);
            setError("");

            try {
                // Save genre preferences to backend FIRST
                if (userProfile.userId) {
                    await api.saveGenrePreferences(userProfile.userId, selectedGenres);
                }

                // THEN update local state
                updateProfile({ selectedGenres });

                // Navigate based on mode
                if (isEditMode) {
                    navigate("/profile");
                } else {
                    navigate("/rate-books");
                }
            } catch (error) {
                console.error("Failed to save genre preferences:", error);
                setError("Failed to save preferences. Please try again.");
                setLoading(false);
            }
        }
    };

    const isContinueEnabled = selectedGenres.length >= 3;

    return (
        <div className="genres-page page-fade">
            <div className="genres-content">
                <h1 className="genres-title">{isEditMode ? "Edit your favorite genres" : "What do you love to read?"}</h1>
                <p className="genres-subtitle">
                    {isEditMode
                        ? "Update at least 3 genres to refine your recommendations"
                        : "Select at least 3 genres to personalize your recommendations"}
                </p>

                {error && (
                    <div style={{
                        color: "#ef4444",
                        background: "#fee",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem"
                    }}>
                        {error}
                    </div>
                )}

                <div className="genres-grid">
                    {GENRES.map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                            <button
                                key={genre}
                                type="button"
                                className={`genre-chip ${isSelected ? "genre-chip-selected" : ""}`}
                                onClick={() => toggleGenre(genre)}
                            >
                                {genre}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className={`genres-continue-button ${isContinueEnabled ? "genres-continue-enabled" : ""}`}
                    onClick={handleContinue}
                    disabled={!isContinueEnabled || loading}
                >
                    {loading
                        ? "Saving..."
                        : isEditMode
                            ? `Save Changes (${selectedGenres.length}/3 selected)`
                            : `Continue (${selectedGenres.length}/3 selected)`}
                </button>
            </div>
        </div>
    );
}