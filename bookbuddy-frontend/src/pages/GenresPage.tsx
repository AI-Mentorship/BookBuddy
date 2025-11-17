import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { genrePreferencesApi } from "../services/axiosApi";
import Toast from "../components/Toast";
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
    const [fetchingGenres, setFetchingGenres] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // Fetch saved genres from backend when component loads
    useEffect(() => {
        const fetchSavedGenres = async () => {
            if (!userProfile?.userId) {
                setFetchingGenres(false);
                return;
            }

            // First, try to use genres from context if available
            if (userProfile.selectedGenres && userProfile.selectedGenres.length > 0) {
                console.log("Using genres from context:", userProfile.selectedGenres);
                setSelectedGenres(userProfile.selectedGenres);
                setFetchingGenres(false);
                return;
            }

            try {
                setFetchingGenres(true);
                console.log("Fetching genres from API for userId:", userProfile.userId);
                const savedGenres = await genrePreferencesApi.getGenrePreferences(userProfile.userId);
                console.log("Received genres from API:", savedGenres);
                
                // Always set genres, even if empty array
                if (Array.isArray(savedGenres)) {
                    // Remove duplicates and set selected genres
                    const uniqueGenres = Array.from(new Set(savedGenres));
                    console.log("Setting selected genres:", uniqueGenres);
                    setSelectedGenres(uniqueGenres);
                    
                    // Also update context if we got genres
                    if (uniqueGenres.length > 0) {
                        updateProfile({ selectedGenres: uniqueGenres });
                    }
                } else {
                    console.warn("API returned non-array genres:", savedGenres);
                    setSelectedGenres([]);
                }
            } catch (err) {
                console.error("Error fetching genre preferences:", err);
                // Show error to user
                setToast({
                    message: "Failed to load saved genres. Please try again.",
                    type: "error",
                });
                setSelectedGenres([]);
            } finally {
                setFetchingGenres(false);
            }
        };

        fetchSavedGenres();
    }, [userProfile?.userId, userProfile?.selectedGenres, updateProfile]);

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
        if (selectedGenres.length >= 3 && userProfile.userId) {
            // Ensure genres is an array of strings and remove duplicates
            const genresArray: string[] = Array.isArray(selectedGenres) 
                ? Array.from(new Set(selectedGenres.filter((g): g is string => typeof g === "string")))
                : [];

            if (genresArray.length < 3) {
                setToast({
                    message: "Please select at least 3 genres.",
                    type: "error",
                });
                return;
            }

            setLoading(true);
            setToast(null);

            try {
                console.log("Saving genres:", genresArray);
                console.log("For userId:", userProfile.userId);
                
                // Save genre preferences to backend FIRST
                await genrePreferencesApi.saveGenrePreferences(userProfile.userId, genresArray);
                console.log("Successfully saved genres to backend");

                // Update UI after successful save
                updateProfile({ selectedGenres: genresArray });

                // Show success message
                setToast({
                    message: isEditMode ? "Genre preferences updated successfully!" : "Genre preferences saved!",
                    type: "success",
                });

                // Navigate after a short delay to show success message
                setTimeout(() => {
                    setLoading(false);
                    if (isEditMode) {
                        navigate("/profile");
                    } else {
                        navigate("/rate-books");
                    }
                }, 800);
            } catch (err) {
                console.error("Failed to save genre preferences:", err);
                setToast({
                    message: "Failed to save preferences. Please try again.",
                    type: "error",
                });
                setLoading(false);
            }
        }
    };

    const isContinueEnabled = selectedGenres.length >= 3;

    if (fetchingGenres) {
        return (
            <div className="genres-page page-fade">
                <div className="genres-content">
                    <div className="genres-selection-info">
                        <p className="genres-selection-count">Loading your saved genres...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="genres-page page-fade">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="genres-content">
                <h1 className="genres-title">{isEditMode ? "Edit your favorite genres" : "What do you love to read?"}</h1>
                <p className="genres-subtitle">
                    {isEditMode
                        ? "Update at least 3 genres to refine your recommendations"
                        : "Select at least 3 genres to personalize your recommendations"}
                </p>

                <div className="genres-selection-info">
                    <p className="genres-selection-count">
                        {selectedGenres.length} of {GENRES.length} genres selected
                        {selectedGenres.length < 3 && (
                            <span className="genres-min-required"> (Select at least 3 to continue)</span>
                        )}
                    </p>
                </div>

                <div className="genres-grid">
                    {GENRES.map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                            <button
                                key={genre}
                                type="button"
                                className={`genre-chip ${isSelected ? "genre-chip-selected" : ""}`}
                                onClick={() => toggleGenre(genre)}
                                disabled={loading}
                                aria-pressed={isSelected}
                            >
                                {isSelected && <span className="genre-checkmark">✓</span>}
                                <span className="genre-label">{genre}</span>
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