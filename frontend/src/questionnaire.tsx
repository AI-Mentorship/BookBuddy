import React, { useState } from "react";
import "./questionnaire.css";

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
  "Children’s",
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
  "Education / Academic"
];

interface QuestionnaireProps {
  onDashboard: () => void;
  onBack: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onDashboard, onBack }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="questionnaire-container">
      <h1 className="title">BookBuddy</h1>
      <div className="question-box frosted-glass">
        <h2>Select all the genres you love. We’ll tailor recommendations just for you.</h2>
        <div className="genres-grid">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${selected.includes(genre) ? "selected" : ""}`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="btn-group">
          <button className="back-btn" onClick={onBack}>
            Back to Sign In
          </button>
          <button
            className={`dashboard-btn ${selected.length ? "" : "disabled"}`}
            onClick={selected.length ? onDashboard : undefined}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;