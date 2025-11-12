import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGenres.length >= 3) {
      navigate("/rate-books");
    }
  };

  const isContinueEnabled = selectedGenres.length >= 3;

  return (
    <div className="genres-page page-fade">
      <div className="genres-content">
        <h1 className="genres-title">What do you love to read?</h1>
        <p className="genres-subtitle">
          Select at least 3 genres to personalize your recommendations
        </p>

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
          disabled={!isContinueEnabled}
        >
          Continue ({selectedGenres.length}/3 selected)
        </button>
      </div>
    </div>
  );
}

