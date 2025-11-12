import { useState } from "react";
import "../css/FiltersSidebar.css";

export interface Filters {
  pageLength: string[];
  minRating: string[];
  maturity: string[];
}

interface FiltersSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    pageLength: true,
    minRating: true,
    maturity: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (category: keyof Filters, value: string) => {
    const currentFilters = filters[category];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((f) => f !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...filters,
      [category]: newFilters,
    });
  };

  return (
    <div className="filters-sidebar">
      <h2 className="filters-title">Filters</h2>

      <div className="filters-section">
        <button
          className="filters-section-header"
          onClick={() => toggleSection("pageLength")}
        >
          <span>Page Length</span>
          <span className={`filters-caret ${expandedSections.pageLength ? "filters-caret-up" : ""}`}>
            ▼
          </span>
        </button>
        {expandedSections.pageLength && (
          <div className="filters-options">
            {["0-200 pages", "200-400 pages", "400-600 pages", "600+ pages"].map((option) => (
              <label key={option} className="filters-option">
                <input
                  type="checkbox"
                  checked={filters.pageLength.includes(option)}
                  onChange={() => toggleFilter("pageLength", option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filters-section">
        <button
          className="filters-section-header"
          onClick={() => toggleSection("minRating")}
        >
          <span>Min Rating</span>
          <span className={`filters-caret ${expandedSections.minRating ? "filters-caret-up" : ""}`}>
            ▼
          </span>
        </button>
        {expandedSections.minRating && (
          <div className="filters-options">
            {["5 Stars", "4+ Stars", "3+ Stars", "2+ Stars"].map((option) => (
              <label key={option} className="filters-option">
                <input
                  type="checkbox"
                  checked={filters.minRating.includes(option)}
                  onChange={() => toggleFilter("minRating", option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filters-section">
        <button
          className="filters-section-header"
          onClick={() => toggleSection("maturity")}
        >
          <span>Maturity</span>
          <span className={`filters-caret ${expandedSections.maturity ? "filters-caret-up" : ""}`}>
            ▼
          </span>
        </button>
        {expandedSections.maturity && (
          <div className="filters-options">
            {["Young Adult", "Adult", "Children", "All Ages"].map((option) => (
              <label key={option} className="filters-option">
                <input
                  type="checkbox"
                  checked={filters.maturity.includes(option)}
                  onChange={() => toggleFilter("maturity", option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

